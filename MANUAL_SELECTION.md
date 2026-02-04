# Manual Tweet Selection Feature

## Overview

Instead of bulk syncing all bookmarks, you can now **manually select individual tweets** to save to specific folders!

## How It Works

### Visual Indicator
A **bookmark icon button** now appears on every tweet in your bookmarks, right next to the like/retweet/share buttons.

### Saving a Tweet

1. **Navigate** to `twitter.com/i/bookmarks`
2. **Look for the bookmark icon** on any tweet (in the action bar)
3. **Click the bookmark icon**
4. A modal appears showing:
   - Preview of the tweet (author + content excerpt)
   - List of all your folders
   - "Create New Folder" button
5. **Select a folder** to save the tweet to that folder
6. **Or create a new folder** on the spot and save there

### Benefits

✅ **Selective Control** - Choose exactly which tweets to save  
✅ **Instant Organization** - Pick the folder as you save  
✅ **No Bulk Sync Needed** - Save tweets one-by-one as you browse  
✅ **Curate Collections** - Build focused, hand-picked collections  
✅ **Avoid Outdated Content** - Only save what's still relevant  

## Use Cases

**Curated Research**
- Browse your bookmarks
- Only save the most valuable ones to "Research" folder
- Skip outdated or less relevant content

**Topic Collections**
- See a crypto tweet? → Save to "Crypto" folder immediately
- See a design inspiration? → Save to "Design" folder
- Build focused, quality collections

**Avoid Clutter**
- Don't sync everything
- Manually pick the gems
- Keep your library clean and curated

## Comparison

| Method | When to Use |
|--------|-------------|
| **Bulk Sync** | First-time setup, sync all bookmarks at once |
| **Keyword Sync** | Filter by topic during sync (e.g., only "crypto" tweets) |
| **Manual Selection** | Hand-pick individual tweets as you browse |

## Tips

1. **Combine methods**: Bulk sync first, then use manual selection for new bookmarks
2. **Quality over quantity**: Manually select only the best tweets
3. **Organize as you go**: Save and categorize in one action
4. **Create folders on-the-fly**: Don't need to pre-create folders

## Technical Details

- **Button Location**: Injected into tweet action bar (alongside like/retweet)
- **Dynamic Loading**: Mutation observer ensures buttons appear on newly loaded tweets
- **Auto-extraction**: Tweet content, author, media, and timestamp automatically extracted
- **Instant Save**: No page reload needed, saves immediately to IndexedDB

---

**Perfect for users who want full control over their bookmark collection!**
