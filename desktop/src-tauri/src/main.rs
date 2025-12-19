// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use std::thread;
use std::net::TcpStream;
use std::path::PathBuf;

// Global state for child processes
struct AppState {
    mongodb_process: Arc<Mutex<Option<Child>>>,
    backend_process: Arc<Mutex<Option<Child>>>,
}

impl AppState {
    fn new() -> Self {
        Self {
            mongodb_process: Arc::new(Mutex::new(None)),
            backend_process: Arc::new(Mutex::new(None)),
        }
    }
}

fn main() {
    let app_state = AppState::new();
    let mongodb_handle = app_state.mongodb_process.clone();
    let backend_handle = app_state.backend_process.clone();

    tauri::Builder::default()
        .setup(move |app| {
            let app_handle = app.handle();
            
            // Start MongoDB
            println!("[STARTUP] Starting MongoDB...");
            match start_mongodb(&app_handle) {
                Ok(child) => {
                    *mongodb_handle.lock().unwrap() = Some(child);
                    println!("[STARTUP] MongoDB process started");
                }
                Err(e) => {
                    eprintln!("[ERROR] Failed to start MongoDB: {}", e);
                    return Err(Box::new(std::io::Error::new(
                        std::io::ErrorKind::Other,
                        format!("MongoDB startup failed: {}", e),
                    )));
                }
            }

            // Wait for MongoDB to be ready
            println!("[STARTUP] Waiting for MongoDB to be ready...");
            if !wait_for_port("127.0.0.1", 27017, 30) {
                eprintln!("[ERROR] MongoDB failed to start within timeout");
                return Err(Box::new(std::io::Error::new(
                    std::io::ErrorKind::TimedOut,
                    "MongoDB did not start in time",
                )));
            }
            println!("[STARTUP] MongoDB is ready!");

            // Start Backend
            println!("[STARTUP] Starting NestJS backend...");
            match start_backend(&app_handle) {
                Ok(child) => {
                    *backend_handle.lock().unwrap() = Some(child);
                    println!("[STARTUP] Backend process started");
                }
                Err(e) => {
                    eprintln!("[ERROR] Failed to start backend: {}", e);
                    return Err(Box::new(std::io::Error::new(
                        std::io::ErrorKind::Other,
                        format!("Backend startup failed: {}", e),
                    )));
                }
            }

            // Wait for backend to be ready
            println!("[STARTUP] Waiting for backend to be ready...");
            if !wait_for_port("127.0.0.1", 3001, 30) {
                eprintln!("[ERROR] Backend failed to start within timeout");
            } else {
                println!("[STARTUP] Backend is ready!");
            }

            println!("[STARTUP] All services started successfully!");
            Ok(())
        })
        .on_window_event(move |event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event.event() {
                println!("[SHUTDOWN] Application closing...");
                
                // Stop backend first
                if let Ok(mut backend) = app_state.backend_process.lock() {
                    if let Some(mut child) = backend.take() {
                        println!("[SHUTDOWN] Stopping backend...");
                        let _ = child.kill();
                        let _ = child.wait();
                    }
                }

                // Then stop MongoDB
                if let Ok(mut mongodb) = app_state.mongodb_process.lock() {
                    if let Some(mut child) = mongodb.take() {
                        println!("[SHUTDOWN] Stopping MongoDB...");
                        let _ = child.kill();
                        thread::sleep(Duration::from_secs(2)); // Give time for clean shutdown
                        let _ = child.wait();
                    }
                }

                println!("[SHUTDOWN] All services stopped");
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn start_mongodb(app: &tauri::AppHandle) -> Result<Child, String> {
    // Get paths
    let resource_dir = app
        .path_resolver()
        .resource_dir()
        .ok_or("Failed to get resource directory")?;
    
    let app_data_dir = app
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data directory")?;

    let mongod_path = resource_dir.join("mongodb").join("mongod.exe");
    let config_path = resource_dir.join("mongodb").join("mongod.cfg");
    
    // Create data directories
    let db_path = app_data_dir.join("data").join("db");
    let log_path = app_data_dir.join("data").join("logs");
    
    std::fs::create_dir_all(&db_path)
        .map_err(|e| format!("Failed to create db directory: {}", e))?;
    std::fs::create_dir_all(&log_path)
        .map_err(|e| format!("Failed to create log directory: {}", e))?;

    let log_file = log_path.join("mongodb.log");

    // Build mongod command
    let mut cmd = Command::new(&mongod_path);
    cmd.args(&[
        "--dbpath",
        db_path.to_str().unwrap(),
        "--logpath",
        log_file.to_str().unwrap(),
        "--bind_ip",
        "127.0.0.1",
        "--port",
        "27017",
        "--logappend",
    ]);

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

fn start_backend(app: &tauri::AppHandle) -> Result<Child, String> {
    let resource_dir = app
        .path_resolver()
        .resource_dir()
        .ok_or("Failed to get resource directory")?;
    
    let app_data_dir = app
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data directory")?;

    // Backend should be bundled in resources/backend
    let backend_dir = resource_dir.join("backend");
    let main_js = backend_dir.join("dist").join("main.js");

    if !main_js.exists() {
        return Err(format!(
            "Backend main.js not found at: {}",
            main_js.display()
        ));
    }

    // Find Node.js
    let node_cmd = if cfg!(target_os = "windows") {
        "node.exe"
    } else {
        "node"
    };

    let mut cmd = Command::new(node_cmd);
    cmd.arg(main_js)
        .current_dir(&backend_dir)
        .env("DESKTOP_MODE", "true")
        .env("MONGODB_URI", "mongodb://127.0.0.1:27017/cafe_pos")
        .env("PORT", "3001")
        .env("NODE_ENV", "production");

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
        .map_err(|e| format!("Failed to spawn backend process: {}", e))
}

fn wait_for_port(host: &str, port: u16, timeout_secs: u64) -> bool {
    let addr = format!("{}:{}", host, port);
    let start = std::time::Instant::now();
    let timeout = Duration::from_secs(timeout_secs);

    while start.elapsed() < timeout {
        if TcpStream::connect_timeout(
            &addr.parse().unwrap(),
            Duration::from_secs(1),
        )
        .is_ok()
        {
            return true;
        }
        thread::sleep(Duration::from_millis(500));
    }

    false
}
