import { addStory } from '../../data/api';
import { getCameraAccess } from '../../utils/media-access';
import L from 'leaflet';

export default class AddStoryPage {
  constructor() {
    this.lat = null;
    this.lon = null;
  }

  async render() {
    return `
      <section class="container mt-5" role="region" aria-labelledby="add-story-page-title">
        <h1 id="add-story-page-title"><i class="fas fa-plus-circle"></i> Tambah Cerita</h1>
        <form id="add-story-form" class="mb-4">
          <div class="form-group">
            <label for="description"><i class="fas fa-sticky-note"></i> Deskripsi:</label>
            <textarea class="form-control" id="description" name="description" required></textarea>
          </div>
          <div class="form-group">
            <label for="photo"><i class="fas fa-camera"></i> Foto:</label>
            <input type="file" class="form-control-file" id="photo" name="photo" accept="image/*" required>
          </div>
          <button type="button" id="capture-button" class="btn btn-secondary mb-4"><i class="fas fa-camera"></i> Ambil Foto</button>
          <video id="camera-stream" autoplay style="display: none;" class="mb-4"></video>
          <canvas id="photo-canvas" style="display: none;"></canvas>
          <div id="map" style="height: 500px;" class="mt-4"></div>
          <button type="submit" class="btn btn-primary"><i class="fas fa-plus-circle"></i> Tambah Cerita</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('add-story-form');
    const captureButton = document.getElementById('capture-button');
    const cameraStream = document.getElementById('camera-stream');
    const photoCanvas = document.getElementById('photo-canvas');

    captureButton.addEventListener('click', async () => {
      const stream = await getCameraAccess();
      cameraStream.srcObject = stream;
      cameraStream.style.display = 'block';
      photoCanvas.style.display = 'block';
      // Set canvas size to video size for correct capture
      cameraStream.addEventListener('loadedmetadata', () => {
        photoCanvas.width = cameraStream.videoWidth;
        photoCanvas.height = cameraStream.videoHeight;
      });
      // Only allow one capture per stream
      const captureHandler = () => {
        const context = photoCanvas.getContext('2d');
        context.drawImage(cameraStream, 0, 0, photoCanvas.width, photoCanvas.height);
        cameraStream.srcObject.getTracks().forEach(track => track.stop());
        cameraStream.style.display = 'none';
        captureButton.removeEventListener('click', captureHandler);
        // Convert canvas to blob and set as file input
        photoCanvas.toBlob(blob => {
          const file = new File([blob], 'captured-photo.png', { type: 'image/png' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          document.getElementById('photo').files = dataTransfer.files;
        }, 'image/png');
      };
      captureButton.addEventListener('click', captureHandler);
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const description = document.getElementById('description').value;
      const photo = document.getElementById('photo').files[0];
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Anda harus login terlebih dahulu untuk menambahkan cerita.');
        window.location.hash = '#/login';
        return;
      }
      await addStory(description, photo, token, this.lat, this.lon);
      alert('Cerita berhasil ditambahkan');
      form.reset();
    });

    this.#initializeMap();
  }

  #initializeMap() {
    const mapElement = document.getElementById('map');
    const map = L.map(mapElement).setView([0, 0], 2);
    L.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const marker = L.marker([0, 0], { draggable: true }).addTo(map);
    marker.on('dragend', (event) => {
      const position = marker.getLatLng();
      this.lat = position.lat;
      this.lon = position.lng;
      marker.setLatLng(position).bindPopup(`Latitude: ${this.lat}, Longitude: ${this.lon}`).openPopup();
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        map.setView([lat, lon], 13);
        marker.setLatLng([lat, lon]).bindPopup(`Latitude: ${lat}, Longitude: ${lon}`).openPopup();
        this.lat = lat;
        this.lon = lon;
      }, this.#showError);
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  #showError(error) {
    console.error('Error getting location:', error);
  }
}
