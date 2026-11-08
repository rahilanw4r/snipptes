# Snippets ✂️

A sleek, lightweight Chrome Extension (Manifest V3) for clipping, organizing, and managing web snippets, text quotes, links, and images with ease.

![Snippets Preview](icons/icon128.png)

## ✨ Features

- **Right-Click Web Clipper**: Quickly save selections, links, images, or entire pages via context menu.
- **Pin & Organize**: Pin important snippets to keep them pinned at the top.
- **Drag & Drop Reordering**: Reorder snippets effortlessly within pinned or recent groups.
- **Instant Search & Category Filters**: Filter by Text, Links, Images, or Pages, and perform real-time search across content, titles, and URLs.
- **In-place Editing**: Update snippet text or source labels whenever needed.
- **Batch Selection & Bulk Delete**: Enter selection mode to clean up multiple items simultaneously.
- **Import & Export Backups**: Export all snippets to JSON for safekeeping and import backups anytime.
- **Modern Dark UI**: Carefully crafted dark interface with smooth transitions, custom scrollbars, and toast feedback.

## 🚀 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/rahilanw4r/snipptes.git
   ```
2. Open your Chromium-based browser (Google Chrome, Brave, Edge, Arc, etc.).
3. Navigate to `chrome://extensions/` (or `edge://extensions/`).
4. Enable **Developer mode** toggle in the top-right corner.
5. Click **Load unpacked** and select the cloned `Snippets` folder.
6. The Snippets icon will appear in your browser toolbar!

## 🛠️ Tech Stack & Architecture

- **Manifest V3**: Compliant with latest Chrome Web Store standards.
- **Vanilla JavaScript (ES6+)**: Zero external dependencies, ultra-fast performance.
- **Chrome Storage API**: Synchronized local persistence via `chrome.storage.local`.
- **Context Menus API**: Lightweight background service worker integration for one-click clipping.

## 📄 License

MIT License. Feel free to use, modify, and distribute.
