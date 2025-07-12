import BookmarkStorage from '../../data/bookmark-storage';
import { generateReportItemTemplate, generateReportsListEmptyTemplate } from '../../templates';

export default class BookmarkPage {
  async render() {
    return `
      <section class="content">
        <h1 class="section-title">Laporan Favorit</h1>
        <div id="bookmarks-container" class="stories-list">
        </div>
      </section>
    `;
  }

  async afterRender() {
    const bookmarksContainer = document.getElementById('bookmarks-container');
    const bookmarks = BookmarkStorage.getAllBookmarks();

    if (!bookmarks.length) {
      bookmarksContainer.innerHTML = `
        <div class="stories-list__empty">
          <h2>Tidak ada laporan favorit</h2>
          <p>Simpan laporan sebagai favorit untuk mengaksesnya di sini.</p>
        </div>
      `;
      return;
    }

    const bookmarksHTML = bookmarks.map((story) => 
      generateReportItemTemplate({
        id: story.id,
        name: story.name,
        description: story.description,
        photoUrl: story.photoUrl,
        createdAt: story.createdAt,
        lat: story.lat,
        lon: story.lon,
      })
    ).join('');

    bookmarksContainer.innerHTML = bookmarksHTML;

    const storyItems = document.querySelectorAll('.story-item');
    storyItems.forEach(item => {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-remove';
      removeBtn.innerHTML = '<i class="fas fa-trash"></i> Hapus';
      
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const storyId = item.dataset.storyid;
        BookmarkStorage.removeBookmark(storyId);
        item.remove();
        
        if (!BookmarkStorage.getAllBookmarks().length) {
          bookmarksContainer.innerHTML = `
            <div class="stories-list__empty">
              <h2>Tidak ada laporan favorit</h2>
              <p>Simpan laporan sebagai favorit untuk mengaksesnya di sini.</p>
            </div>
          `;
        }
      });

      item.querySelector('.story-item__body').appendChild(removeBtn);
    });
  }
}
