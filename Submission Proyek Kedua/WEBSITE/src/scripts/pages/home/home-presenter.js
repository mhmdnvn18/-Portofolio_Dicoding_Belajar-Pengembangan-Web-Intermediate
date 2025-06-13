import IndexedDBHelper from '../../utils/indexeddb';

export default class HomePresenter {
  #view;
  #model; 

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  
  async initialGalleryAndMap() {
    
    if (typeof this.#view.showStoriesLoading === 'function') {
      this.#view.showStoriesLoading();
    } else {
      console.error('HomePresenter: this.#view.showStoriesLoading is not a function. Check HomePage.js');
    }

    if (typeof this.#view.initialMap === 'function') {
      try {
        await this.#view.initialMap();
      } catch (mapError) {
        console.error('HomePresenter: Error during map initialization via view:', mapError);
      }
    } else {
      console.warn('HomePresenter: this.#view.initialMap is not a function. Map initialization skipped by presenter.');
    }

    try {

      const response = await this.#model.getAllStories({});

      if (!response || typeof response.ok === 'undefined') {
        throw new Error('Respons tidak valid dari API laporan.');
      }

      if (!response.ok) {
        console.error('HomePresenter: Failed to fetch stories (API response not OK):', response);
        if (typeof this.#view.populateStoriesListError === 'function') {
          this.#view.populateStoriesListError(response.message || 'Gagal memuat laporan dari server.');
        }
        return; 
      }

      if (response.listStory && Array.isArray(response.listStory)) {
        if (response.listStory.length > 0) {
          // Auto-save stories to IndexedDB for offline access
          this.#saveStoriesToIndexedDB(response.listStory);
          
          if (typeof this.#view.populateStoriesList === 'function') {
            this.#view.populateStoriesList(response.listStory);
          } else {
            console.error('HomePresenter: this.#view.populateStoriesList is not a function.');
          }
        } else {
 
          if (typeof this.#view.populateStoriesListEmpty === 'function') {
            this.#view.populateStoriesListEmpty();
          } else {
            console.error('HomePresenter: this.#view.populateStoriesListEmpty is not a function.');
          }
        }
      } else {
        
        console.error('HomePresenter: Invalid story list data in API response:', response);
        if (typeof this.#view.populateStoriesListError === 'function') {
          this.#view.populateStoriesListError('Data laporan tidak valid diterima dari server.');
        }
      }

    } catch (error) { 
      console.error('HomePresenter: Unexpected error fetching stories:', error);
      
      // Try to load from IndexedDB if online fetch fails
      await this.#tryLoadFromIndexedDB(error);
    } finally {
      if (typeof this.#view.hideStoriesLoading === 'function') {
        this.#view.hideStoriesLoading();
      } else {
        console.error('HomePresenter: this.#view.hideStoriesLoading is not a function.');
      }
    }
  }

  // Save stories to IndexedDB for offline access
  async #saveStoriesToIndexedDB(stories) {
    try {
      console.log('HomePresenter: Saving stories to IndexedDB...');
      
      // Save each story individually
      const savePromises = stories.map(story => 
        IndexedDBHelper.saveStory(story).catch(err => {
          console.warn('Failed to save story to IndexedDB:', story.id, err);
        })
      );
      
      await Promise.allSettled(savePromises);
      console.log('HomePresenter: Stories saved to IndexedDB successfully');
    } catch (error) {
      console.error('HomePresenter: Error saving stories to IndexedDB:', error);
    }
  }

  // Try to load stories from IndexedDB when online fetch fails
  async #tryLoadFromIndexedDB(originalError) {
    try {
      console.log('HomePresenter: Trying to load stories from IndexedDB...');
      const cachedStories = await IndexedDBHelper.getAllStories();
      
      if (cachedStories && cachedStories.length > 0) {
        console.log('HomePresenter: Loaded stories from IndexedDB:', cachedStories.length);
        
        if (typeof this.#view.populateStoriesList === 'function') {
          this.#view.populateStoriesList(cachedStories);
        }
        
        // Show offline notification
        this.#showOfflineNotification();
      } else {
        // No cached data available
        if (typeof this.#view.populateStoriesListError === 'function') {
          this.#view.populateStoriesListError(
            'Tidak dapat terhubung ke server dan tidak ada data offline tersedia. ' +
            'Periksa koneksi internet Anda dan coba lagi.'
          );
        }
      }
    } catch (indexedDBError) {
      console.error('HomePresenter: Error loading from IndexedDB:', indexedDBError);
      
      if (typeof this.#view.populateStoriesListError === 'function') {
        this.#view.populateStoriesListError(
          originalError.message || 'Terjadi kesalahan saat mengambil data cerita.'
        );
      }
    }
  }

  // Show offline notification
  #showOfflineNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 90px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff9800;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 9999;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    
    notification.innerHTML = `
      <i class="fas fa-wifi-slash"></i>
      <span>Menampilkan data offline</span>
      <a href="#/offline" style="color: white; text-decoration: underline;">
        Lihat semua data offline
      </a>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

}