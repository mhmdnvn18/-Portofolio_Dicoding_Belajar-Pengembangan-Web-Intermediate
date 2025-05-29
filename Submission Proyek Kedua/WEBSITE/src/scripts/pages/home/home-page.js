import { getAllStories } from '../../data/api';
import L from 'leaflet';

export default class HomePage {
  async render() {
    return `
      <section class="container mt-5" role="region" aria-labelledby="home-page-title">
        <h1 id="home-page-title" class="text-center"><i class="fas fa-home"></i> Selamat Datang di PlantCare</h1>
        <p class="mt-3 text-center">PlantCare adalah aplikasi andalan Anda untuk mengelola tanaman. Melacak pertumbuhan tanaman, jadwal penyiraman, dan kesehatan keseluruhan tanaman Anda dengan mudah. Antarmuka yang ramah pengguna dan fitur-fitur canggih kami membuat perawatan tanaman menjadi sederhana dan menyenangkan.</p>
        
        <div class="row mt-5">
          <div class="col-md-6">
            <h2 class="mt-4"><i class="fas fa-info-circle"></i> Tentang Kami</h2>
            <p>PlantCare dikembangkan oleh tim yang terdiri dari penggemar tanaman dan pengembang perangkat lunak yang berdedikasi. Kami berkomitmen untuk memberikan pengalaman terbaik bagi pengguna kami dan terus meningkatkan platform kami.</p>
          </div>
          <div class="col-md-6">
            <h2 class="mt-4"><i class="fas fa-seedling"></i> Layanan Kami</h2>
            <ul class="list-group list-group-flush">
              <li class="list-group-item">Melacak pertumbuhan tanaman dengan grafik yang terperinci</li>
              <li class="list-group-item">Mengelola jadwal penyiraman dengan kalender bawaan</li>
              <li class="list-group-item">Menangkap dan menyimpan foto tanaman Anda</li>
              <li class="list-group-item">Melihat lokasi tanaman pada peta interaktif</li>
            </ul>
          </div>
        </div>
        
        <div class="row mt-5">
          <div class="col-md-6">
            <h2 class="mt-4"><i class="fas fa-comments"></i> Testimoni</h2>
            <p>Berikut adalah apa yang dikatakan pengguna kami tentang PlantCare:</p>
            <blockquote class="blockquote">
              <p class="mb-0">"PlantCare telah merevolusi cara saya mengelola kebun saya. Grafik pertumbuhan dan kalender penyiraman sangat membantu!" - Jane Doe</p>
            </blockquote>
            <blockquote class="blockquote">
              <p class="mb-0">"Saya suka betapa mudahnya melacak tanaman saya dengan PlantCare. Aplikasi ini ramah pengguna dan memiliki semua fitur yang saya butuhkan." - John Smith</p>
            </blockquote>
          </div>
          <div class="col-md-6">
            <h2 class="mt-4"><i class="fas fa-envelope"></i> Hubungi Kami</h2>
            <p>Jika Anda memiliki pertanyaan atau umpan balik, jangan ragu untuk menghubungi kami di <a href="mailto:support@plantcare.com">support@plantcare.com</a>. Kami akan senang mendengar dari Anda!</p>
            <h2 class="mt-4"><i class="fas fa-share-alt"></i> Ikuti Kami</h2>
            <p>Ikuti kami di media sosial untuk mendapatkan berita dan pembaruan terbaru:</p>
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><a href="https://facebook.com/plantcare" target="_blank"><i class="fab fa-facebook"></i> Facebook</a></li>
              <li class="list-group-item"><a href="https://twitter.com/plantcare" target="_blank"><i class="fab fa-twitter"></i> Twitter</a></li>
              <li class="list-group-item"><a href="https://instagram.com/plantcare" target="_blank"><i class="fab fa-instagram"></i> Instagram</a></li>
            </ul>
          </div>
        </div>

        <h2 class="mt-5 text-center"><i class="fas fa-book"></i> Cerita Pengguna</h2>
        <div id="story-list" class="row mt-4"></div>
        <div id="map" style="height: 500px;" class="mt-4"></div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Anda harus login terlebih dahulu untuk melihat cerita pengguna.');
      window.location.hash = '#/login';
      return;
    }

    const storyList = document.getElementById('story-list');
    const stories = await getAllStories(token);

    const mapElement = document.getElementById('map');
    const map = L.map(mapElement).setView([-2.548926, 118.0148634], 5); // Centered on Indonesia

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    stories.listStory.forEach(story => {
      const storyItem = document.createElement('div');
      storyItem.className = 'col-md-4 mb-4';
      storyItem.innerHTML = `
        <div class="card h-100">
          <img src="${story.photoUrl}" class="card-img-top" alt="Foto ${story.name}">
          <div class="card-body">
            <h5 class="card-title"><i class="fas fa-user"></i> ${story.name}</h5>
            <p class="card-text"><i class="fas fa-calendar-day"></i> ${new Date(story.createdAt).toLocaleDateString()}</p>
            <p class="card-text"><i class="fas fa-sticky-note"></i> ${story.description}</p>
          </div>
        </div>
      `;
      storyList.appendChild(storyItem);

      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker.bindPopup(`<b>${story.name}</b><br>${story.description}`);
      }
    });
  }
}
