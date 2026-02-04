# Twitter Bookmark Organizer Extension
# Development Notes

## Quick Start

### Load Extension in Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode" 
3. Click "Load unpacked"
4. Select this folder

### Test the Extension
1. Load the extension
2. **Dashboard**: Click Extension Icon → "Open Dashboard"
3. **Sync**: Go to twitter.com/i/bookmarks → Click "Sync to Organizer"
4. **Organize**: Use Dashboard to drag/drop, tag, and edit.

## File Structure

- `manifest.json` - Extension config
- `background.js` - Service worker (requires `storage.js`)
- `storage.js` - IndexedDB wrapper
- `content.js` - Injected into Twitter pages
- `popup/` - Browser action popup
- `dashboard/` - Main Dashboard Application
- `sidebar/` - Sidebar styles for Twitter
- `styles/` - Global CSS variables
- `icons/` - Extension icons

## Known Limitations (V1.0)

1. **Manual Sync Required** - Must click "Sync" to scrape new bookmarks (Limitation of local-only architecture)
2. **Selector Fragility** - Twitter class names are obfuscated (React Native web), so CSS selectors in `content.js` may break if Twitter updates UI.

## Future Roadmap (Post-V1)

- [ ] **Cross-Browser Support**: Port to Firefox and Edge (requires Manifest V2 adjust for Firefox)
- [ ] **Cloud Sync**: Optional cloud backup layer (Paid feature?)
- [ ] **AI Auto-Tagging**: Integrate LLM to auto-tag bookmarks based on content
- [ ] **Theme Customization**: Allow users to pick accent colors

## Debugging

Check the following if issues occur:

1. **Background errors**: Open `chrome://extensions/` → Click "Service Worker" under extension
2. **Content script errors**: Open DevTools on Twitter page
3. **Popup errors**: Right-click extension icon → "Inspect popup"
4. **Storage**: Check IndexedDB in DevTools → Application tab

## API Reference

### Message API (chrome.runtime.sendMessage)

All requests return: `{ success: boolean, data?: any, error?: string }`

#### Bookmarks
- `{ action: 'saveBookmark', data: Bookmark }`
- `{ action: 'getBookmarks' }`
- `{ action: 'getBookmarksByFolder', folderId: string }`
- `{ action: 'deleteBookmark', id: string }`
- `{ action: 'searchBookmarks', query: string }`

#### Folders
- `{ action: 'createFolder', data: Folder }`
- `{ action: 'getFolders' }`
- `{ action: 'updateFolder', data: Folder }`
- `{ action: 'deleteFolder', id: string }`

#### Tags
- `{ action: 'createTag', data: Tag }`
- `{ action: 'getTags' }`

#### Data Management
- `{ action: 'exportData' }` - Returns full export
- `{ action: 'importData', data: ExportData }`
- `{ action: 'getStats' }` - Returns stats for popup

## Data Models

```javascript
Bookmark {
  id: string
  tweetId: string
  author: string
  content: string
  url: string
  createdAt: number (timestamp)
  media: Array<{type, url}>
  folderId: string
  tags: string[]
  notes: string
}

Folder {
  id: string
  name: string
  parentId: string | null
  color: string (hex)
  createdAt: number
}

Tag {
  id: string
  name: string
  color: string (hex)
}
```
