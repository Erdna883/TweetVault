/**
 * Content script injected into Twitter pages
 * Handles bookmark scraping and sidebar integration
 */

// Only run on Twitter/X domains
if (window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com')) {
    let sidebarInjected = false;
    let isProcessing = false;

    // Initialize content script
    init();

    function init() {
        console.log('Twitter Bookmark Organizer: Content script loaded');

        // Inject sidebar if on bookmarks page
        if (isBookmarksPage()) {
            injectSidebar();
            addSyncButton();
            addJumpToBottomButton();
            addSaveButtonsToTweets();
            observeTweetChanges();
        }

        // Listen for navigation changes (Twitter is a SPA)
        observeUrlChanges();
    }

    /**
     * Check if current page is bookmarks page
     */
    function isBookmarksPage() {
        return window.location.pathname.includes('/bookmarks');
    }

    /**
     * Inject sidebar into the page
     */
    function injectSidebar() {
        if (sidebarInjected) return;

        const sidebar = document.createElement('div');
        sidebar.id = 'bookmark-organizer-sidebar';
        sidebar.className = 'bookmark-sidebar';

        sidebar.innerHTML = `
      <div class="sidebar-header">
        <h2 class="sidebar-title">Bookmark Organizer</h2>
        <button class="sidebar-toggle" id="sidebarToggle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="sidebar-search">
        <input type="text" id="sidebarSearch" class="sidebar-search-input" placeholder="Search bookmarks...">
      </div>
      
      <div class="sidebar-keywords">
        <div class="keywords-header">
          <span class="keywords-title">Quick Filters</span>
          <button class="keyword-add-btn" id="addKeywordBtn" title="Add keyword">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
        <div class="keywords-list" id="keywordsList">
          <div class="keyword-chip" data-keyword="crypto">crypto</div>
          <div class="keyword-chip" data-keyword="coding">coding</div>
          <div class="keyword-chip" data-keyword="ai">ai</div>
          <div class="keyword-chip" data-keyword="web3">web3</div>
          <div class="keyword-chip" data-keyword="design">design</div>
        </div>
      </div>
      
      <div class="sidebar-folders" id="sidebarFolders">
        <div class="loading-placeholder">Loading folders...</div>
      </div>
      
      <div class="sidebar-footer">
        <button class="sidebar-btn" id="createFolderBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            <line x1="12" y1="11" x2="12" y2="17"/>
            <line x1="9" y1="14" x2="15" y2="14"/>
          </svg>
          New Folder
        </button>
      </div>
    `;

        document.body.appendChild(sidebar);
        sidebarInjected = true;

        // Setup sidebar event listeners
        setupSidebarListeners();

        // Load folders
        loadFolders();
    }

    /**
     * Add sync button to Twitter UI
     */
    function addSyncButton() {
        // Remove existing button if any
        const existing = document.getElementById('syncBookmarksBtn');
        if (existing) existing.remove();

        // Create floating sync button
        const syncButton = document.createElement('button');
        syncButton.id = 'syncBookmarksBtn';
        syncButton.className = 'sync-bookmarks-btn';
        syncButton.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Sync to Organizer
        `;

        // Left click - sync all bookmarks
        syncButton.addEventListener('click', () => {
            syncBookmarks();
        });

        // Right click - show keyword filter options
        syncButton.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showSyncKeywordMenu(e);
        });

        // Add tooltip for right-click
        syncButton.title = 'Click to sync all | Right-click for keyword filtering';

        // Append to body as floating button
        document.body.appendChild(syncButton);
    }

    /**
     * Show sync keyword filter menu
     */
    function showSyncKeywordMenu(event) {
        // Remove any existing menu
        const existingMenu = document.getElementById('syncKeywordMenu');
        if (existingMenu) existingMenu.remove();

        // Create menu
        const menu = document.createElement('div');
        menu.id = 'syncKeywordMenu';
        menu.className = 'sync-keyword-menu';
        menu.style.left = event.pageX + 'px';
        menu.style.top = event.pageY + 'px';

        menu.innerHTML = `
            <div class="menu-header">Sync Options</div>
            <div class="menu-item" data-action="sync-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                Sync All Bookmarks
            </div>
            <div class="menu-divider"></div>
            <div class="menu-header-small">Filter by Keyword</div>
            <div class="menu-item" data-action="sync-keyword">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                Custom Keyword...
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item" data-keyword="crypto">🪙 Crypto</div>
            <div class="menu-item" data-keyword="ai">🤖 AI</div>
            <div class="menu-item" data-keyword="coding">💻 Coding</div>
            <div class="menu-item" data-keyword="web3">🌐 Web3</div>
            <div class="menu-item" data-keyword="design">🎨 Design</div>
        `;

        document.body.appendChild(menu);

        // Setup event listeners
        menu.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', async () => {
                const action = item.dataset.action;
                const keyword = item.dataset.keyword;

                if (action === 'sync-all') {
                    syncBookmarks();
                } else if (action === 'sync-keyword') {
                    const customKeyword = prompt('Enter keyword to filter bookmarks during sync:');
                    if (customKeyword) {
                        syncBookmarks(customKeyword.trim());
                    }
                } else if (keyword) {
                    syncBookmarks(keyword);
                }

                menu.remove();
            });
        });

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }, 100);
        });
    }

    /**
     * Add jump to bottom button to Twitter UI
     */
    function addJumpToBottomButton() {
        // Remove existing button if any
        const existing = document.getElementById('jumpToBottomTwitterBtn');
        if (existing) existing.remove();

        // Create floating jump button
        const jumpButton = document.createElement('button');
        jumpButton.id = 'jumpToBottomTwitterBtn';
        jumpButton.className = 'jump-to-bottom-twitter-btn';
        jumpButton.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
            </svg>
            Jump to Bottom
        `;

        let scrollInterval = null;

        jumpButton.addEventListener('click', () => {
            // Clear any existing scroll interval
            if (scrollInterval) {
                clearInterval(scrollInterval);
            }

            showNotification('Scrolling to bottom...', 'info');

            // Continuously scroll until we reach the bottom
            scrollInterval = setInterval(() => {
                const previousHeight = window.scrollY;
                window.scrollTo(0, document.body.scrollHeight);

                // Check if we've reached the bottom
                setTimeout(() => {
                    const atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 50;
                    const notMoving = Math.abs(window.scrollY - previousHeight) < 10;

                    if (atBottom || notMoving) {
                        clearInterval(scrollInterval);
                        scrollInterval = null;
                        showNotification('Reached bottom!', 'success');
                    }
                }, 100);
            }, 150); // Scroll every 150ms for continuous fast scrolling
        });

        // Append to body as floating button
        document.body.appendChild(jumpButton);
    }

    /**
     * Setup sidebar event listeners
     */
    function setupSidebarListeners() {
        // Toggle sidebar
        const toggleBtn = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('bookmark-organizer-sidebar');

        toggleBtn?.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });

        // Search functionality
        const searchInput = document.getElementById('sidebarSearch');
        searchInput?.addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });

        // Create folder button
        const createFolderBtn = document.getElementById('createFolderBtn');
        createFolderBtn?.addEventListener('click', () => {
            createNewFolder();
        });

        // Keyword filter clicks
        setupKeywordListeners();

        // Add keyword button
        const addKeywordBtn = document.getElementById('addKeywordBtn');
        addKeywordBtn?.addEventListener('click', () => {
            addCustomKeyword();
        });
    }

    /**
     * Setup keyword filter listeners
     */
    function setupKeywordListeners() {
        const keywordChips = document.querySelectorAll('.keyword-chip');

        keywordChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                // Toggle active state
                const isActive = chip.classList.contains('active');

                if (isActive) {
                    chip.classList.remove('active');
                    handleSearch(''); // Clear filter
                } else {
                    // Deactivate other chips
                    keywordChips.forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');

                    // Search by keyword
                    const keyword = chip.dataset.keyword;
                    handleSearch(keyword);
                }
            });

            // Add remove button for custom keywords
            if (chip.dataset.custom === 'true') {
                const removeBtn = document.createElement('button');
                removeBtn.className = 'keyword-remove';
                removeBtn.innerHTML = '×';
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    chip.remove();
                    saveCustomKeywords();
                });
                chip.appendChild(removeBtn);
            }
        });
    }

    /**
     * Add custom keyword
     */
    async function addCustomKeyword() {
        const keyword = prompt('Enter a keyword to filter by (e.g., polymarket, crypto):');
        if (!keyword) return;

        const keywordsList = document.getElementById('keywordsList');
        const chip = document.createElement('div');
        chip.className = 'keyword-chip';
        chip.dataset.keyword = keyword.toLowerCase();
        chip.dataset.custom = 'true';
        chip.textContent = keyword.toLowerCase();

        keywordsList.appendChild(chip);
        setupKeywordListeners();
        await saveCustomKeywords();

        showNotification(`Keyword "${keyword}" added!`, 'success');
    }

    /**
     * Save custom keywords to storage
     */
    async function saveCustomKeywords() {
        const customKeywords = Array.from(
            document.querySelectorAll('.keyword-chip[data-custom="true"]')
        ).map(chip => chip.dataset.keyword);

        // Store in chrome.storage.local
        try {
            await chrome.storage.local.set({ customKeywords });
        } catch (error) {
            console.error('Failed to save keywords:', error);
        }
    }

    /**
     * Load custom keywords from storage
     */
    async function loadCustomKeywords() {
        try {
            const result = await chrome.storage.local.get('customKeywords');
            const customKeywords = result.customKeywords || [];

            const keywordsList = document.getElementById('keywordsList');
            customKeywords.forEach(keyword => {
                const chip = document.createElement('div');
                chip.className = 'keyword-chip';
                chip.dataset.keyword = keyword;
                chip.dataset.custom = 'true';
                chip.textContent = keyword;
                keywordsList.appendChild(chip);
            });

            setupKeywordListeners();
        } catch (error) {
            console.error('Failed to load keywords:', error);
        }
    }

    /**
     * Load folders from storage
     */
    async function loadFolders() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getFolders' });

            if (response.success) {
                displayFolders(response.data);
            }

            // Also load custom keywords
            await loadCustomKeywords();
        } catch (error) {
            console.error('Failed to load folders:', error);
        }
    }

    /**
     * Display folders in sidebar
     */
    function displayFolders(folders) {
        const foldersContainer = document.getElementById('sidebarFolders');

        if (!folders || folders.length === 0) {
            foldersContainer.innerHTML = '<div class="empty-state">No folders yet</div>';
            return;
        }

        // Build folder tree (only root folders for now)
        const rootFolders = folders.filter(f => !f.parentId || f.parentId === null);

        foldersContainer.innerHTML = rootFolders.map(folder => `
      <div class="folder-item" data-folder-id="${folder.id}">
        <div class="folder-icon" style="color: ${folder.color}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <span class="folder-name">${escapeHtml(folder.name)}</span>
        <div class="folder-actions">
          <button class="folder-action-btn" data-action="rename" title="Rename">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          ${folder.id !== 'default' ? `
          <button class="folder-action-btn" data-action="delete" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
          ` : ''}
        </div>
      </div>
    `).join('');

        // Add event listeners to folder items
        document.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.folder-actions')) {
                    const folderId = item.dataset.folderId;
                    viewFolder(folderId);
                }
            });
        });

        // Add event listeners to action buttons
        document.querySelectorAll('.folder-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const folderId = btn.closest('.folder-item').dataset.folderId;

                if (action === 'rename') {
                    renameFolder(folderId);
                } else if (action === 'delete') {
                    deleteFolder(folderId);
                }
            });
        });
    }

    /**
     * Sync bookmarks from Twitter
     * @param {string} keyword - Optional keyword to filter bookmarks during sync
     */
    async function syncBookmarks(keyword = null) {
        if (isProcessing) {
            showNotification('Sync already in progress', 'warning');
            return;
        }

        if (!isBookmarksPage()) {
            showNotification('Please navigate to your bookmarks page', 'warning');
            return;
        }

        isProcessing = true;

        if (keyword) {
            showNotification(`Syncing bookmarks containing "${keyword}"...`, 'info');
        } else {
            showNotification('Syncing all bookmarks...', 'info');
        }

        try {
            // Scroll to load all bookmarks
            await scrollToLoadAll();

            // Extract bookmarks from page
            let bookmarks = extractBookmarksFromPage();

            // Filter by keyword if provided
            if (keyword) {
                const lowerKeyword = keyword.toLowerCase();
                bookmarks = bookmarks.filter(bookmark => {
                    return (
                        bookmark.content.toLowerCase().includes(lowerKeyword) ||
                        bookmark.author.toLowerCase().includes(lowerKeyword) ||
                        bookmark.notes.toLowerCase().includes(lowerKeyword)
                    );
                });

                if (bookmarks.length === 0) {
                    showNotification(`No bookmarks found containing "${keyword}"`, 'warning');
                    return;
                }
            }

            // Save to storage
            let savedCount = 0;
            for (const bookmark of bookmarks) {
                const response = await chrome.runtime.sendMessage({
                    action: 'saveBookmark',
                    data: bookmark
                });

                if (response.success) {
                    savedCount++;
                }
            }

            const message = keyword
                ? `Synced ${savedCount} bookmarks with keyword "${keyword}"!`
                : `Synced ${savedCount} bookmarks successfully!`;

            showNotification(message, 'success');
        } catch (error) {
            console.error('Sync error:', error);
            showNotification('Failed to sync bookmarks', 'error');
        } finally {
            isProcessing = false;
        }
    }

    /**
     * Scroll page to load all bookmarks
     */
    async function scrollToLoadAll() {
        return new Promise((resolve) => {
            let scrollCount = 0;

            // SYNC PARAMETERS - Adjust these to control sync behavior:
            const maxScrolls = 20;        // Max scroll iterations (20 = ~400-600 bookmarks, 50 = ~1500 bookmarks)
            const scrollInterval = 1000;  // Time between scrolls in ms (1000 = 1 second)
            const waitForContent = 500;   // Wait time for content to load after each scroll in ms

            showNotification('Loading bookmarks...', 'info');

            const interval = setInterval(() => {
                window.scrollTo(0, document.body.scrollHeight);
                scrollCount++;

                // Show progress
                if (scrollCount % 5 === 0) {
                    showNotification(`Loading... (${scrollCount}/${maxScrolls})`, 'info');
                }

                // Check if we've reached the end or max scrolls
                if (scrollCount >= maxScrolls) {
                    clearInterval(interval);
                    resolve();
                }

                // Wait a bit for content to load
                setTimeout(() => {
                    const atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 100;
                    if (atBottom) {
                        clearInterval(interval);
                        resolve();
                    }
                }, waitForContent);
            }, scrollInterval);
        });
    }

    /**
     * Extract bookmarks from the Twitter page DOM
     */
    function extractBookmarksFromPage() {
        const bookmarks = [];
        const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');

        tweetElements.forEach(tweetEl => {
            try {
                // Extract tweet data
                const textEl = tweetEl.querySelector('[data-testid="tweetText"]');
                const authorEl = tweetEl.querySelector('[data-testid="User-Name"] a');
                const timeEl = tweetEl.querySelector('time');

                if (!textEl || !authorEl) return;

                const content = textEl.innerText;
                const authorHref = authorEl.getAttribute('href');
                const author = authorHref ? authorHref.replace('/', '') : 'unknown';
                const url = tweetEl.querySelector('a[href*="/status/"]')?.href || '';
                const tweetId = url.match(/status\/(\d+)/)?.[1] || '';
                const createdAt = timeEl ? new Date(timeEl.getAttribute('datetime')).getTime() : Date.now();

                // Extract media URLs
                const media = [];
                const images = tweetEl.querySelectorAll('img[src*="pbs.twimg.com"]');
                images.forEach(img => {
                    media.push({
                        type: 'image',
                        url: img.src
                    });
                });

                if (tweetId) {
                    bookmarks.push({
                        tweetId,
                        author,
                        content,
                        url,
                        createdAt,
                        media,
                        folderId: 'default',
                        tags: [],
                        notes: ''
                    });
                }
            } catch (error) {
                console.error('Failed to extract tweet:', error);
            }
        });

        return bookmarks;
    }

    /**
     * Create a new folder
     */
    async function createNewFolder() {
        const name = prompt('Enter folder name:');
        if (!name) return;

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'createFolder',
                data: { name }
            });

            if (response.success) {
                showNotification('Folder created!', 'success');
                await loadFolders();
            }
        } catch (error) {
            console.error('Failed to create folder:', error);
            showNotification('Failed to create folder', 'error');
        }
    }

    /**
     * View folder contents
     */
    async function viewFolder(folderId) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getBookmarksByFolder',
                folderId: folderId
            });

            if (response.success) {
                displayBookmarksInFolder(response.data, folderId);
            }
        } catch (error) {
            console.error('Failed to view folder:', error);
            showNotification('Failed to load folder', 'error');
        }
    }

    /**
     * Display bookmarks in the sidebar
     */
    async function displayBookmarksInFolder(bookmarks, folderId) {
        const foldersContainer = document.getElementById('sidebarFolders');

        // Get folder name
        const foldersResponse = await chrome.runtime.sendMessage({ action: 'getFolders' });
        const folder = foldersResponse.data.find(f => f.id === folderId);
        const folderName = folder ? folder.name : 'Unknown';

        if (!bookmarks || bookmarks.length === 0) {
            foldersContainer.innerHTML = `
                <div class="folder-header">
                    <button class="back-btn" id="backToFolders">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                        Back
                    </button>
                    <h3 class="folder-title">${escapeHtml(folderName)}</h3>
                </div>
                <div class="empty-state">No bookmarks in this folder</div>
            `;

            document.getElementById('backToFolders')?.addEventListener('click', loadFolders);
            return;
        }

        // Get all folders for dropdown
        const allFolders = foldersResponse.data;

        foldersContainer.innerHTML = `
            <div class="folder-header">
                <button class="back-btn" id="backToFolders">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Back
                </button>
                <h3 class="folder-title">${escapeHtml(folderName)}</h3>
            </div>
            <div class="bookmarks-list" id="bookmarksList">
                ${bookmarks.map(bookmark => `
                    <div class="bookmark-card" data-bookmark-id="${bookmark.id}">
                        <div class="bookmark-card-header">
                            <div class="bookmark-author">@${escapeHtml(bookmark.author)}</div>
                            <div class="bookmark-menu">
                                <button class="bookmark-menu-btn" data-bookmark-id="${bookmark.id}">⋯</button>
                                <div class="bookmark-dropdown" id="dropdown-${bookmark.id}" style="display: none;">
                                    <div class="dropdown-header">Move to:</div>
                                    ${allFolders.map(f => `
                                        <div class="dropdown-item ${f.id === folderId ? 'current' : ''}" 
                                             data-folder-id="${f.id}" 
                                             data-bookmark-id="${bookmark.id}">
                                            ${escapeHtml(f.name)} ${f.id === folderId ? '✓' : ''}
                                        </div>
                                    `).join('')}
                                    <div class="dropdown-divider"></div>
                                    <div class="dropdown-item delete-item" data-bookmark-id="${bookmark.id}">
                                        🗑️ Delete Bookmark
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bookmark-content">${escapeHtml(bookmark.content.substring(0, 200))}${bookmark.content.length > 200 ? '...' : ''}</div>
                        <div class="bookmark-footer">
                            <span class="bookmark-date">${formatDate(bookmark.createdAt)}</span>
                            <a href="${bookmark.url}" target="_blank" class="bookmark-link">View Tweet →</a>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="jump-to-bottom-btn" id="jumpToBottomBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <polyline points="19 12 12 19 5 12"/>
                </svg>
                Jump to Bottom
            </button>
        `;

        // Add back button listener
        document.getElementById('backToFolders')?.addEventListener('click', loadFolders);

        // Add jump to bottom button listener
        document.getElementById('jumpToBottomBtn')?.addEventListener('click', () => {
            const bookmarksList = document.getElementById('bookmarksList');
            bookmarksList.scrollTo({
                top: bookmarksList.scrollHeight,
                behavior: 'smooth'
            });
        });

        // Add menu button listeners
        document.querySelectorAll('.bookmark-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = btn.dataset.bookmarkId;
                const dropdown = document.getElementById(`dropdown-${bookmarkId}`);

                // Close all other dropdowns
                document.querySelectorAll('.bookmark-dropdown').forEach(d => {
                    if (d.id !== `dropdown-${bookmarkId}`) {
                        d.style.display = 'none';
                    }
                });

                // Toggle this dropdown
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });
        });

        // Add dropdown item listeners
        document.querySelectorAll('.dropdown-item:not(.current):not(.delete-item)').forEach(item => {
            item.addEventListener('click', async (e) => {
                e.stopPropagation();
                const newFolderId = item.dataset.folderId;
                const bookmarkId = item.dataset.bookmarkId;
                await moveBookmarkToFolder(bookmarkId, newFolderId);
            });
        });

        // Add delete button listeners
        document.querySelectorAll('.delete-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                e.stopPropagation();
                const bookmarkId = item.dataset.bookmarkId;
                await deleteBookmark(bookmarkId, folderId);
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.bookmark-dropdown').forEach(d => {
                d.style.display = 'none';
            });
        });
    }

    /**
     * Move bookmark to a different folder
     */
    async function moveBookmarkToFolder(bookmarkId, newFolderId) {
        try {
            // Get all bookmarks
            const response = await chrome.runtime.sendMessage({ action: 'getBookmarks' });
            const bookmark = response.data.find(b => b.id === bookmarkId);

            if (!bookmark) return;

            // Update folder
            bookmark.folderId = newFolderId;

            // Save
            const saveResponse = await chrome.runtime.sendMessage({
                action: 'saveBookmark',
                data: bookmark
            });

            if (saveResponse.success) {
                showNotification('Bookmark moved!', 'success');
                // Refresh current view
                const currentFolderId = document.querySelector('.folder-title')?.dataset?.folderId || 'default';
                await viewFolder(currentFolderId);
            }
        } catch (error) {
            console.error('Failed to move bookmark:', error);
            showNotification('Failed to move bookmark', 'error');
        }
    }

    /**
     * Delete a bookmark
     */
    async function deleteBookmark(bookmarkId, currentFolderId) {
        if (!confirm('Are you sure you want to delete this bookmark? This cannot be undone.')) {
            return;
        }

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'deleteBookmark',
                id: bookmarkId
            });

            if (response.success) {
                showNotification('Bookmark deleted!', 'success');
                // Refresh current folder view
                await viewFolder(currentFolderId);
            }
        } catch (error) {
            console.error('Failed to delete bookmark:', error);
            showNotification('Failed to delete bookmark', 'error');
        }
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
     * Rename a folder
     */
    async function renameFolder(folderId) {
        const newName = prompt('Enter new folder name:');
        if (!newName) return;

        try {
            // Get current folder data first
            const foldersResponse = await chrome.runtime.sendMessage({ action: 'getFolders' });
            const folder = foldersResponse.data.find(f => f.id === folderId);

            if (!folder) return;

            folder.name = newName;

            const response = await chrome.runtime.sendMessage({
                action: 'updateFolder',
                data: folder
            });

            if (response.success) {
                showNotification('Folder renamed!', 'success');
                await loadFolders();
            }
        } catch (error) {
            console.error('Failed to rename folder:', error);
            showNotification('Failed to rename folder', 'error');
        }
    }

    /**
     * Delete a folder
     */
    async function deleteFolder(folderId) {
        if (!confirm('Are you sure you want to delete this folder? Bookmarks will be moved to Uncategorized.')) {
            return;
        }

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'deleteFolder',
                id: folderId
            });

            if (response.success) {
                showNotification('Folder deleted!', 'success');
                await loadFolders();
            }
        } catch (error) {
            console.error('Failed to delete folder:', error);
            showNotification('Failed to delete folder', 'error');
        }
    }

    /**
     * Handle search
     */
    async function handleSearch(query) {
        if (!query.trim()) {
            await loadFolders();
            return;
        }

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'searchBookmarks',
                query: query
            });

            if (response.success) {
                // Display search results (TODO: implement results view)
                console.log('Search results:', response.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.getElementById('bookmark-organizer-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.id = 'bookmark-organizer-notification';
        notification.className = `bookmark-notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Observe URL changes for SPA navigation
     */
    function observeUrlChanges() {
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                // Reinitialize when navigating to bookmarks page
                if (isBookmarksPage()) {
                    setTimeout(() => {
                        injectSidebar();
                        addSyncButton();
                        addJumpToBottomButton();
                        addSaveButtonsToTweets();
                        observeTweetChanges();
                        loadCustomKeywords();
                    }, 500);
                }
            }
        }).observe(document, { subtree: true, childList: true });
    }

    /**
     * Add save buttons to all tweets
     */
    function addSaveButtonsToTweets() {
        const tweets = document.querySelectorAll('article[data-testid="tweet"]');
        tweets.forEach(tweet => {
            // Skip if button already exists
            if (tweet.querySelector('.tweet-save-btn')) return;

            addSaveButtonToTweet(tweet);
        });
    }

    /**
     * Add save button to a single tweet
     */
    function addSaveButtonToTweet(tweetElement) {
        // Find the action bar (like, retweet, etc buttons)
        const actionBar = tweetElement.querySelector('[role="group"]');
        if (!actionBar) return;

        // Create save button
        const saveBtn = document.createElement('div');
        saveBtn.className = 'tweet-save-btn';
        saveBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
        `;
        saveBtn.title = 'Save to folder';

        // Add click handler
        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showFolderSelectionModal(tweetElement);
        });

        // Insert button into action bar
        actionBar.appendChild(saveBtn);
    }

    /**
     * Observe for new tweets being added to the page
     */
    function observeTweetChanges() {
        const observer = new MutationObserver(() => {
            addSaveButtonsToTweets();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Show folder selection modal for a tweet
     */
    async function showFolderSelectionModal(tweetElement) {
        // Get tweet data
        const tweetData = extractTweetData(tweetElement);
        if (!tweetData) {
            showNotification('Could not extract tweet data', 'error');
            return;
        }

        // Get folders
        const response = await chrome.runtime.sendMessage({ action: 'getFolders' });
        if (!response.success) {
            showNotification('Could not load folders', 'error');
            return;
        }

        const folders = response.data || [];

        // Remove existing modal if any
        const existingModal = document.getElementById('folderSelectionModal');
        if (existingModal) existingModal.remove();

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'folderSelectionModal';
        modal.className = 'folder-selection-modal';

        const folderItems = folders.map(folder => `
            <div class="folder-item" data-folder-id="${folder.id}">
                <div class="folder-color" style="background: ${folder.color || '#1DA1F2'}"></div>
                <span class="folder-name">${folder.name}</span>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Save to Folder</h3>
                    <button class="modal-close" id="closeModal">×</button>
                </div>
                <div class="modal-body">
                    <div class="tweet-preview">
                        <div class="tweet-author">@${tweetData.author}</div>
                        <div class="tweet-text">${tweetData.content.substring(0, 100)}${tweetData.content.length > 100 ? '...' : ''}</div>
                    </div>
                    <div class="folder-list">
                        ${folders.length > 0 ? folderItems : '<p class="no-folders">No folders yet. Create one in the sidebar!</p>'}
                    </div>
                    <button class="create-new-folder-btn" id="createNewFolderBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Create New Folder
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup event listeners
        document.getElementById('closeModal').addEventListener('click', () => modal.remove());

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Folder selection
        modal.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', async () => {
                const folderId = item.dataset.folderId;
                await saveTweetToFolder(tweetData, folderId);
                modal.remove();
            });
        });

        // Create new folder button
        document.getElementById('createNewFolderBtn')?.addEventListener('click', async () => {
            const name = prompt('Enter folder name:');
            if (!name) return;

            const response = await chrome.runtime.sendMessage({
                action: 'createFolder',
                data: {
                    name,
                    color: '#1DA1F2',
                    parentId: null
                }
            });

            if (response.success) {
                await saveTweetToFolder(tweetData, response.data.id);
                modal.remove();
            }
        });
    }

    /**
     * Extract tweet data from element
     */
    function extractTweetData(tweetElement) {
        try {
            const textEl = tweetElement.querySelector('[data-testid="tweetText"]');
            const authorEl = tweetElement.querySelector('[data-testid="User-Name"] a');
            const timeEl = tweetElement.querySelector('time');

            if (!textEl || !authorEl) return null;

            const content = textEl.innerText;
            const authorHref = authorEl.getAttribute('href');
            const author = authorHref ? authorHref.replace('/', '') : 'unknown';
            const url = tweetElement.querySelector('a[href*="/status/"]')?.href || '';
            const tweetId = url.match(/status\/(\d+)/)?.[1] || '';
            const createdAt = timeEl ? new Date(timeEl.getAttribute('datetime')).getTime() : Date.now();

            // Extract media URLs
            const media = [];
            const images = tweetElement.querySelectorAll('img[src*="pbs.twimg.com"]');
            images.forEach(img => {
                media.push({
                    type: 'image',
                    url: img.src
                });
            });

            return {
                tweetId,
                author,
                content,
                url,
                createdAt,
                media,
                tags: [],
                notes: ''
            };
        } catch (error) {
            console.error('Failed to extract tweet data:', error);
            return null;
        }
    }

    /**
     * Save tweet to specific folder
     */
    async function saveTweetToFolder(tweetData, folderId) {
        const bookmark = {
            ...tweetData,
            folderId
        };

        const response = await chrome.runtime.sendMessage({
            action: 'saveBookmark',
            data: bookmark
        });

        if (response.success) {
            showNotification('Saved to folder!', 'success');
        } else {
            showNotification('Failed to save bookmark', 'error');
        }
    }

    /**
     * Handle URL changes
     */
    function onUrlChange() {
        if (isBookmarksPage() && !sidebarInjected) {
            injectSidebar();
            addSyncButton();
            addJumpToBottomButton();
        }
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
