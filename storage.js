/**
 * IndexedDB wrapper for storing bookmarks, folders, and tags
 */

const DB_NAME = 'TwitterBookmarkOrganizer';
const DB_VERSION = 1;

class BookmarkStorage {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize the database
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Bookmarks store
        if (!db.objectStoreNames.contains('bookmarks')) {
          const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
          bookmarkStore.createIndex('tweetId', 'tweetId', { unique: true });
          bookmarkStore.createIndex('folderId', 'folderId', { unique: false });
          bookmarkStore.createIndex('createdAt', 'createdAt', { unique: false });
          bookmarkStore.createIndex('author', 'author', { unique: false });
        }

        // Folders store
        if (!db.objectStoreNames.contains('folders')) {
          const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
          folderStore.createIndex('name', 'name', { unique: false });
          folderStore.createIndex('parentId', 'parentId', { unique: false });
        }

        // Tags store
        if (!db.objectStoreNames.contains('tags')) {
          const tagStore = db.createObjectStore('tags', { keyPath: 'id' });
          tagStore.createIndex('name', 'name', { unique: true });
        }

        // Create default "Uncategorized" folder
        const transaction = event.target.transaction;
        const folderStore = transaction.objectStore('folders');
        folderStore.add({
          id: 'default',
          name: 'Uncategorized',
          parentId: null,
          color: '#888888',
          createdAt: Date.now()
        });
      };
    });
  }

  /**
   * Add or update a bookmark
   */
  async saveBookmark(bookmark) {
    const transaction = this.db.transaction(['bookmarks'], 'readwrite');
    const store = transaction.objectStore('bookmarks');
    
    const bookmarkData = {
      id: bookmark.id || this.generateId(),
      tweetId: bookmark.tweetId,
      author: bookmark.author,
      content: bookmark.content,
      createdAt: bookmark.createdAt || Date.now(),
      url: bookmark.url,
      media: bookmark.media || [],
      folderId: bookmark.folderId || 'default',
      tags: bookmark.tags || [],
      notes: bookmark.notes || ''
    };

    return new Promise((resolve, reject) => {
      const request = store.put(bookmarkData);
      request.onsuccess = () => resolve(bookmarkData);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all bookmarks
   */
  async getAllBookmarks() {
    const transaction = this.db.transaction(['bookmarks'], 'readonly');
    const store = transaction.objectStore('bookmarks');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get bookmarks by folder
   */
  async getBookmarksByFolder(folderId) {
    const transaction = this.db.transaction(['bookmarks'], 'readonly');
    const store = transaction.objectStore('bookmarks');
    const index = store.index('folderId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(folderId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a bookmark
   */
  async deleteBookmark(id) {
    const transaction = this.db.transaction(['bookmarks'], 'readwrite');
    const store = transaction.objectStore('bookmarks');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Create a new folder
   */
  async createFolder(folder) {
    const transaction = this.db.transaction(['folders'], 'readwrite');
    const store = transaction.objectStore('folders');

    const folderData = {
      id: folder.id || this.generateId(),
      name: folder.name,
      parentId: folder.parentId || null,
      color: folder.color || '#3B82F6',
      createdAt: folder.createdAt || Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(folderData);
      request.onsuccess = () => resolve(folderData);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all folders
   */
  async getAllFolders() {
    const transaction = this.db.transaction(['folders'], 'readonly');
    const store = transaction.objectStore('folders');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update a folder
   */
  async updateFolder(folder) {
    const transaction = this.db.transaction(['folders'], 'readwrite');
    const store = transaction.objectStore('folders');

    return new Promise((resolve, reject) => {
      const request = store.put(folder);
      request.onsuccess = () => resolve(folder);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a folder (moves bookmarks to default folder)
   */
  async deleteFolder(folderId) {
    // Move all bookmarks to default folder first
    const bookmarks = await this.getBookmarksByFolder(folderId);
    for (const bookmark of bookmarks) {
      bookmark.folderId = 'default';
      await this.saveBookmark(bookmark);
    }

    // Delete the folder
    const transaction = this.db.transaction(['folders'], 'readwrite');
    const store = transaction.objectStore('folders');

    return new Promise((resolve, reject) => {
      const request = store.delete(folderId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Create a new tag
   */
  async createTag(tag) {
    const transaction = this.db.transaction(['tags'], 'readwrite');
    const store = transaction.objectStore('tags');

    const tagData = {
      id: tag.id || this.generateId(),
      name: tag.name,
      color: tag.color || '#10B981'
    };

    return new Promise((resolve, reject) => {
      const request = store.add(tagData);
      request.onsuccess = () => resolve(tagData);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all tags
   */
  async getAllTags() {
    const transaction = this.db.transaction(['tags'], 'readonly');
    const store = transaction.objectStore('tags');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Search bookmarks
   */
  async searchBookmarks(query) {
    const allBookmarks = await this.getAllBookmarks();
    const lowerQuery = query.toLowerCase();

    return allBookmarks.filter(bookmark => {
      return (
        bookmark.content.toLowerCase().includes(lowerQuery) ||
        bookmark.author.toLowerCase().includes(lowerQuery) ||
        bookmark.notes.toLowerCase().includes(lowerQuery) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  /**
   * Generate a unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export all data to JSON
   */
  async exportToJSON() {
    const bookmarks = await this.getAllBookmarks();
    const folders = await this.getAllFolders();
    const tags = await this.getAllTags();

    return {
      version: DB_VERSION,
      exportDate: new Date().toISOString(),
      bookmarks,
      folders,
      tags
    };
  }

  /**
   * Import data from JSON
   */
  async importFromJSON(data) {
    // Clear existing data
    await this.clearAll();

    // Import folders first
    for (const folder of data.folders) {
      await this.createFolder(folder);
    }

    // Import tags
    for (const tag of data.tags) {
      await this.createTag(tag);
    }

    // Import bookmarks
    for (const bookmark of data.bookmarks) {
      await this.saveBookmark(bookmark);
    }
  }

  /**
   * Clear all data
   */
  async clearAll() {
    const transaction = this.db.transaction(
      ['bookmarks', 'folders', 'tags'],
      'readwrite'
    );

    const promises = [
      new Promise((resolve, reject) => {
        const request = transaction.objectStore('bookmarks').clear();
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
      }),
      new Promise((resolve, reject) => {
        const request = transaction.objectStore('folders').clear();
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
      }),
      new Promise((resolve, reject) => {
        const request = transaction.objectStore('tags').clear();
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
      })
    ];

    await Promise.all(promises);

    // Recreate default folder
    await this.createFolder({
      id: 'default',
      name: 'Uncategorized',
      parentId: null,
      color: '#888888'
    });
  }
}

// Export singleton instance
const storage = new BookmarkStorage();
