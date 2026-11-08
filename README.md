<div align="center">

<img src="icons/icon128.png" alt="Snippets Logo" width="96" height="96" />

# Snippets

**A fast, private, and lightweight web clipper & snippet manager for Chromium browsers.**

[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Vanilla JS](https://img.shields.io/badge/Built_with-Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Privacy Friendly](https://img.shields.io/badge/Data_Privacy-100%25_Local-green?style=flat-square)](https://github.com/rahilanw4r/snipptes)

*Capture quotes, code blocks, reference links, and images across the web with a single right-click — organized, searchable, and always at your fingertips.*

---

</div>

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Installation Guide](#-installation-guide)
- [Usage & Shortcuts](#-usage--shortcuts)
- [Data Privacy & Storage](#-data-privacy--storage)
- [Project Structure](#-project-structure)
- [Development & Customization](#-development--customization)
- [License](#-license)

---

## 💡 Overview

**Snippets** is an extension built to eliminate context switching while browsing and researching. Instead of maintaining messy scratchpads or switching to note-taking apps, you can save web contents in real time and find them instantly in a sleek, non-intrusive popup.

No external tracking, no backend server, no cloud sync lock-in — everything lives entirely inside your browser's local sandbox.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **🖱️ One-Click Clipper** | Right-click any selected text, image, link, or page to clip directly into your library. |
| **📌 Pin to Top** | Pin essential notes or frequently referenced links to keep them always visible at the top. |
| **✋ Drag & Drop Reordering** | Smoothly rearrange cards inside your Pinned or Recent sections. |
| **⚡ Real-Time Search** | Fast, instant search matching across snippet bodies, titles, and source URLs. |
| **🏷️ Category Filters** | Filter with a single tap: `All`, `Text`, `Links`, `Images`, and `Pages`. |
| **✏️ In-Place Editor** | Adjust snippet content or edit custom title and source metadata directly in the extension. |
| **☑️ Batch Selection** | Enter Multi-Select Mode to remove multiple snippets at once. |
| **💾 JSON Backup & Restore** | Export full backups into standard JSON files and restore anytime with collision-safe IDs. |
| **🌙 Modern Dark Theme** | Polished, distraction-free interface matching system dark modes with subtle animations. |

---

## 🔍 How It Works

```
  ┌────────────────────────┐
  │  Web Page (Any Tab)    │
  └───────────┬────────────┘
              │  Right-Click Context Menu
              ▼
  ┌────────────────────────┐
  │  Background Worker     │  (background.js)
  │  Captures text/img/url │
  └───────────┬────────────┘
              │  chrome.storage.local
              ▼
  ┌────────────────────────┐
  │  Local Storage         │  100% on your machine
  └───────────┬────────────┘
              │  Synchronized
              ▼
  ┌────────────────────────┐
  │  Snippets Popup UI     │  (popup.html / popup.js / popup.css)
  │  Search, Pin, Reorder  │
  └────────────────────────┘
```

---

## 🚀 Installation Guide

### Manual Unpacked Installation (All Chromium Browsers)

Works on **Google Chrome**, **Brave**, **Microsoft Edge**, **Arc**, **Vivaldi**, and **Opera**.

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/rahilanw4r/snipptes.git
   ```
   *(or download as a `.zip` archive from GitHub and extract it)*.

2. **Open Extensions Manager**:
   - In Chrome / Brave: Navigate to `chrome://extensions/`
   - In Edge: Navigate to `edge://extensions/`

3. **Enable Developer Mode**:
   - Toggle the switch labeled **Developer mode** in the upper-right corner.

4. **Load Unpacked**:
   - Click the **Load unpacked** button in the top left.
   - Choose the `Snippets` project folder.

5. **Pin to Toolbar**:
   - Click the puzzle piece icon (Extensions) in your browser toolbar and pin **Snippets** for quick access.

---

## ⌨️ Usage & Shortcuts

### Clipping Content
- **Clip Text**: Select any text on a webpage $\rightarrow$ Right-click $\rightarrow$ **Save selection to Snippets**.
- **Clip Link**: Right-click any hyperlink $\rightarrow$ **Save link to Snippets**.
- **Clip Image**: Right-click any picture $\rightarrow$ **Save image to Snippets**.
- **Clip Entire Page**: Right-click anywhere on the page $\rightarrow$ **Save page to Snippets**.

### Managing Snippets
- **Copy**: Click the **Copy** button on any card to copy its content to your clipboard.
- **Pin / Unpin**: Click the pin icon to toggle priority ranking.
- **Reorder**: Grab the drag handle on the upper right of any card to reorder items within its section.
- **Edit**: Click the pencil icon to modify text or title.
- **Dismiss Modals**: Press `Esc` or click anywhere on the background overlay to close active modals.
- **Batch Delete**: Click the checklist button in the header, select items, and delete in bulk.

---

## 🔒 Data Privacy & Storage

- **Zero External Requests**: The extension makes zero network calls to 3rd-party servers or tracking services.
- **Local Persistence**: Snippets are stored locally via Chromium's sandboxed `chrome.storage.local` API.
- **Full Ownership**: You can export your data as standard JSON at any time from **Settings & Data** $\rightarrow$ **Export**.

---

## 📁 Project Structure

```text
Snippets/
├── background.js       # Manifest V3 service worker & context menu listener
├── manifest.json       # Extension configuration, permissions & metadata
├── popup.html          # Main UI markup with modal templates & filter tabs
├── popup.css           # Modern dark-mode styling, animations & layout
├── popup.js            # Core UI controller, drag & drop, search & backup logic
├── icons/              # Multi-resolution icons (16px, 32px, 48px, 128px)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── .gitignore          # Git exclusion rules
└── README.md           # Documentation
```

---

## 🛠️ Development & Customization

Snippets has **zero build steps** and **zero node dependencies**. You can edit any HTML, CSS, or JS file directly:

1. Make edits to `popup.js`, `popup.css`, or `popup.html`.
2. Go to `chrome://extensions/` and click the **Reload (↻)** icon on the Snippets card.
3. Open the extension popup to see changes instantly!

---

## 📄 License

Distributed under the [MIT License](LICENSE). You are free to modify, distribute, and integrate this software into your personal or commercial workflows.

---

<div align="center">
  <sub>Built with care by <a href="https://github.com/rahilanw4r">Rahil Anwar</a></sub>
</div>
