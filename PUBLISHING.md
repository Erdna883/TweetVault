# 🚀 Publishing Guide: Twitter Bookmark Organizer

## 1. Prepare Archive
Run the packaging script to create a clean zip file:
```bash
./scripts/package.sh
```
This will create `twitter-bookmark-organizer-v1.0.0.zip` in the project root.

## 2. Chrome Web Store (CWS)
1.  Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/dev/dashboard)
2.  Register as a developer ($5 one-time fee).
3.  Click **"New Item"** -> Upload the `.zip` file.

## 3. Store Listing
Fill in the details:
*   **Title**: Twitter Bookmark Organizer
*   **Summary**: Organize your Twitter/X bookmarks with folders, tags, and a powerful dashboard. Privacy-first & free.
*   **Description**:
    > "Tired of your Twitter bookmarks being a messy list?
    >
    > Meet the modern, privacy-first organizer for your bookmarks.
    >
    > **Features:**
    > *   📂 **Folders**: Organize tweets into custom folders.
    > *   🖥️ **Dashboard**: Manage everything in a beautiful dark-mode interface.
    > *   🏷️ **Tags**: Add tags for quick filtering.
    > *   🔍 **Search**: Instantly find that tweet from 3 months ago.
    > *   🔒 **Private**: All data stays on your device. No servers.
    >
    > **How to use:**
    > 1. Install extension.
    > 2. Go to Twitter Bookmarks.
    > 3. Click 'Sync to Organizer'.
    > 4. Open the Dashboard to organize!
    >
    > Completely free and open source."

*   **Category**: Productivity / Tools
*   **Privacy Policy**: Copy from `PRIVACY.md` (We need to create this simple file).

## 4. Visuals (Required)
You need to upload screenshots:
1.  **Icon**: `icons/icon128.png`
2.  **Screenshots**: 1280x800px. Take screenshots of:
    *   The Dashboard (Grid view).
    *   The Sidebar on Twitter.
    *   The "Edit Bookmark" modal.
3.  **Promo Tile (Small)**: 440x280px (Marketing graphic).
4.  **Promo Tile (Large)**: 920x680px.

## 5. Submit for Review
*   Click **"Submit for Review"**.
*   Standard review time is 24-48 hours.

---

## Post-Launch Checklist
*   [ ] Share link on Twitter with hashtags #buildinpublic #twittertools.
*   [ ] Post on Product Hunt.
*   [ ] Reply to Reddit threads looking for bookmark managers.
