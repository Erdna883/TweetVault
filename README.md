# TweetVault


A free, open-source browser extension that lets you organize your Twitter/X bookmarks with folders, tags, and powerful search - no subscription required!

## ✨ Features

- 📁 **Folder Organization** - Create custom folders to organize your bookmarks
- 🏷️ **Tag System** - Add tags to bookmarks for easy categorization
- 🖱️ **Drag & Drop** - Moving bookmarks to folders is as easy as dragging them
- 🖥️ **Full Dashboard** - Manage your library in a beautiful, full-screen interface
- ✏️ **Edit & Note** - Add personal notes and update tags via the Edit Modal
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
   git clone https://github.com/Erdna883/TweetVault.git
   cd TweetVault
   ```

2. **Load in Chrome/Edge**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `TweetVault` directory

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

### 2. Organize with Folders & Drag-Drop

- **Create Folders**: Click "New Folder" in the sidebar
- **Drag & Drop**: Drag any bookmark card from the grid onto a folder in the sidebar to move it
- **Edit**: Click the "Edit" (pencil) icon on any bookmark to add Notes or Tags
- **Delete**: Remove bookmarks (moves to Trash/deleted from Extension only)

### 3. Search & Filter

- Use the search bar in the sidebar to find bookmarks instantly
- Search by tweet content, author, tags, or your personal notes
- **Shortcuts**: Press `/` or `Cmd+K` to focus search instantly

### 4. Export Your Data

- Click "Settings" (Gear Icon) in the Dashboard sidebar
- Choose Export JSON (Backup) or CSV
- Your data is yours - export anytime!

### 5. Import Data

- Click "Settings" -> "Import Data"
- Select a previously exported JSON file

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

## 🆚 Why TweetVault?

| Feature | TweetVault | Dewey (Paid) | Twitter Native |
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

### Architecture

```
TweetVault/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (message handling, storage)
├── storage.js            # IndexedDB wrapper
├── content.js            # Twitter page integration
├── dashboard/            # Dashboard App (Vue-like without framework)
│   ├── dashboard.html
│   ├── dashboard.css
│   └── dashboard.js
├── popup/                # Extension popup UI
├── sidebar/              # Sidebar injected into Twitter
├── styles/               # Shared styles
└── icons/                # Extension icons
```

### Project Status

**V1.0 - Feature Complete** ✅
- [x] Full Dashboard & Sidebar
- [x] Drag & Drop Organization
- [x] Edit Modal (Tags, Notes)
- [x] Search & Filter
- [x] Export/Import
- [x] Keyboard Shortcuts

**Future Roadmap (Startup Phase)** 🚀
- [ ] AI Auto-Tagging
- [ ] Cloud Sync
- [ ] Content Studio


## 🤝 Contributing

Contributions are welcome! This is an open-source project built to help the community.

## 📝 License

MIT License - Feel free to use, modify, and distribute!

## 🙏 Credits

Built with ❤️ as a free alternative to paid bookmark organizers like Dewey.

Inspired by the need for affordable tools to manage Twitter/X bookmarks.

---

**Made for the community, by the community. Always free. Always open.**
