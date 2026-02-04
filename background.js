/**
 * Background service worker for the Twitter Bookmark Organizer extension
 */

importScripts('storage.js');

// Flag to track if storage is initialized
let storageInitialized = false;

/**
 * Ensure storage is initialized before use
 */
async function ensureStorageInitialized() {
    if (!storageInitialized) {
        await storage.init();
        storageInitialized = true;
    }
}

// Initialize storage when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Twitter Bookmark Organizer installed');
    await ensureStorageInitialized();
    updateBadge();
});


/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    handleMessage(request, sender).then(sendResponse);
    return true; // Required for async response
});

async function handleMessage(request, sender) {
    // Ensure storage is initialized before handling any message
    await ensureStorageInitialized();

    try {
        switch (request.action) {
            case 'saveBookmark':
                const bookmark = await storage.saveBookmark(request.data);
                await updateBadge();
                return { success: true, data: bookmark };

            case 'getBookmarks':
                const bookmarks = await storage.getAllBookmarks();
                return { success: true, data: bookmarks };

            case 'getBookmarksByFolder':
                const folderBookmarks = await storage.getBookmarksByFolder(request.folderId);
                return { success: true, data: folderBookmarks };

            case 'deleteBookmark':
                await storage.deleteBookmark(request.id);
                await updateBadge();
                return { success: true };

            case 'createFolder':
                const folder = await storage.createFolder(request.data);
                return { success: true, data: folder };

            case 'getFolders':
                const folders = await storage.getAllFolders();
                return { success: true, data: folders };

            case 'updateFolder':
                const updatedFolder = await storage.updateFolder(request.data);
                return { success: true, data: updatedFolder };

            case 'deleteFolder':
                await storage.deleteFolder(request.id);
                return { success: true };

            case 'createTag':
                const tag = await storage.createTag(request.data);
                return { success: true, data: tag };

            case 'getTags':
                const tags = await storage.getAllTags();
                return { success: true, data: tags };

            case 'searchBookmarks':
                const results = await storage.searchBookmarks(request.query);
                return { success: true, data: results };

            case 'exportData':
                const exportData = await storage.exportToJSON();
                return { success: true, data: exportData };

            case 'importData':
                await storage.importFromJSON(request.data);
                await updateBadge();
                return { success: true };

            case 'getStats':
                const stats = await getStats();
                return { success: true, data: stats };

            default:
                return { success: false, error: 'Unknown action' };
        }
    } catch (error) {
        console.error('Background error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update extension badge with bookmark count
 */
async function updateBadge() {
    try {
        await ensureStorageInitialized();
        const bookmarks = await storage.getAllBookmarks();
        const count = bookmarks.length;

        chrome.action.setBadgeText({
            text: count > 0 ? count.toString() : ''
        });

        chrome.action.setBadgeBackgroundColor({
            color: '#1DA1F2' // Twitter blue
        });
    } catch (error) {
        console.error('Failed to update badge:', error);
    }
}

/**
 * Get statistics for the popup
 */
async function getStats() {
    await ensureStorageInitialized();
    const bookmarks = await storage.getAllBookmarks();
    const folders = await storage.getAllFolders();
    const tags = await storage.getAllTags();

    // Count bookmarks per folder
    const folderCounts = {};
    bookmarks.forEach(bookmark => {
        folderCounts[bookmark.folderId] = (folderCounts[bookmark.folderId] || 0) + 1;
    });

    // Get recent bookmarks (last 5)
    const recentBookmarks = bookmarks
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);

    return {
        totalBookmarks: bookmarks.length,
        totalFolders: folders.length - 1, // Exclude default folder from count
        totalTags: tags.length,
        folderCounts,
        recentBookmarks
    };
}

/**
 * Handle export to file
 */
async function exportToFile(format = 'json') {
    const data = await storage.exportToJSON();

    let blob;
    let filename;

    if (format === 'json') {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        filename = `twitter-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    } else if (format === 'csv') {
        const csv = convertToCSV(data.bookmarks);
        blob = new Blob([csv], { type: 'text/csv' });
        filename = `twitter-bookmarks-${new Date().toISOString().split('T')[0]}.csv`;
    }

    // Create download
    const url = URL.createObjectURL(blob);
    await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
    });
}

/**
 * Convert bookmarks to CSV format
 */
function convertToCSV(bookmarks) {
    const headers = ['ID', 'Tweet ID', 'Author', 'Content', 'URL', 'Created At', 'Folder', 'Tags', 'Notes'];
    const rows = bookmarks.map(b => [
        b.id,
        b.tweetId,
        b.author,
        `"${b.content.replace(/"/g, '""')}"`, // Escape quotes
        b.url,
        new Date(b.createdAt).toISOString(),
        b.folderId,
        b.tags.join('; '),
        `"${(b.notes || '').replace(/"/g, '""')}"`
    ]);

    return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
}
