const DB_NAME = 'BerbagiCeritaDB';
const DB_VERSION = 1;
const STORIES_STORE = 'stories';
const FAVORITES_STORE = 'favorites';

class IndexedDBHelper {
  constructor() {
    this.db = null;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB: Error opening database', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB: Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('IndexedDB: Database upgrade needed');

        // Create stories store
        if (!db.objectStoreNames.contains(STORIES_STORE)) {
          const storiesStore = db.createObjectStore(STORIES_STORE, { keyPath: 'id' });
          storiesStore.createIndex('createdAt', 'createdAt', { unique: false });
          storiesStore.createIndex('name', 'name', { unique: false });
          console.log('IndexedDB: Stories store created');
        }

        // Create favorites store
        if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
          const favoritesStore = db.createObjectStore(FAVORITES_STORE, { keyPath: 'id' });
          favoritesStore.createIndex('savedAt', 'savedAt', { unique: false });
          console.log('IndexedDB: Favorites store created');
        }
      };
    });
  }

  async getAllStories() {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([STORIES_STORE], 'readonly');
      const store = transaction.objectStore(STORIES_STORE);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          console.log('IndexedDB: Retrieved all stories', request.result.length);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('IndexedDB: Error getting all stories', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB: Error in getAllStories', error);
      throw error;
    }
  }

  async saveStory(story) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([STORIES_STORE], 'readwrite');
      const store = transaction.objectStore(STORIES_STORE);
      
      // Add saved timestamp
      const storyWithTimestamp = {
        ...story,
        savedAt: new Date().toISOString()
      };
      
      return new Promise((resolve, reject) => {
        const request = store.put(storyWithTimestamp);
        
        request.onsuccess = () => {
          console.log('IndexedDB: Story saved successfully', story.id);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('IndexedDB: Error saving story', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB: Error in saveStory', error);
      throw error;
    }
  }

  async getStoryById(id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([STORIES_STORE], 'readonly');
      const store = transaction.objectStore(STORIES_STORE);
      
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        
        request.onsuccess = () => {
          console.log('IndexedDB: Retrieved story by ID', id);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('IndexedDB: Error getting story by ID', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB: Error in getStoryById', error);
      throw error;
    }
  }

  async deleteStory(id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([STORIES_STORE], 'readwrite');
      const store = transaction.objectStore(STORIES_STORE);
      
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          console.log('IndexedDB: Story deleted successfully', id);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('IndexedDB: Error deleting story', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB: Error in deleteStory', error);
      throw error;
    }
  }

  async saveFavorite(story) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([FAVORITES_STORE], 'readwrite');
      const store = transaction.objectStore(FAVORITES_STORE);
      
      const favoriteWithTimestamp = {
        ...story,
        savedAt: new Date().toISOString()
      };
      
      return new Promise((resolve, reject) => {
        const request = store.put(favoriteWithTimestamp);
        
        request.onsuccess = () => {
          console.log('IndexedDB: Favorite saved successfully', story.id);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('IndexedDB: Error saving favorite', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB: Error in saveFavorite', error);
      throw error;
    }
  }

  async getAllFavorites() {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([FAVORITES_STORE], 'readonly');
      const store = transaction.objectStore(FAVORITES_STORE);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          console.log('IndexedDB: Retrieved all favorites', request.result.length);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('IndexedDB: Error getting all favorites', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB: Error in getAllFavorites', error);
      throw error;
    }
  }

  async deleteFavorite(id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([FAVORITES_STORE], 'readwrite');
      const store = transaction.objectStore(FAVORITES_STORE);
      
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          console.log('IndexedDB: Favorite deleted successfully', id);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('IndexedDB: Error deleting favorite', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB: Error in deleteFavorite', error);
      throw error;
    }
  }

  async isFavorite(id) {
    try {
      const favorite = await this.getFavoriteById(id);
      return !!favorite;
    } catch (error) {
      console.error('IndexedDB: Error checking if favorite', error);
      return false;
    }
  }

  async getFavoriteById(id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([FAVORITES_STORE], 'readonly');
      const store = transaction.objectStore(FAVORITES_STORE);
      
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB: Error in getFavoriteById', error);
      throw error;
    }
  }

  async clearAllData() {
    try {
      const db = await this.openDB();
      
      // Clear stories
      const storiesTransaction = db.transaction([STORIES_STORE], 'readwrite');
      const storiesStore = storiesTransaction.objectStore(STORIES_STORE);
      await new Promise((resolve, reject) => {
        const request = storiesStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      // Clear favorites
      const favoritesTransaction = db.transaction([FAVORITES_STORE], 'readwrite');
      const favoritesStore = favoritesTransaction.objectStore(FAVORITES_STORE);
      await new Promise((resolve, reject) => {
        const request = favoritesStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      console.log('IndexedDB: All data cleared successfully');
    } catch (error) {
      console.error('IndexedDB: Error clearing all data', error);
      throw error;
    }
  }
}

// Export singleton instance
const indexedDBHelper = new IndexedDBHelper();
export default indexedDBHelper; 