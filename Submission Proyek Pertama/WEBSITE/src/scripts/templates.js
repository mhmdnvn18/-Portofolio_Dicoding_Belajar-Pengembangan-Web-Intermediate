// File: src/scripts/templates.js

// Diasumsikan Anda memiliki utilitas ini di path yang benar
// Jika belum ada, Anda perlu membuatnya atau mengganti pemanggilan showFormattedDate
// dengan new Date(isoDateString).toLocaleDateString('id-ID', {...}) secara langsung.
import { showFormattedDate } from './utils';

export function generateLoaderTemplate() {
  return `
    <div class="loader"></div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}

// --- Navigasi Utama (Sudah disesuaikan) ---
export function generateMainNavigationListTemplate() {
  return `
    <li><a id="report-list-button" class="report-list-button" href="#/">Daftar Laporan</a></li>
    <li><a id="statistics-button" class="statistics-button" href="#/statistics">Statistik Wilayah</a></li>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Daftar</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="new-report-button" class="btn new-report-button" href="#/new">Buat Laporan <i class="fas fa-plus"></i></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `;
}

// --- Template untuk Daftar Cerita (Sudah disesuaikan) ---
export function generateReportsListEmptyTemplate(message = 'Saat ini, tidak ada laporan yang dapat ditampilkan.') {
  return `
    <div id="reports-list-empty" class="reports-list__empty">
      <h2>Tidak ada laporan yang tersedia</h2>
      <p>${message}</p>
    </div>
  `;
}

export function generateReportsListErrorTemplate(message) {
  return `
    <div id="reports-list-error" class="reports-list__error">
      <h2>Terjadi kesalahan pengambilan daftar laporan</h2>
      <p>${message || 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

// Template untuk Item Cerita di Daftar (nama fungsi dipertahankan generateReportItemTemplate)
export function generateReportItemTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
  status = 'Menunggu Tindak Lanjut',
}) {
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return 'Tidak ada deskripsi.';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };
  const locationText = (typeof lat === 'number' && typeof lon === 'number') ? 'Lokasi disertakan' : '';
  const placeholderImage = 'images/placeholder-image.jpg';

  return `
    <div tabindex="0" class="story-item" data-storyid="${id}">
      <img 
        class="story-item__image" 
        src="${photoUrl || placeholderImage}" 
        alt="Gambar laporan oleh ${name || 'Warga'}"
        onerror="this.onerror=null;this.src='${placeholderImage}';"
      >
      <div class="story-item__body">
        <div class="story-item__main">
          <h2 class="story-item__title">${name || 'Warga Anonim'}</h2>
          <div class="story-item__more-info">
            <div class="story-item__createdat">
              <i class="fas fa-calendar-alt"></i> ${showFormattedDate(createdAt, 'id-ID')}
            </div>
            ${locationText ? `
            <div class="story-item__location-info">
              <i class="fas fa-map-marker-alt"></i> ${locationText}
            </div>` : ''}
            <div class="story-item__status">
              <i class="fas fa-tasks"></i> Status: <span>${status}</span>
            </div>
          </div>
        </div>
        <div class="story-item__description">
          ${truncateDescription(description)}
        </div>
        <div class="story-item__more-info">
          <div class="story-item__author">
            Dilaporkan oleh: ${name || 'Warga Anonim'}
          </div>
        </div>
        <a class="btn story-item__read-more" href="#/stories/${id}">
          Detail Laporan <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}

// --- Template untuk Detail Cerita (Implementasi Lebih Lengkap) ---
export function generateStoryDetailTemplate(story) {
  if (!story) {
    return generateStoryDetailErrorTemplate();
  }

  const {
    name = 'Warga Anonim',
    description = 'Tidak ada deskripsi yang diberikan untuk laporan ini.',
    photoUrl = 'images/placeholder-image.jpg',
    createdAt,
    lat,
    lon,
    locationName,
    status = 'Menunggu Tindak Lanjut',
    statistics = null, // Statistik wilayah, bisa berupa objek atau null
    responses = [],
  } = story;

  // Fungsi untuk menampilkan statistik wilayah jika tersedia
  function renderStatistics(statistics) {
    if (!statistics || typeof statistics !== 'object' || Object.keys(statistics).length === 0) {
      return '<p>(Statistik laporan per wilayah akan ditampilkan di sini)</p>';
    }
    // Contoh: statistik = { totalReports: 12, resolved: 5, unresolved: 7 }
    return `
      <ul>
        ${Object.entries(statistics)
          .map(
            ([key, value]) =>
              `<li><b>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</b> ${value}</li>`
          )
          .join('')}
      </ul>
    `;
  }

  return `
    <article class="story-detail">
      <header class="story-detail__header">
        <div class="story-detail__meta">
          <h1 class="story-detail__title">${name}</h1>
          <div class="story-detail__info">
            <span class="story-detail__date">
              <i class="fas fa-calendar-alt"></i> 
              ${showFormattedDate(createdAt, 'id-ID')}
            </span>
            ${generateLocationBadge(lat, lon, locationName)}
            <span class="story-detail__status">
              <i class="fas fa-tasks"></i> Status: <b>${status}</b>
            </span>
          </div>
        </div>
      </header>

      <div class="story-detail__content">
        <div class="story-detail__media">
          <figure class="story-detail__figure">
            <img 
              src="${photoUrl}" 
              alt="Foto utama laporan oleh ${name}" 
              class="story-detail__main-image"
              onerror="this.onerror=null;this.src='images/placeholder-image.jpg';" 
            />
          </figure>
        </div>

        <div class="story-detail__text">
          <section class="story-detail__description">
            <h2 class="story-detail__section-title">
              <i class="fas fa-file-alt"></i> Deskripsi Laporan
            </h2>
            <div class="story-detail__description-content">
              ${formatDescription(description)}
            </div>
          </section>

          ${generateLocationSection(lat, lon)}

          <section class="story-detail__status-section">
            <h2 class="story-detail__section-title">
              <i class="fas fa-info-circle"></i> Status Tindak Lanjut
            </h2>
            <div class="story-detail__status-content">
              <p>Status laporan: <b>${status}</b></p>
              <p>(Fitur update status oleh instansi akan segera hadir)</p>
            </div>
          </section>

          <section class="story-detail__statistics-section">
            <h2 class="story-detail__section-title">
              <i class="fas fa-chart-bar"></i> Statistik Wilayah
            </h2>
            <div class="story-detail__statistics-content">
              ${renderStatistics(statistics)}
            </div>
          </section>

          <section class="story-detail__responses-section">
            <h2 class="story-detail__section-title">
              <i class="fas fa-comments"></i> Tanggapan Instansi/Masyarakat
            </h2>
            <div class="story-detail__responses-content">
              ${responses.length > 0 ? responses.map(r => `<div class="response-item">${r}</div>`).join('') : '<p>Belum ada tanggapan.</p>'}
              <p>(Kolom tanggapan akan segera hadir)</p>
            </div>
          </section>
        </div>
      </div>

      <footer class="story-detail__footer" style="position: relative; z-index: 99;">
        <div class="story-detail__actions" style="position: relative; z-index: 100;">
          <a href="#/" class="btn btn-back" style="position: relative; z-index: 100;">
            <i class="fas fa-arrow-left"></i> Kembali ke Daftar
          </a>
          <div id="story-actions" class="story-detail__action-buttons" style="position: relative; z-index: 100;">
            <!-- Action buttons will be injected here -->
          </div>
        </div>
      </footer>
    </article>
  `;
}

// Helper functions
function formatDescription(description) {
  return description
    .split('\n')
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('');
}

function generateLocationBadge(lat, lon, locationName = '') {
  if (typeof lat !== 'number' || typeof lon !== 'number') return '';
  
  return `
    <span class="story-detail__location-badge">
      <i class="fas fa-map-marker-alt"></i> 
      ${locationName || 'Lokasi: ' + lat.toFixed(5) + ', ' + lon.toFixed(5)}
    </span>
  `;
}

function generateLocationSection(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return '';

  return `
    <section class="story-detail__location">
      <h2 class="story-detail__section-title">
        <i class="fas fa-map-marked-alt"></i> Lokasi Cerita
      </h2>
      <div class="story-detail__map-container">
        <div id="story-map-detail" class="story-detail__map">
          Memuat peta...
        </div>
        <div class="story-detail__coordinates">
          <span class="coordinates-label">Koordinat:</span>
          <span class="coordinates-value">
            ${lat.toFixed(5)}, ${lon.toFixed(5)}
          </span>
        </div>
      </div>
    </section>
  `;
}

// Fungsi ini diubah namanya agar lebih jelas untuk error di halaman detail cerita
export function generateStoryDetailErrorTemplate(message) {
  return `
    <div id="story-detail-error" class="story-detail__error">
      <h2>Terjadi kesalahan pengambilan detail cerita</h2>
      <p>${message || 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

function generateStoryDetailHeader(name, createdAt, lat, lon) {
  return `
    <header class="story-detail__header">
      <div class="story-detail__meta">
        <div class="story-detail__title-container">
          <h1 class="story-detail__title">${name}</h1>
          <div class="story-detail__badges">
            ${generateLocationBadge(lat, lon)}
          </div>
        </div>
        <div class="story-detail__info-container">
          <span class="story-detail__date">
            <i class="fas fa-calendar-alt"></i> 
            ${showFormattedDate(createdAt, 'id-ID')}
          </span>
          <span class="story-detail__author">
            <i class="fas fa-user"></i>
            Oleh: ${name || 'Pengguna Anonim'}
          </span>
          ${lat && lon ? `
            <span class="story-detail__location">
              <i class="fas fa-map-marker-alt"></i>
              Lokasi: ${lat.toFixed(5)}, ${lon.toFixed(5)}
            </span>
          ` : ''}
        </div>
      </div>
    </header>
  `;
}



export function generateCommentsListEmptyTemplate() {
  return ''; 
}

export function generateCommentsListErrorTemplate(message) {
  return '';
}

export function generateReportCommentItemTemplate({ photoUrlCommenter, nameCommenter, body }) {
  return ''; 
}

export function generateDamageLevelMinorTemplate() { return ''; }
export function generateDamageLevelModerateTemplate() { return ''; }
export function generateDamageLevelSevereTemplate() { return ''; }
export function generateDamageLevelBadge(damageLevel) { return ''; }

export function generateReportDetailImageTemplate(imageUrl = null, alt = '') {
  const defaultImage = 'images/placeholder-image.jpg';
  return `
    <img class="story-additional-image" src="${imageUrl || defaultImage}" alt="${alt || 'Gambar Tambahan'}" onerror="this.onerror=null;this.src='${defaultImage}';">
  `;
}


export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateSaveReportButtonTemplate() { 
  return `
    <button 
      id="story-detail-save" 
      class="btn btn-action"
      style="position: relative; z-index: 100;"
    >
      <i class="fas fa-bookmark"></i> Simpan Cerita
    </button>
  `;
}

export function generateRemoveReportButtonTemplate() { 
  return `
    <button 
      id="story-detail-remove" 
      class="btn btn-action btn-danger"
      style="position: relative; z-index: 100;"
    >
      <i class="fas fa-trash"></i> Hapus Cerita
    </button>
  `;
}

const STORAGE_KEY = 'BOOKMARKED_STORIES';

const BookmarkStorage = {
  getAllBookmarks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },

  saveBookmark(story) {
    const bookmarks = this.getAllBookmarks();
    if (!this.isBookmarked(story.id)) {
      bookmarks.push(story);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }
  },

  removeBookmark(storyId) {
    const bookmarks = this.getAllBookmarks();
    const filteredBookmarks = bookmarks.filter((story) => story.id !== storyId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredBookmarks));
  },

  isBookmarked(storyId) {
    const bookmarks = this.getAllBookmarks();
    return bookmarks.some((story) => story.id === storyId);
  },
};

export default BookmarkStorage;