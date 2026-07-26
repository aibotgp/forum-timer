// Forum Timer — desktop wrapper.
//
// The entire application is the bundled index.html. This process exists only to
// host a system webview, so there are no commands, no plugins and no IPC: the
// desktop build behaves exactly like the hosted one, and its history lives in
// the webview's own local storage on this machine.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Forum Timer");
}
