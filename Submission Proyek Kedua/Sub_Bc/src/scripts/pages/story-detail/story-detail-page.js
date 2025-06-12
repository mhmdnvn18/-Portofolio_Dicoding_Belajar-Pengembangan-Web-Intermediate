import { parseActivePathname } from '../../routes/url-parser'; 
import StoryDetailPresenter from './story-detail-presenter';
import * as StoryAPI from '../../data/api';
import IndexedDBHelper from '../../utils/indexeddb';

import {
  generateLoaderAbsoluteTemplate,
  generateStoryDetailTemplate,
  generateStoryDetailErrorTemplate, 
} from '../../templates';
import Map from '../../utils/map'; 

export default class StoryDetailPage {
  #presenter;
  #storyId;
  #storyDetailContentElement;
  #loadingContainerElement;
  #mapInstance = null;
  #currentStory = null;
  #isFavorite = false;

  async render() {
    return `
      <section class="container story-detail-page-container" aria-live="polite">
        <div id="story-detail-loading-container" class="loading-container-absolute"></div>
        <article id="story-detail-content" class="story-detail-content">
          <h2>Memuat Detail Cerita...</h2>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#storyDetailContentElement = document.getElementById('story-detail-content');
    this.#loadingContainerElement = document.getElementById('story-detail-loading-container');

    if (!this.#storyDetailContentElement || !this.#loadingContainerElement) {
      console.error('Elemen DOM krusial (#story-detail-content atau #story-detail-loading-container) tidak ditemukan.');
      document.body.innerHTML = '<p>Error: Struktur halaman tidak lengkap.</p>';
      return;
    }

    const urlParts = parseActivePathname(); 
    this.#storyId = urlParts.id;

    if (!this.#storyId) {
      console.error('ID Cerita tidak ditemukan di URL untuk halaman detail.');
      this.displayError('Halaman tidak valid atau ID Cerita tidak ditemukan.');
      return;
    }
    
    console.log('StoryDetailPage afterRender - Mengambil detail untuk storyId:', this.#storyId);

    this.#presenter = new StoryDetailPresenter({
      view: this,
      model: StoryAPI,
      storyId: this.#storyId,
    });

    await this.#presenter.fetchStoryDetail();
  }

  displayStoryDetail(story) {
    if (!this.#storyDetailContentElement) return;

    this.#currentStory = story;
    this.#storyDetailContentElement.innerHTML = generateStoryDetailTemplate(story);
    
    if (typeof story.lat === 'number' && typeof story.lon === 'number' && typeof this._initializeMapForDetail === 'function') {
      
      if (this.#mapInstance && typeof this.#mapInstance.remove === 'function') {
        this.#mapInstance.remove(); 
      }
      this.#mapInstance = null; 
      this._initializeMapForDetail(story.lat, story.lon, story.name); 
    } else {
      const mapContainer = document.getElementById('story-map-detail');
      if (mapContainer) {
        mapContainer.innerHTML = '<p style="text-align:center; padding:10px;">Lokasi tidak tersedia untuk cerita ini.</p>';
      }
    }

    this.#initializeFavoriteButton();
    this.hideLoading();
  }

  async #initializeFavoriteButton() {
    const favoriteButton = document.getElementById('favorite-button');
    const favoriteText = document.getElementById('favorite-text');
    
    if (!favoriteButton || !favoriteText) return;

    try {
      this.#isFavorite = await IndexedDBHelper.isFavorite(this.#storyId);
      this.#updateFavoriteButtonUI();
      
      favoriteButton.addEventListener('click', () => this.#handleFavoriteClick());
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  }

  #updateFavoriteButtonUI() {
    const favoriteButton = document.getElementById('favorite-button');
    const favoriteText = document.getElementById('favorite-text');
    
    if (!favoriteButton || !favoriteText) return;

    if (this.#isFavorite) {
      favoriteButton.classList.add('saved');
      favoriteText.textContent = 'Hapus dari Favorit';
    } else {
      favoriteButton.classList.remove('saved');
      favoriteText.textContent = 'Tambah ke Favorit';
    }
  }

  async #handleFavoriteClick() {
    if (!this.#currentStory) return;

    try {
      if (this.#isFavorite) {
        await IndexedDBHelper.deleteFavorite(this.#storyId);
        this.#isFavorite = false;
        this.#showNotification('Cerita dihapus dari favorit');
      } else {
        await IndexedDBHelper.saveFavorite(this.#currentStory);
        this.#isFavorite = true;
        this.#showNotification('Cerita ditambahkan ke favorit');
      }
      this.#updateFavoriteButtonUI();
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      this.#showNotification('Gagal mengubah status favorit', 'error');
    }
  }

  #showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : '#f44336'};
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => notification.remove());

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  displayError(message) {
    if (!this.#storyDetailContentElement) return;
    this.#storyDetailContentElement.innerHTML = generateStoryDetailErrorTemplate(message || 'Gagal memuat detail cerita. Silakan coba lagi nanti.');
    this.hideLoading();
  }

  showLoading() {
    if (!this.#loadingContainerElement || !this.#storyDetailContentElement) return;
    this.#loadingContainerElement.innerHTML = generateLoaderAbsoluteTemplate();
    this.#loadingContainerElement.style.display = 'block';
    this.#storyDetailContentElement.innerHTML = '';
  }

  hideLoading() {
    if (!this.#loadingContainerElement) return;
    this.#loadingContainerElement.innerHTML = '';
    this.#loadingContainerElement.style.display = 'none';
  }

  
  async _initializeMapForDetail(lat, lon, storyCreatorName = 'Lokasi Cerita') {
  
    const mapContainer = document.getElementById('story-map-detail'); 
    
    if (mapContainer) { 
      mapContainer.innerHTML = ''; 
      try {

        this.#mapInstance = await Map.build('#story-map-detail', { 
          center: [lat, lon],
          zoom: 16, 
        });

        if (this.#mapInstance) {
            const markerOptions = { title: storyCreatorName }; // Opsi untuk marker
            const popupOptions = { content: `<strong>${storyCreatorName}</strong><br>Lokasi cerita.` }; // Opsi untuk popup
            this.#mapInstance.addMarker([lat, lon], markerOptions, popupOptions);
        } else {
            throw new Error("Map.build tidak mengembalikan instance peta.");
        }
      } catch (error) {
        console.error('Gagal menginisialisasi peta di halaman detail:', error);
        if(mapContainer) mapContainer.innerHTML = '<p class="error-message" style="text-align:center; padding:20px;">Peta tidak dapat dimuat.</p>';
      }
    } else {
      console.warn('Kontainer peta dengan ID "story-map-detail" tidak ditemukan di DOM.');
    }
  }
}