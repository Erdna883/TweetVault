# Twitter Bookmark Organizer

A free, open-source browser extension that lets you organize your Twitter/X bookmarks with folders, tags, and powerful search - no subscription required!

## ✨ Features

- 📁 **Folder Organization** - Create custom folders to organize your bookmarks
- 🏷️ **Tag System** - Add tags to bookmarks for easy categorization
- 🖥️ **Full Dashboard** - Manage your library in a beautiful, full-screen interface
- 🖱️ **Manual Selection** - Save individual tweets to folders as you browse
- 🎯 **Smart Sync** - Filter by keywords (e.g., "AI", "Crypto") during sync
- 🔍 **Powerful Search** - Search bookmarks by content, author, tags, or notes
- 💾 **Local Storage** - All data stored locally in your browser (privacy-first)
- 📤 **Export/Import** - Export bookmarks to JSON or CSV format
- 🎨 **Dark Theme** - Beautiful dark UI that matches Twitter's design
- ⚡ **Fast & Lightweight** - No backend, no API calls, runs entirely in your browser

## 🚀 Installation

### From Source (Development)

1. **Clone or download this repository**
   ```bash
   cd "/Users/mimi/my startups/mini saas project/twitter bookmark organizer extension"
   ```

2. **Load in Chrome/Edge**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension directory

3. **Load in Firefox**
   - Open `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file

## 📖 How to Use

### 1. Sync Your Bookmarks

1. Click the extension icon in your browser toolbar
2. Click "Go to Twitter" or navigate to [twitter.com/i/bookmarks](https://twitter.com/i/bookmarks)
3. You'll see a sidebar appear on the right side of the page
4. Click the "Sync to Organizer" button in the header (or use the popup)
5. Wait for the sync to complete - all your bookmarks will be saved locally!

### 2. Organize with Folders

- Click "New Folder" in the sidebar to create a folder
- Rename folders by clicking the edit icon
- Delete folders (bookmarks will move to "Uncategorized")
- View folder contents by clicking on a folder name

### 3. Search & Filter

- Use the search bar in the sidebar to find bookmarks instantly
- Search by tweet content, author, tags, or your personal notes
- Results update in real-time as you type

### 4. Export Your Data

- Click the extension icon → "Export Data"
- Choose JSON format for backup or CSV for spreadsheets
- Your data is yours - export anytime, no restrictions!

### 5. Import Data

- Click the extension icon → "Import Data"
- Select a previously exported JSON file
- All bookmarks, folders, and tags will be restored

## 🧠 For Pros: Efficient Workflows

Here are 3 ways to use this tool like a power user:

### Workflow A: The "Topic Collector" (Best for Research)
*Goal: Build a focused library on a specific topic (e.g., "AI Tools")*

1. Go to your Bookmarks page
2. **Right-click** the "Sync" button
3. Select "AI" (or type a custom keyword)
4. The extension will scrape ONLY tweets containing that keyword
5. Result: A clean, noise-free library of just AI tools!

### Workflow B: The "Active Curator" (Best for Daily Browsing)
*Goal: Organize on the fly without accumulating clutter*

1. Browse your bookmarks on Twitter
2. Click the **Bookmark Icon Button** on any tweet you want to keep
3. Select a folder (e.g., "Read Later") immediately
4. Skip the rest
5. Result: Zero backlog, everything organized instantly.

### Workflow C: The "Sunday Review" (Best for Cleanup)
*Goal: Sort through your messy backlog*

1. Run a **Sync All** to capture everything
2. Open the **Dashboard** (Extension Icon → Open Dashboard)
3. Go to "Unsorted" view
4. Bulk review and categorize into folders
5. Delete what you don't need
6. Result: Inbox Zero for your bookmarks!

## 🏗️ Architecture

```
twitter-bookmark-organizer-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (message handling, storage)
├── storage.js            # IndexedDB wrapper
├── content.js            # Twitter page integration
├── popup/                # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── sidebar/              # Sidebar injected into Twitter
│   └── sidebar.css
├── styles/               # Shared styles
│   └── global.css
└── icons/                # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🔒 Privacy

- **100% Local** - All bookmarks are stored in your browser's IndexedDB
- **No Tracking** - We don't collect any data or analytics
- **No Server** - No backend servers, no API calls to external services
- **Open Source** - Inspect the code to see exactly what it does
- **Your Data** - Export anytime in standard formats (JSON, CSV)

## 🆚 Why This Extension?

| Feature | This Extension | Dewey (Paid) | Twitter Native |
|---------|---------------|--------------|----------------|
| Folders | ✅ Free | ✅ $90/year | ❌ $8/month |
| Tags | ✅ Free | ✅ $90/year | ❌ |
| Export | ✅ Free | ✅ $90/year | ❌ |
| Search | ✅ Free | ✅ $90/year | ❌ Limited |
| Privacy | ✅ Local | ⚠️ Cloud | ⚠️ Cloud |
| Cost | ✅ Free | ❌ $90/year | ❌ $96/year |

## 🛠️ Development

### Tech Stack

- **Manifest V3** - Latest Chrome extension format
- **IndexedDB** - Local database storage
- **Vanilla JS** - No frameworks, pure JavaScript
- **Modern CSS** - CSS variables, dark theme, animations

### Project Status

**Phase 1 (MVP)** ✅ - Core functionality complete
- [x] Extension setup and manifest
- [x] IndexedDB storage layer
- [x] Bookmark scraper
- [x] Folder organization
- [x] Basic popup UI
- [x] Sidebar integration

**Phase 2 (Enhancements)** ✅ - Feature complete!
- [x] **Full Dashboard** interface
- [x] **Manual Selection** (Save buttons on tweets)
- [x] **Keyword-based Sync** (Smart filtering)
- [x] Jump to bottom optimization
- [x] Search filters

**Phase 3 (Polish)** 🚧 - In Progress
- [ ] Keyboard shortcuts
- [ ] Settings page
- [ ] Light theme option
- [ ] Browser sync (Chrome Sync API)

## 🤝 Contributing

Contributions are welcome! This is an open-source project built to help the community.

## 📝 License

MIT License - Feel free to use, modify, and distribute!

## 🙏 Credits

Built with ❤️ as a free alternative to paid bookmark organizers like Dewey.

Inspired by the need for affordable tools to manage Twitter/X bookmarks.

---

**Made for the community, by the community. Always free. Always open.**
