import IndexedDBHelper from '../../utils/indexeddb';
import { generateReportItemTemplate, generateLoaderTemplate, generateReportsListEmptyTemplate } from '../../templates';

class OfflinePage {
  constructor() {
    this.stories = [];
    this.favorites = [];
  }

  async afterRender() {
    await this.loadOfflineData();
    this.initializeEventListeners();
  }

  async render() {
    return `
      <div class="offline-page">
        <div class="container">
          <div class="offline-header">
            <div class="offline-header__content">
              <div class="offline-status">
                <i class="fas fa-wifi-slash"></i>
                <h1>Mode Offline</h1>
                <p>Anda sedang offline. Menampilkan data yang tersimpan di perangkat.</p>
              </div>
            </div>
          </div>

          <div class="offline-content">
            <div class="offline-tabs">
              <button id="stories-tab" class="tab-button active" data-tab="stories">
                <i class="fas fa-book"></i> Cerita Tersimpan
              </button>
              <button id="favorites-tab" class="tab-button" data-tab="favorites">
                <i class="fas fa-heart"></i> Favorit
              </button>
            </div>

            <div class="tab-content">
              <div id="stories-content" class="tab-panel active">
                <div class="tab-header">
                  <h2><i class="fas fa-database"></i> Cerita dari IndexedDB</h2>
                  <p>Data cerita yang tersimpan secara lokal di perangkat Anda.</p>
                </div>
                <div id="offline-stories-list" class="offline-stories-container">
                  ${generateLoaderTemplate()}
                </div>
              </div>

              <div id="favorites-content" class="tab-panel">
                <div class="tab-header">
                  <h2><i class="fas fa-heart"></i> Cerita Favorit</h2>
                  <p>Cerita yang telah Anda simpan sebagai favorit.</p>
                </div>
                <div id="offline-favorites-list" class="offline-favorites-container">
                  ${generateLoaderTemplate()}
                </div>
              </div>
            </div>

            <div class="offline-actions">
              <button id="refresh-offline-data" class="btn btn-outline">
                <i class="fas fa-sync-alt"></i> Refresh Data
              </button>
              <button id="clear-offline-data" class="btn btn-transparent">
                <i class="fas fa-trash"></i> Hapus Semua Data
              </button>
              <a href="#/" class="btn">
                <i class="fas fa-arrow-left"></i> Kembali ke Beranda
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>
        .offline-page {
          min-height: 80vh;
          padding: 2rem 0;
        }

        .offline-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem 0;
          text-align: center;
          margin-bottom: 2rem;
          border-radius: 12px;
        }

        .offline-status {
          max-width: 600px;
          margin: 0 auto;
        }

        .offline-status i {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.8;
        }

        .offline-status h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .offline-status p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .offline-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 2rem;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .tab-button {
          flex: 1;
          padding: 1rem 2rem;
          border: none;
          background: #f5f5f5;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .tab-button:hover {
          background: #e9e9e9;
        }

        .tab-button.active {
          background: #2c63d1;
          color: white;
        }

        .tab-content {
          min-height: 400px;
        }

        .tab-panel {
          display: none;
        }

        .tab-panel.active {
          display: block;
        }

        .tab-header {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .tab-header h2 {
          color: #2c63d1;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .tab-header p {
          color: #666;
          margin: 0;
        }

        .offline-stories-container,
        .offline-favorites-container {
          min-height: 300px;
          position: relative;
        }

        .offline-stories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .offline-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e5e5;
        }

        .offline-empty {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .offline-empty i {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .offline-stats {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin: 1rem 0;
          flex-wrap: wrap;
        }

        .stat-item {
          background: white;
          padding: 1rem 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #2c63d1;
        }

        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .offline-header {
            padding: 2rem 0;
          }

          .offline-status h1 {
            font-size: 2rem;
          }

          .tab-button {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
          }

          .offline-actions {
            flex-direction: column;
            align-items: center;
          }

          .offline-actions .btn {
            width: 100%;
            max-width: 300px;
          }
        }
      </style>
    `;
  }

  async loadOfflineData() {
    try {
      // Load stories from IndexedDB
      this.stories = await IndexedDBHelper.getAllStories();
      this.favorites = await IndexedDBHelper.getAllFavorites();

      console.log('Offline data loaded:', {
        stories: this.stories.length,
        favorites: this.favorites.length
      });

      // Update UI
      this.renderStoriesList();
      this.renderFavoritesList();
      this.updateStats();

    } catch (error) {
      console.error('Failed to load offline data:', error);
      this.showError('Gagal memuat data offline');
    }
  }

  renderStoriesList() {
    const container = document.getElementById('offline-stories-list');
    if (!container) return;

    if (this.stories.length === 0) {
      container.innerHTML = `
        <div class="offline-empty">
          <i class="fas fa-database"></i>
          <h3>Tidak ada cerita tersimpan</h3>
          <p>Cerita akan tersimpan secara otomatis ketika Anda mengaksesnya saat online.</p>
        </div>
      `;
      return;
    }

    const storiesHTML = this.stories
      .sort((a, b) => new Date(b.savedAt || b.createdAt) - new Date(a.savedAt || a.createdAt))
      .map(story => generateReportItemTemplate(story))
      .join('');

    container.innerHTML = `
      <div class="offline-stories-grid">
        ${storiesHTML}
      </div>
    `;

    // Add click listeners
    container.querySelectorAll('.story-item').forEach(item => {
      item.addEventListener('click', () => {
        const storyId = item.dataset.storyid;
        window.location.hash = `#/stories/${storyId}`;
      });
    });
  }

  renderFavoritesList() {
    const container = document.getElementById('offline-favorites-list');
    if (!container) return;

    if (this.favorites.length === 0) {
      container.innerHTML = `
        <div class="offline-empty">
          <i class="fas fa-heart"></i>
          <h3>Tidak ada cerita favorit</h3>
          <p>Simpan cerita sebagai favorit untuk mengaksesnya saat offline.</p>
        </div>
      `;
      return;
    }

    const favoritesHTML = this.favorites
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      .map(story => generateReportItemTemplate(story))
      .join('');

    container.innerHTML = `
      <div class="offline-stories-grid">
        ${favoritesHTML}
      </div>
    `;

    // Add click listeners
    container.querySelectorAll('.story-item').forEach(item => {
      item.addEventListener('click', () => {
        const storyId = item.dataset.storyid;
        window.location.hash = `#/stories/${storyId}`;
      });
    });
  }

  updateStats() {
    const statsContainer = document.querySelector('.tab-header');
    if (!statsContainer) return;

    const statsHTML = `
      <div class="offline-stats">
        <div class="stat-item">
          <div class="stat-number">${this.stories.length}</div>
          <div class="stat-label">Cerita</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${this.favorites.length}</div>
          <div class="stat-label">Favorit</div>
        </div>
      </div>
    `;

    // Insert stats after header in active tab
    const activePanel = document.querySelector('.tab-panel.active .tab-header');
    if (activePanel && !activePanel.querySelector('.offline-stats')) {
      activePanel.insertAdjacentHTML('beforeend', statsHTML);
    }
  }

  initializeEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Refresh data
    const refreshBtn = document.getElementById('refresh-offline-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat...';
        refreshBtn.disabled = true;
        
        await this.loadOfflineData();
        
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
        refreshBtn.disabled = false;
      });
    }

    // Clear data
    const clearBtn = document.getElementById('clear-offline-data');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.showClearConfirmation();
      });
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-content`).classList.add('active');

    // Update stats for active tab
    this.updateStats();
  }

  showClearConfirmation() {
    if (confirm('Apakah Anda yakin ingin menghapus semua data offline? Tindakan ini tidak dapat dibatalkan.')) {
      this.clearAllData();
    }
  }

  async clearAllData() {
    try {
      await IndexedDBHelper.clearAllData();
      this.stories = [];
      this.favorites = [];
      
      this.renderStoriesList();
      this.renderFavoritesList();
      this.updateStats();
      
      this.showMessage('Semua data offline berhasil dihapus', 'success');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      this.showError('Gagal menghapus data offline');
    }
  }

  showMessage(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  showError(message) {
    this.showMessage(message, 'error');
  }
}

export default OfflinePage; 