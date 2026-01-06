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

            // Create customer display window
            log_message(&log_handle, "INFO", "Creating customer display window...");
            match create_display_window(&app_handle, &log_handle) {
                Ok(_) => {
                    log_message(&log_handle, "INFO", "Display window created successfully");
                }
                Err(e) => {
                    log_message(&log_handle, "WARN", &format!("Failed to create display window: {}", e));
                    // Non-fatal error - continue without display window
                }
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

    // Try multiple possible locations for mongod.exe
    // Tauri bundles resources with their relative path structure preserved
    let possible_paths = vec![
        // When bundled with "resources/mongodb/mongod.exe" in tauri.conf.json
        resource_dir.join("resources").join("mongodb").join("mongod.exe"),
        // Alternative: directly in mongodb folder
        resource_dir.join("mongodb").join("mongod.exe"),
        // Fallback: directly in resource dir
        resource_dir.join("mongod.exe"),
    ];
    
    let mut mongod_path = None;
    for path in &possible_paths {
        log_message(log_file, "INFO", &format!("Checking for mongod.exe at: {}", path.display()));
        if path.exists() {
            mongod_path = Some(path.clone());
            log_message(log_file, "INFO", &format!("Found mongod.exe at: {}", path.display()));
            break;
        }
    }
    
    let mongod_path = match mongod_path {
        Some(path) => path,
        None => {
            // List what's actually in the resource directory (recursively up to 2 levels)
            let mut dir_contents = String::new();
            fn list_dir_recursive(path: &PathBuf, prefix: &str, depth: u32, output: &mut String) {
                if depth > 2 { return; }
                if let Ok(entries) = std::fs::read_dir(path) {
                    for entry in entries.flatten() {
                        let entry_path = entry.path();
                        let name = entry.file_name().to_string_lossy().to_string();
                        if entry_path.is_dir() {
                            output.push_str(&format!("{}[{}]/\n", prefix, name));
                            list_dir_recursive(&entry_path, &format!("{}  ", prefix), depth + 1, output);
                        } else {
                            output.push_str(&format!("{}{}\n", prefix, name));
                        }
                    }
                }
            }
            list_dir_recursive(&resource_dir, "  ", 0, &mut dir_contents);
            
            let error = format!(
                "mongod.exe not found in any expected location.\n\n\
                Searched locations:\n{}\n\n\
                Resource directory ({}):\n{}\n\n\
                Please make sure MongoDB is bundled correctly.\n\
                Expected location: desktop/src-tauri/resources/mongodb/mongod.exe",
                possible_paths.iter().map(|p| format!("  - {}", p.display())).collect::<Vec<_>>().join("\n"),
                path_to_string(&resource_dir),
                dir_contents
            );
            log_message(log_file, "ERROR", &error);
            return Err(error);
        }
    };
    
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
    // Try multiple possible locations (Tauri preserves the relative path structure)
    let possible_backend_dirs = vec![
        resource_dir.join("resources").join("backend"),
        resource_dir.join("backend"),
    ];
    
    let mut backend_dir = None;
    let mut main_js = None;
    
    for dir in &possible_backend_dirs {
        let js_path = dir.join("dist").join("main.js");
        log_message(log_file, "INFO", &format!("Checking for backend at: {}", path_to_string(&js_path)));
        if js_path.exists() {
            backend_dir = Some(dir.clone());
            main_js = Some(js_path);
            log_message(log_file, "INFO", &format!("Found backend at: {}", path_to_string(dir)));
            break;
        }
    }
    
    let backend_dir = backend_dir.ok_or_else(|| {
        let error = format!(
            "Backend main.js not found in any expected location.\n\n\
            Searched locations:\n{}\n\n\
            Please make sure the backend is built and bundled correctly.\n\
            Expected: desktop/src-tauri/resources/backend/dist/main.js",
            possible_backend_dirs.iter()
                .map(|p| format!("  - {}", p.join("dist").join("main.js").display()))
                .collect::<Vec<_>>()
                .join("\n")
        );
        log_message(log_file, "ERROR", &error);
        error
    })?;
    
    let main_js = main_js.unwrap();
    
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

fn create_display_window(app: &tauri::AppHandle, log_file: &Arc<Mutex<Option<std::fs::File>>>) -> Result<(), String> {
    use tauri::Manager;
    
    log_message(log_file, "INFO", "Attempting to create display window...");
    
    // Get all available monitors
    let monitors = app.available_monitors()
        .map_err(|e| format!("Failed to get monitors: {}", e))?;
    
    let monitor_count = monitors.len();
    log_message(log_file, "INFO", &format!("Found {} monitor(s)", monitor_count));
    
    // Determine target monitor and position
    let (position, size) = if monitor_count >= 2 {
        // Use second monitor if available
        let second_monitor = &monitors[1];
        let monitor_pos = second_monitor.position();
        let monitor_size = second_monitor.size();
        
        log_message(
            log_file, 
            "INFO", 
            &format!(
                "Second monitor - Position: ({}, {}), Size: {}x{}",
                monitor_pos.x, monitor_pos.y,
                monitor_size.width, monitor_size.height
            )
        );
        
        (
            tauri::Position::Physical(tauri::PhysicalPosition {
                x: monitor_pos.x,
                y: monitor_pos.y,
            }),
            tauri::Size::Physical(tauri::PhysicalSize {
                width: monitor_size.width,
                height: monitor_size.height,
            })
        )
    } else {
        // Fallback to primary monitor with offset
        log_message(log_file, "INFO", "Only one monitor detected, using offset position");
        
        (
            tauri::Position::Physical(tauri::PhysicalPosition { x: 100, y: 100 }),
            tauri::Size::Physical(tauri::PhysicalSize { width: 1920, height: 1080 })
        )
    };
    
    // Create the display window
    let display_window = tauri::WindowBuilder::new(
        app,
        "display",
        tauri::WindowUrl::App("/display".into())
    )
    .title("Customer Display")
    .position(position.x, position.y)
    .inner_size(size.width, size.height)
    .fullscreen(monitor_count >= 2) // Only fullscreen if we have a second monitor
    .decorations(false)
    .resizable(false)
    .always_on_top(false)
    .skip_taskbar(true)
    .build()
    .map_err(|e| format!("Failed to build display window: {}", e))?;
    
    log_message(log_file, "INFO", "Display window created successfully!");
    
    // If we have multiple monitors and we're not in fullscreen mode, try to maximize on second monitor
    if monitor_count >= 2 {
        let _ = display_window.set_fullscreen(true);
        log_message(log_file, "INFO", "Display window set to fullscreen on second monitor");
    } else {
        log_message(log_file, "INFO", "Display window created in windowed mode (can be moved manually)");
    }
    
    Ok(())
}
