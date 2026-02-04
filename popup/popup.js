/**
 * Popup UI Logic
 */

// DOM Elements
const totalBookmarksEl = document.getElementById('totalBookmarks');
const totalFoldersEl = document.getElementById('totalFolders');
const totalTagsEl = document.getElementById('totalTags');
const recentBookmarksEl = document.getElementById('recentBookmarks');
const statusMessageEl = document.getElementById('statusMessage');

const syncBtn = document.getElementById('syncBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const openManagerBtn = document.getElementById('openManagerBtn');
const openDashboardBtn = document.getElementById('openDashboardBtn');
const importFileInput = document.getElementById('importFileInput');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    await loadStats();
    setupEventListeners();
});

/**
 * Load statistics from background
 */
async function loadStats() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getStats' });

        if (response.success) {
            const stats = response.data;

            // Update stats display
            totalBookmarksEl.textContent = stats.totalBookmarks;
            totalFoldersEl.textContent = stats.totalFolders;
            totalTagsEl.textContent = stats.totalTags;

            // Display recent bookmarks
            displayRecentBookmarks(stats.recentBookmarks);
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
        showStatus('Failed to load data', 'error');
    }
}

/**
 * Display recent bookmarks
 */
function displayRecentBookmarks(bookmarks) {
    if (!bookmarks || bookmarks.length === 0) {
        recentBookmarksEl.innerHTML = `
      <div class="empty-state">
        <p class="text-secondary text-sm">No bookmarks yet</p>
        <p class="text-muted text-xs">Go to Twitter and sync your bookmarks to get started</p>
      </div>
    `;
        return;
    }

    recentBookmarksEl.innerHTML = bookmarks.map(bookmark => {
        const initials = bookmark.author.substring(0, 2).toUpperCase();
        const date = formatDate(bookmark.createdAt);
        const truncatedText = bookmark.content.substring(0, 100);

        return `
      <div class="bookmark-item" data-url="${bookmark.url}">
        <div class="bookmark-avatar">${initials}</div>
        <div class="bookmark-content">
          <div class="bookmark-author">@${bookmark.author}</div>
          <div class="bookmark-text">${escapeHtml(truncatedText)}${bookmark.content.length > 100 ? '...' : ''}</div>
          <div class="bookmark-date">${date}</div>
        </div>
      </div>
    `;
    }).join('');

    // Add click handlers to open bookmarks
    document.querySelectorAll('.bookmark-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = item.dataset.url;
            chrome.tabs.create({ url });
        });
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Sync button
    syncBtn.addEventListener('click', async () => {
        syncBtn.classList.add('loading');
        syncBtn.disabled = true;

        try {
            // Open Twitter bookmarks page in new tab
            const tab = await chrome.tabs.create({
                url: 'https://twitter.com/i/bookmarks',
                active: true
            });

            showStatus('Opening Twitter bookmarks...', 'success');

            // Close popup after a moment
            setTimeout(() => window.close(), 1000);
        } catch (error) {
            console.error('Sync error:', error);
            showStatus('Failed to open Twitter', 'error');
        } finally {
            syncBtn.classList.remove('loading');
            syncBtn.disabled = false;
        }
    });

    // Export button
    exportBtn.addEventListener('click', async () => {
        exportBtn.classList.add('loading');
        exportBtn.disabled = true;

        try {
            const response = await chrome.runtime.sendMessage({ action: 'exportData' });

            if (response.success) {
                // Create and download JSON file
                const dataStr = JSON.stringify(response.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const filename = `twitter-bookmarks-${new Date().toISOString().split('T')[0]}.json`;

                await chrome.downloads.download({
                    url: url,
                    filename: filename,
                    saveAs: true
                });

                showStatus('Export successful!', 'success');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Export error:', error);
            showStatus('Export failed', 'error');
        } finally {
            exportBtn.classList.remove('loading');
            exportBtn.disabled = false;
        }
    });

    // Import button
    importBtn.addEventListener('click', () => {
        importFileInput.click();
    });

    // File input handler
    importFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        importBtn.classList.add('loading');
        importBtn.disabled = true;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            const response = await chrome.runtime.sendMessage({
                action: 'importData',
                data: data
            });

            if (response.success) {
                showStatus('Import successful!', 'success');
                await loadStats(); // Refresh stats
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Import error:', error);
            showStatus('Import failed. Invalid file format.', 'error');
        } finally {
            importBtn.classList.remove('loading');
            importBtn.disabled = false;
            importFileInput.value = ''; // Reset file input
        }
    });

    // Open manager button (Twitter)
    openManagerBtn.addEventListener('click', async () => {
        try {
            chrome.tabs.create({ url: 'https://twitter.com/i/bookmarks' });
            window.close();
        } catch (error) {
            console.error('Failed to open Twitter:', error);
            showStatus('Failed to open Twitter', 'error');
        }
    });

    // Open Dashboard Button
    openDashboardBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'dashboard/dashboard.html' });
        window.close();
    });
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    statusMessageEl.textContent = message;
    statusMessageEl.className = `status-message ${type}`;
    statusMessageEl.style.display = 'block';

    setTimeout(() => {
        statusMessageEl.style.display = 'none';
    }, 3000);
}

/**
 * Format date for display
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
