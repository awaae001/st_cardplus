#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod image_service;
mod export_service;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      image_service::upload_image_to_hosting,
      export_service::save_binary_file
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
