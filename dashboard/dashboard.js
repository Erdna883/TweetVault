/**
 * Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
    const storage = new BookmarkStorage();
    await storage.init();

    // State
    const state = {
        currentView: 'all', // all, favorites, unsorted, folder, tag
        currentFilter: null, // ID of folder or tag
        searchQuery: '',
        layout: 'grid', // grid or list
        bookmarks: [],
        folders: [],
        tags: []
    };

    // DOM Elements
    const elements = {
        bookmarksGrid: document.getElementById('bookmarksGrid'),
        itemCount: document.getElementById('itemCount'),
        breadcrumbs: document.getElementById('breadcrumbs').querySelector('span:first-child'),
        searchInput: document.getElementById('searchInput'),
        foldersList: document.getElementById('foldersList'),
        tagsList: document.getElementById('tagsList'),
        emptyState: document.getElementById('emptyState'),
        viewToggles: document.querySelectorAll('.toggle-btn'),
        emptyState: document.getElementById('emptyState'),
        viewToggles: document.querySelectorAll('.toggle-btn'),
        syncBtn: document.getElementById('syncBtn'),
        emptySyncBtn: document.getElementById('emptySyncBtn'),
        // Settings Elements
        settingsBtn: document.getElementById('settingsBtn'),
        settingsModal: document.getElementById('settingsModal'),
        closeSettingsBtn: document.getElementById('closeSettingsBtn'),
        exportDataBtn: document.getElementById('exportDataBtn'),
        importDataBtn: document.getElementById('importDataBtn'),
        importFileInput: document.getElementById('importFileInput'),
        clearDataBtn: document.getElementById('clearDataBtn'),
        // Edit Modal Elements
        editModal: document.getElementById('editModal'),
        editForm: document.getElementById('editForm'),
        editBookmarkId: document.getElementById('editBookmarkId'),
        editNotes: document.getElementById('editNotes'),
        editFolder: document.getElementById('editFolder'),
        activeTags: document.getElementById('activeTags'),
        tagInput: document.getElementById('tagInput'),
        closeEditBtn: document.getElementById('closeEditBtn'),
        cancelEditBtn: document.getElementById('cancelEditBtn')
    };

    // Initialize
    await loadInitialData();
    setupEventListeners();

    async function loadInitialData() {
        try {
            const [bookmarks, folders, tags] = await Promise.all([
                storage.getAllBookmarks(),
                storage.getAllFolders(),
                storage.getAllTags()
            ]);

            state.bookmarks = bookmarks;
            state.folders = folders;
            state.tags = tags;

            renderSidebar();
            renderBookmarks();
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }

    function setupEventListeners() {
        // Search
        elements.searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderBookmarks();
        });

        // View Layout Toggle
        elements.viewToggles.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.viewToggles.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.layout = btn.dataset.layout;

                const container = document.querySelector('.content-area');
                if (state.layout === 'list') {
                    container.classList.add('list-view');
                } else {
                    container.classList.remove('list-view');
                }
            });
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                link.classList.add('active');

                state.currentView = link.dataset.view;
                state.currentFilter = null;

                updateBreadcrumbs(link.textContent.trim());
                renderBookmarks();
            });
        });

        // Sync Buttons
        const handleSync = () => {
            window.open('https://twitter.com/i/bookmarks', '_blank');
        };

        elements.syncBtn.addEventListener('click', handleSync);
        elements.emptySyncBtn.addEventListener('click', handleSync);

        // Settings Modal
        elements.settingsBtn.addEventListener('click', () => {
            elements.settingsModal.classList.remove('hidden');
        });

        elements.closeSettingsBtn.addEventListener('click', () => {
            elements.settingsModal.classList.add('hidden');
        });

        // Close on click outside
        elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) {
                elements.settingsModal.classList.add('hidden');
            }
        });

        // Export Data
        elements.exportDataBtn.addEventListener('click', async () => {
            try {
                const data = await storage.exportToJSON();
                const dataStr = JSON.stringify(data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `twitter-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
            } catch (error) {
                console.error('Export failed:', error);
                alert('Export failed');
            }
        });

        // Import Data
        elements.importDataBtn.addEventListener('click', () => {
            elements.importFileInput.click();
        });

        elements.importFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);
                await storage.importFromJSON(data);
                alert('Import successful!');
                location.reload();
            } catch (error) {
                console.error('Import failed:', error);
                alert('Import failed. Invalid file.');
            }
        });

        // Clear Data
        elements.clearDataBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete ALL bookmarks and folders? This cannot be undone.')) {
                try {
                    await storage.clearAll();
                    alert('Database reset. Reloading...');
                    location.reload();
                } catch (error) {
                    console.error('Reset failed:', error);
                    alert('Reset failed');
                }
            }
        });

        // Edit Modal Events
        elements.closeEditBtn.addEventListener('click', closeEditModal);
        elements.cancelEditBtn.addEventListener('click', closeEditModal);

        // Tag Input
        let currentTags = [];
        elements.tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = elements.tagInput.value.trim();
                if (tag && !currentTags.includes(tag)) {
                    currentTags.push(tag);
                    renderTags(currentTags);
                    elements.tagInput.value = '';
                }
            } else if (e.key === 'Backspace' && elements.tagInput.value === '' && currentTags.length > 0) {
                currentTags.pop();
                renderTags(currentTags);
            }
        });

        // Edit Form Submit
        elements.editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = elements.editBookmarkId.value;
            const bookmark = state.bookmarks.find(b => b.id === id);

            if (bookmark) {
                try {
                    // Update fields
                    bookmark.notes = elements.editNotes.value;
                    bookmark.folderId = elements.editFolder.value;
                    bookmark.tags = currentTags;

                    await storage.saveBookmark(bookmark);

                    // Update UI
                    renderBookmarks(); // Re-render all to reflect changes (folder filtering etc)
                    closeEditModal();
                } catch (error) {
                    console.error('Failed to update bookmark:', error);
                    alert('Failed to save changes');
                }
            }
        });

        // Helper to render tags in modal
        function renderTags(tags) {
            currentTags = tags; // Sync state
            elements.activeTags.innerHTML = tags.map((tag, index) => `
                <div class="tag-chip">
                    ${tag}
                    <span class="remove-tag" data-index="${index}">×</span>
                </div>
            `).join('');

            // Add remove listeners
            elements.activeTags.querySelectorAll('.remove-tag').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.index);
                    currentTags.splice(idx, 1);
                    renderTags(currentTags);
                });
            });
        }

        // Expose renderTags to openEditModal
        window.renderEditTags = renderTags;
    }

    function closeEditModal() {
        elements.editModal.classList.add('hidden');
    }

    function openEditModal(bookmark) {
        elements.editBookmarkId.value = bookmark.id;
        elements.editNotes.value = bookmark.notes || '';

        // Populate Folders
        elements.editFolder.innerHTML = state.folders.map(folder => `
            <option value="${folder.id}" ${folder.id === bookmark.folderId ? 'selected' : ''}>
                ${folder.name}
            </option>
        `).join('');

        // Setup Tags
        window.renderEditTags(bookmark.tags || []);

        elements.editModal.classList.remove('hidden');
    }

    function updateBreadcrumbs(title) {
        elements.breadcrumbs.textContent = title;
    }

    function renderSidebar() {
        // Render Folders
        elements.foldersList.innerHTML = state.folders.map(folder => `
            <div class="folder-item" data-id="${folder.id}">
                <div class="folder-color" style="background: ${folder.color}"></div>
                <span class="folder-name">${folder.name}</span>
            </div>
        `).join('');

        // Folder Click & Drag Events
        document.querySelectorAll('.folder-item').forEach(item => {
            // Click Handler
            item.addEventListener('click', () => {
                state.currentView = 'folder';
                state.currentFilter = item.dataset.id;

                const folder = state.folders.find(f => f.id === item.dataset.id);
                updateBreadcrumbs(folder ? folder.name : 'Folder');
                renderBookmarks();

                // Active state
                document.querySelectorAll('.folder-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });

            // Drop Handler
            item.addEventListener('dragover', (e) => {
                e.preventDefault(); // Allow drop
                item.classList.add('drag-over');
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

            item.addEventListener('drop', async (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');

                const bookmarkId = e.dataTransfer.getData('text/plain');
                if (bookmarkId) {
                    const bookmark = state.bookmarks.find(b => b.id === bookmarkId);
                    const folderId = item.dataset.id;

                    if (bookmark && bookmark.folderId !== folderId) {
                        try {
                            bookmark.folderId = folderId;
                            await storage.saveBookmark(bookmark);

                            // Refresh if we are in a folder view to show it moved away
                            // Or just to update counts/state
                            renderBookmarks();
                        } catch (error) {
                            console.error('Failed to move bookmark:', error);
                        }
                    }
                }
            });
        });

        // Render Tags
        const tagCounts = {};
        state.bookmarks.forEach(b => {
            if (b.tags && Array.isArray(b.tags)) {
                b.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1]); // Sort by count desc

        elements.tagsList.innerHTML = sortedTags.map(([tag, count]) => `
            <div class="folder-item tag-item" data-tag="${tag}">
                <div class="folder-color" style="background: var(--primary); opacity: 0.6;"></div>
                <span class="folder-name">#${tag}</span>
                <span class="count-badge" style="margin-left:auto; font-size:12px; color:var(--text-muted);">${count}</span>
            </div>
        `).join('');

        // Tag Click Events
        document.querySelectorAll('.tag-item').forEach(item => {
            item.addEventListener('click', () => {
                state.currentView = 'tag';
                state.currentFilter = item.dataset.tag;

                updateBreadcrumbs(`#${item.dataset.tag}`);
                renderBookmarks();

                // Active State
                document.querySelectorAll('.folder-item').forEach(i => i.classList.remove('active'));
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Search (Cmd+K or /)
        if ((e.metaKey && e.key === 'k') || (e.key === '/' && document.activeElement !== elements.searchInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
            e.preventDefault();
            elements.searchInput.focus();
        }

        // Close Modals (Esc)
        if (e.key === 'Escape') {
            elements.settingsModal.classList.add('hidden');
            elements.editModal.classList.add('hidden');
        }
    });

    function renderBookmarks() {
        let filtered = state.bookmarks;

        // Apply View Filter
        if (state.currentView === 'favorites') {
            filtered = filtered.filter(b => b.favorite);
        } else if (state.currentView === 'unsorted') {
            filtered = filtered.filter(b => !b.folderId || b.folderId === 'default');
        } else if (state.currentView === 'folder') {
            filtered = filtered.filter(b => b.folderId === state.currentFilter);
        } else if (state.currentView === 'tag') {
            filtered = filtered.filter(b => b.tags && b.tags.includes(state.currentFilter));
        }


        // Apply Search
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(b =>
                b.content.toLowerCase().includes(query) ||
                b.author.toLowerCase().includes(query) ||
                (b.notes && b.notes.toLowerCase().includes(query))
            );
        }

        // Update Count
        elements.itemCount.textContent = `${filtered.length} items`;

        // Render Grid
        elements.bookmarksGrid.innerHTML = '';

        if (filtered.length === 0) {
            elements.emptyState.classList.remove('hidden');
            return;
        }

        elements.emptyState.classList.add('hidden');

        filtered.forEach(bookmark => {
            const card = createBookmarkCard(bookmark);
            elements.bookmarksGrid.appendChild(card);
        });
    }

    function createBookmarkCard(bookmark) {
        const div = document.createElement('div');
        div.className = 'bookmark-card';
        div.draggable = true; // Make draggable
        div.onclick = () => window.open(bookmark.url || `https://twitter.com/i/status/${bookmark.tweetId}`, '_blank');

        // Drag Start
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', bookmark.id);
            // Optional: Set drag image or opacity
            div.style.opacity = '0.5';
        });

        div.addEventListener('dragend', () => {
            div.style.opacity = '1';
        });

        const date = new Date(bookmark.createdAt).toLocaleDateString();
        const mediaHtml = bookmark.media && bookmark.media.length > 0
            ? `<div class="card-media"><img src="${bookmark.media[0].url}" loading="lazy"></div>`
            : '';

        div.innerHTML = `
            <div class="card-header">
                <div class="author-info">
                    <div class="author-avatar"></div>
                    <div class="author-names">
                        <span class="author-name">${bookmark.author}</span>
                        <span class="author-handle">@${bookmark.author}</span>
                    </div>
                </div>
            </div>
            <div class="card-content">
                ${escapeHtml(bookmark.content)}
                ${mediaHtml}
            </div>
            <div class="card-footer">
                <span class="bookmark-date">${date}</span>
                <div class="card-actions">
                    <button class="action-btn" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn delete-btn" title="Delete" data-id="${bookmark.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Stop propagation for actions
        div.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => e.stopPropagation());
        });

        // Edit Handler
        div.querySelector('.action-btn[title="Edit"]').addEventListener('click', () => {
            openEditModal(bookmark);
        });

        // Delete Handler
        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async () => {
            if (confirm('Delete this bookmark?')) {
                try {
                    await storage.deleteBookmark(bookmark.id);
                    // Remove from UI
                    div.remove();
                    // Update count
                    const currentCount = parseInt(elements.itemCount.textContent) || 0;
                    elements.itemCount.textContent = `${Math.max(0, currentCount - 1)} items`;
                    // Update state
                    state.bookmarks = state.bookmarks.filter(b => b.id !== bookmark.id);
                } catch (error) {
                    console.error('Delete failed:', error);
                    alert('Failed to delete bookmark');
                }
            }
        });

        return div;
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
