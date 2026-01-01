// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use std::thread;
use std::net::TcpStream;
use std::path::PathBuf;
use std::fs::OpenOptions;
use std::io::Write;
use chrono::Local;

// Global state for child processes
struct AppState {
    mongodb_process: Arc<Mutex<Option<Child>>>,
    backend_process: Arc<Mutex<Option<Child>>>,
    log_file: Arc<Mutex<Option<std::fs::File>>>,
}

impl AppState {
    fn new() -> Self {
        Self {
            mongodb_process: Arc::new(Mutex::new(None)),
            backend_process: Arc::new(Mutex::new(None)),
            log_file: Arc::new(Mutex::new(None)),
        }
    }
}

// Helper to safely convert PathBuf to String
fn path_to_string(path: &PathBuf) -> String {
    path.to_string_lossy().to_string()
}

// Logging function that writes to both console and file
fn log_message(log_file: &Arc<Mutex<Option<std::fs::File>>>, level: &str, message: &str) {
    let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S");
    let log_line = format!("[{}] [{}] {}\n", timestamp, level, message);
    
    // Print to console (works in debug mode)
    print!("{}", log_line);
    
    // Write to file
    if let Ok(mut file_option) = log_file.lock() {
        if let Some(file) = file_option.as_mut() {
            let _ = file.write_all(log_line.as_bytes());
            let _ = file.flush();
        }
    }
}

fn show_error_dialog(_app: &tauri::AppHandle, title: &str, message: &str) {
    let _ = tauri::api::dialog::blocking::MessageDialogBuilder::new(title, message)
        .kind(tauri::api::dialog::MessageDialogKind::Error)
        .show();
}


fn main() {
    let app_state = AppState::new();
    let mongodb_handle = app_state.mongodb_process.clone();
    let backend_handle = app_state.backend_process.clone();
    let log_handle = app_state.log_file.clone();
    let log_handle_for_events = log_handle.clone();

    tauri::Builder::default()
        .setup(move |app| {
            let app_handle = app.handle();
            
            // Setup logging
            let app_data_dir = app_handle
                .path_resolver()
                .app_data_dir()
                .unwrap_or_else(|| PathBuf::from("."));
            
            std::fs::create_dir_all(&app_data_dir).ok();
            let log_path = app_data_dir.join("startup.log");
            
            match OpenOptions::new()
                .create(true)
                .append(true)
                .open(&log_path)
            {
                Ok(file) => {
                    *log_handle.lock().unwrap() = Some(file);
                    log_message(&log_handle, "INFO", "=== Application Starting ===");
                    log_message(&log_handle, "INFO", &format!("Log file: {}", path_to_string(&log_path)));
                }
                Err(e) => {
                    eprintln!("Failed to create log file: {}", e);
                }
            }
            
            // Start MongoDB
            log_message(&log_handle, "INFO", "Starting MongoDB...");
            match start_mongodb(&app_handle, &log_handle) {
                Ok(child) => {
                    *mongodb_handle.lock().unwrap() = Some(child);
                    log_message(&log_handle, "INFO", "MongoDB process started");
                }
                Err(e) => {
                    let error_msg = format!("Failed to start MongoDB: {}", e);
                    log_message(&log_handle, "ERROR", &error_msg);
                    show_error_dialog(&app_handle, "MongoDB Startup Error", &error_msg);
                    return Err(Box::new(std::io::Error::new(
                        std::io::ErrorKind::Other,
                        error_msg,
                    )));
                }
            }

            // Wait for MongoDB to be ready
            log_message(&log_handle, "INFO", "Waiting for MongoDB to be ready...");
            if !wait_for_port("127.0.0.1", 27017, 30, &log_handle) {
                let error_msg = "MongoDB failed to start within 30 seconds timeout";
                log_message(&log_handle, "ERROR", error_msg);
                show_error_dialog(&app_handle, "MongoDB Timeout", error_msg);
                return Err(Box::new(std::io::Error::new(
                    std::io::ErrorKind::TimedOut,
                    error_msg,
                )));
            }
            log_message(&log_handle, "INFO", "MongoDB is ready!");

            // Start Backend
            log_message(&log_handle, "INFO", "Starting NestJS backend...");
            match start_backend(&app_handle, &log_handle) {
                Ok(child) => {
                    *backend_handle.lock().unwrap() = Some(child);
                    log_message(&log_handle, "INFO", "Backend process started");
                }
                Err(e) => {
                    let error_msg = format!("Failed to start backend: {}", e);
                    log_message(&log_handle, "ERROR", &error_msg);
                    show_error_dialog(&app_handle, "Backend Startup Error", &error_msg);
                    return Err(Box::new(std::io::Error::new(
                        std::io::ErrorKind::Other,
                        error_msg,
                    )));
                }
            }

            // Wait for backend to be ready
            log_message(&log_handle, "INFO", "Waiting for backend to be ready...");
            if !wait_for_port("127.0.0.1", 3001, 30, &log_handle) {
                let error_msg = "Backend failed to start within 30 seconds timeout";
                log_message(&log_handle, "ERROR", error_msg);
                show_error_dialog(&app_handle, "Backend Timeout", error_msg);
            } else {
                log_message(&log_handle, "INFO", "Backend is ready!");
            }

            log_message(&log_handle, "INFO", "=== All services started successfully! ===");
            Ok(())
        })
        .on_window_event(move |event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event.event() {
                log_message(&log_handle_for_events, "INFO", "Application closing...");
                
                // Stop backend first
                if let Ok(mut backend) = app_state.backend_process.lock() {
                    if let Some(mut child) = backend.take() {
                        log_message(&log_handle_for_events, "INFO", "Stopping backend...");
                        let _ = child.kill();
                        let _ = child.wait();
                    }
                }

                // Then stop MongoDB
                if let Ok(mut mongodb) = app_state.mongodb_process.lock() {
                    if let Some(mut child) = mongodb.take() {
                        log_message(&log_handle_for_events, "INFO", "Stopping MongoDB...");
                        let _ = child.kill();
                        thread::sleep(Duration::from_secs(2)); // Give time for clean shutdown
                        let _ = child.wait();
                    }
                }

                log_message(&log_handle_for_events, "INFO", "=== All services stopped ===");
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn start_mongodb(app: &tauri::AppHandle, log_file: &Arc<Mutex<Option<std::fs::File>>>) -> Result<Child, String> {
    // Get paths
    let resource_dir = app
        .path_resolver()
        .resource_dir()
        .ok_or("Failed to get resource directory")?;
    
    let app_data_dir = app
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data directory")?;

    log_message(log_file, "INFO", &format!("Resource dir: {}", path_to_string(&resource_dir)));
    log_message(log_file, "INFO", &format!("App data dir: {}", path_to_string(&app_data_dir)));

    let mongod_path = resource_dir.join("mongodb").join("mongod.exe");
    
    log_message(log_file, "INFO", &format!("Looking for mongod.exe at: {}", path_to_string(&mongod_path)));
    
    // Check if mongod.exe exists
    if !mongod_path.exists() {
        let error = format!(
            "mongod.exe not found at:\n{}\n\n\
            Please make sure MongoDB is bundled correctly.\n\
            Expected location: desktop/src-tauri/resources/mongodb/mongod.exe",
            path_to_string(&mongod_path)
        );
        log_message(log_file, "ERROR", &error);
        return Err(error);
    }
    
    log_message(log_file, "INFO", "mongod.exe found!");
    
    // Create data directories
    let db_path = app_data_dir.join("data").join("db");
    let log_path = app_data_dir.join("data").join("logs");
    
    log_message(log_file, "INFO", &format!("Creating DB path: {}", db_path.display()));
    std::fs::create_dir_all(&db_path)
        .map_err(|e| format!("Failed to create db directory: {}", e))?;
    
    log_message(log_file, "INFO", &format!("Creating log path: {}", log_path.display()));
    std::fs::create_dir_all(&log_path)
        .map_err(|e| format!("Failed to create log directory: {}", e))?;

    let log_file_path = log_path.join("mongodb.log");

    // Build mongod command
    let mut cmd = Command::new(&mongod_path);
    cmd.args(&[
        "--dbpath",
        db_path.to_str().unwrap(),
        "--logpath",
        log_file_path.to_str().unwrap(),
        "--bind_ip",
        "127.0.0.1",
        "--port",
        "27017",
        "--logappend",
    ]);

    log_message(log_file, "INFO", &format!("Starting MongoDB with dbpath: {}", db_path.display()));

    // Hide console window on Windows
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    cmd.stdout(Stdio::null())
        .stderr(Stdio::null());

    cmd.spawn()
        .map_err(|e| format!("Failed to spawn MongoDB process: {}", e))
}

fn start_backend(app: &tauri::AppHandle, log_file: &Arc<Mutex<Option<std::fs::File>>>) -> Result<Child, String> {
    let resource_dir = app
        .path_resolver()
        .resource_dir()
        .ok_or("Failed to get resource directory")?;

    // Backend should be bundled in resources/backend
    let backend_dir = resource_dir.join("backend");
    let main_js = backend_dir.join("dist").join("main.js");

    log_message(log_file, "INFO", &format!("Looking for backend at: {}", path_to_string(&main_js)));

    if !main_js.exists() {
        let error = format!(
            "Backend main.js not found at:\n{}\n\n\
            Please make sure the backend is built and bundled correctly.\n\
            Expected: desktop/src-tauri/resources/backend/dist/main.js",
            path_to_string(&main_js)
        );
        log_message(log_file, "ERROR", &error);
        return Err(error);
    }
    
    log_message(log_file, "INFO", "Backend main.js found!");

    // Find Node.js
    let node_cmd = if cfg!(target_os = "windows") {
        "node.exe"
    } else {
        "node"
    };
    
    log_message(log_file, "INFO", &format!("Looking for Node.js: {}", node_cmd));

    let mut cmd = Command::new(node_cmd);
    cmd.arg(main_js)
        .current_dir(&backend_dir)
        .env("DESKTOP_MODE", "true")
        .env("MONGODB_URI", "mongodb://127.0.0.1:27017/cafe_pos")
        .env("PORT", "3001")
        .env("NODE_ENV", "production");

    log_message(log_file, "INFO", "Starting backend with Node.js...");

    // Hide console window on Windows
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    cmd.stdout(Stdio::null())
        .stderr(Stdio::null());

    cmd.spawn()
        .map_err(|e| {
            let error = format!(
                "Failed to spawn backend process: {}\n\n\
                This might mean Node.js is not installed or not in PATH.\n\
                Please install Node.js 18+ from nodejs.org",
                e
            );
            log_message(log_file, "ERROR", &error);
            error
        })
}

fn wait_for_port(host: &str, port: u16, timeout_secs: u64, log_file: &Arc<Mutex<Option<std::fs::File>>>) -> bool {
    let addr = format!("{}:{}", host, port);
    let start = std::time::Instant::now();
    let timeout = Duration::from_secs(timeout_secs);

    log_message(log_file, "INFO", &format!("Waiting for port {} (timeout: {}s)", port, timeout_secs));

    while start.elapsed() < timeout {
        if TcpStream::connect_timeout(
            &addr.parse().unwrap(),
            Duration::from_secs(1),
        )
        .is_ok()
        {
            log_message(log_file, "INFO", &format!("Port {} is now available!", port));
            return true;
        }
        thread::sleep(Duration::from_millis(500));
    }

    log_message(log_file, "ERROR", &format!("Timeout waiting for port {}", port));
    false
}
