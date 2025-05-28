import { getCameraAccess } from '../../utils/media-access';

class PlantPagePresenter {
  constructor(view) {
    this.view = view;
  }

  addPlant(plant) {
    const plants = this.getPlants();
    plants.push(plant);
    localStorage.setItem('plants', JSON.stringify(plants));
    this.view.displayPlants(plants);
  }

  getPlants() {
    try {
      return JSON.parse(localStorage.getItem('plants')) || [];
    } catch (error) {
      console.error('Error parsing plants from localStorage:', error);
      return [];
    }
  }

  deletePlant(plantId) {
    let plants = this.getPlants();
    plants = plants.filter(plant => plant.id !== plantId);
    localStorage.setItem('plants', JSON.stringify(plants));
    this.view.displayPlants(plants);
  }

  markWatered(plantId) {
    const plants = this.getPlants();
    const plant = plants.find(plant => plant.id === plantId);
    if (plant) {
      plant.lastWateredDate = new Date().toISOString().split('T')[0];
      localStorage.setItem('plants', JSON.stringify(plants));
      this.view.displayPlants(plants);
    }
  }
}

export default class PlantPage {
  constructor() {
    this.presenter = new PlantPagePresenter(this);
    this.lat = null;
    this.lon = null;
  }

  async render() {
    return `
      <section class="container mt-5" role="region" aria-labelledby="plant-page-title">
        <h1 id="plant-page-title"><i class="fas fa-seedling"></i> Pelacak Tanaman</h1>
        <form id="plant-form" class="mb-4" aria-labelledby="plant-form-title">
          <div class="form-group">
            <label for="plant-name"><i class="fas fa-leaf"></i> Nama Tanaman:</label>
            <input type="text" class="form-control" id="plant-name" name="plant-name" required aria-labelledby="plant-name-label">
            <label id="plant-name-label" for="plant-name">Nama Tanaman</label>
          </div>
          <div class="form-group">
            <label for="plant-type"><i class="fas fa-seedling"></i> Jenis Tanaman:</label>
            <input type="text" class="form-control" id="plant-type" name="plant-type" required aria-labelledby="plant-type-label">
            <label id="plant-type-label" for="plant-type">Jenis Tanaman</label>
          </div>
          <div class="form-group">
            <label for="watering-frequency"><i class="fas fa-tint"></i> Frekuensi Penyiraman (hari):</label>
            <input type="number" class="form-control" id="watering-frequency" name="watering-frequency" required aria-labelledby="watering-frequency-label">
            <label id="watering-frequency-label" for="watering-frequency">Frekuensi Penyiraman (hari)</label>
          </div>
          <div class="form-group">
            <label for="last-watered-date"><i class="fas fa-calendar-day"></i> Tanggal Terakhir Disiram:</label>
            <input type="date" class="form-control" id="last-watered-date" name="last-watered-date" required aria-labelledby="last-watered-date-label">
            <label id="last-watered-date-label" for="last-watered-date">Tanggal Terakhir Disiram</label>
          </div>
          <div class="form-group">
            <label for="notes"><i class="fas fa-sticky-note"></i> Catatan:</label>
            <textarea class="form-control" id="notes" name="notes" aria-labelledby="notes-label"></textarea>
            <label id="notes-label" for="notes">Catatan</label>
          </div>
          <div class="form-group">
            <label for="plant-photo"><i class="fas fa-camera"></i> Foto Tanaman:</label>
            <input type="file" class="form-control-file" id="plant-photo" name="plant-photo" accept="image/*" required aria-labelledby="plant-photo-label">
            <label id="plant-photo-label" for="plant-photo">Foto Tanaman</label>
          </div>
          <button type="submit" class="btn btn-primary" aria-label="Tambah Tanaman"><i class="fas fa-plus-circle"></i> Tambah Tanaman</button>
        </form>
        <video id="camera-stream" autoplay style="display: none;" class="mb-4"></video>
        <button id="capture-button" class="btn btn-secondary mb-4"><i class="fas fa-camera"></i> Ambil Foto</button>
        <canvas id="photo-canvas" style="display: none;"></canvas>
        <div id="plant-list" class="plant-grid"></div>
        <div id="map" style="height: 500px;" class="mt-4"></div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('plant-form');
    const captureButton = document.getElementById('capture-button');
    const cameraStream = document.getElementById('camera-stream');
    const photoCanvas = document.getElementById('photo-canvas');

    captureButton.addEventListener('click', async () => {
      const stream = await getCameraAccess();
      cameraStream.srcObject = stream;
      cameraStream.style.display = 'block';
      photoCanvas.style.display = 'block';

      captureButton.addEventListener('click', () => {
        const context = photoCanvas.getContext('2d');
        context.drawImage(cameraStream, 0, 0, photoCanvas.width, photoCanvas.height);
        cameraStream.srcObject.getTracks().forEach(track => track.stop());
        cameraStream.style.display = 'none';
      });
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const plant = {
        id: Date.now().toString(),
        name: document.getElementById('plant-name').value,
        type: document.getElementById('plant-type').value,
        wateringFrequency: document.getElementById('watering-frequency').value,
        lastWateredDate: document.getElementById('last-watered-date').value,
        notes: document.getElementById('notes').value,
        photoUrl: URL.createObjectURL(document.getElementById('plant-photo').files[0]),
        lat: this.lat,
        lon: this.lon
      };
      this.presenter.addPlant(plant);
      form.reset();
    });

    this.#initializeMap();
    this.presenter.displayPlants(this.presenter.getPlants());

    // Add dummy data
    const dummyPlants = [
      {
        id: '1',
        name: 'Rose',
        type: 'Flower',
        wateringFrequency: 3,
        lastWateredDate: '2023-05-01',
        notes: 'Needs full sun',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -6.200000,
        lon: 106.816666
      },
      {
        id: '2',
        name: 'Tulip',
        type: 'Flower',
        wateringFrequency: 5,
        lastWateredDate: '2023-05-05',
        notes: 'Prefers cool weather',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -6.300000,
        lon: 106.816666
      },
      {
        id: '3',
        name: 'Sunflower',
        type: 'Flower',
        wateringFrequency: 7,
        lastWateredDate: '2023-05-10',
        notes: 'Grows tall',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -6.400000,
        lon: 106.816666
      },
      {
        id: '4',
        name: 'Daisy',
        type: 'Flower',
        wateringFrequency: 4,
        lastWateredDate: '2023-05-12',
        notes: 'Needs partial sun',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -6.500000,
        lon: 106.816666
      },
      {
        id: '5',
        name: 'Lavender',
        type: 'Flower',
        wateringFrequency: 6,
        lastWateredDate: '2023-05-15',
        notes: 'Prefers dry soil',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -6.600000,
        lon: 106.816666
      },
      {
        id: '6',
        name: 'Orchid',
        type: 'Flower',
        wateringFrequency: 8,
        lastWateredDate: '2023-05-18',
        notes: 'Needs high humidity',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -6.700000,
        lon: 106.816666
      },
      {
        id: '7',
        name: 'Jasmine',
        type: 'Flower',
        wateringFrequency: 2,
        lastWateredDate: '2023-05-20',
        notes: 'Fragrant flowers',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -6.800000,
        lon: 106.816666
      },
      {
        id: '8',
        name: 'Marigold',
        type: 'Flower',
        wateringFrequency: 3,
        lastWateredDate: '2023-05-22',
        notes: 'Bright orange flowers',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -6.900000,
        lon: 106.816666
      },
      {
        id: '9',
        name: 'Lily',
        type: 'Flower',
        wateringFrequency: 5,
        lastWateredDate: '2023-05-25',
        notes: 'Elegant white flowers',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -7.000000,
        lon: 106.816666
      },
      {
        id: '10',
        name: 'Chrysanthemum',
        type: 'Flower',
        wateringFrequency: 4,
        lastWateredDate: '2023-05-28',
        notes: 'Variety of colors',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -7.100000,
        lon: 106.816666
      },
      {
        id: '11',
        name: 'Peony',
        type: 'Flower',
        wateringFrequency: 6,
        lastWateredDate: '2023-06-01',
        notes: 'Large, fragrant blooms',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -7.200000,
        lon: 106.816666
      },
      {
        id: '12',
        name: 'Daffodil',
        type: 'Flower',
        wateringFrequency: 7,
        lastWateredDate: '2023-06-04',
        notes: 'Bright yellow flowers',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -7.300000,
        lon: 106.816666
      },
      {
        id: '13',
        name: 'Hydrangea',
        type: 'Flower',
        wateringFrequency: 5,
        lastWateredDate: '2023-06-07',
        notes: 'Large, colorful clusters',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -7.400000,
        lon: 106.816666
      },
      {
        id: '14',
        name: 'Begonia',
        type: 'Flower',
        wateringFrequency: 3,
        lastWateredDate: '2023-06-10',
        notes: 'Bright, waxy leaves',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -7.500000,
        lon: 106.816666
      },
      {
        id: '15',
        name: 'Petunia',
        type: 'Flower',
        wateringFrequency: 4,
        lastWateredDate: '2023-06-13',
        notes: 'Colorful, trumpet-shaped flowers',
        photoUrl: 'https://via.placeholder.com/100',
        lat: -7.600000,
        lon: 106.816666
      }
    ];

    const existingPlants = this.presenter.getPlants();
    if (existingPlants.length === 0) {
      dummyPlants.forEach(plant => this.presenter.addPlant(plant));
    }
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

  displayPlants(plants) {
    const plantList = document.getElementById('plant-list');
    plantList.innerHTML = '';

    plants.forEach((plant) => {
      const daysUntilNextWatering = this.#calculateDaysUntilNextWatering(plant.lastWateredDate, plant.wateringFrequency);
      const wateringStatus = daysUntilNextWatering <= 0 ? 'Needs Watering' : `Next Watering in ${daysUntilNextWatering} days`;

      const listItem = document.createElement('div');
      listItem.className = 'plant-card';
      listItem.innerHTML = `
        <img src="${plant.photoUrl}" alt="Foto ${plant.name}" width="100">
        <p><i class="fas fa-leaf"></i> ${plant.name}</p>
        <p><i class="fas fa-seedling"></i> ${plant.type}</p>
        <p><i class="fas fa-tint"></i> Frekuensi Penyiraman: ${plant.wateringFrequency} hari</p>
        <p><i class="fas fa-calendar-day"></i> Terakhir Disiram: ${new Date(plant.lastWateredDate).toLocaleDateString()}</p>
        <p><i class="fas fa-sticky-note"></i> Catatan: ${plant.notes}</p>
        <p class="watering-status ${daysUntilNextWatering <= 0 ? 'needs-watering' : ''}">${wateringStatus}</p>
        <button class="mark-watered-button btn btn-success" data-id="${plant.id}">Tandai sebagai Disiram</button>
        <button class="delete-plant-button btn btn-danger" data-id="${plant.id}">Hapus</button>
        <div class="mini-map" id="mini-map-${plant.id}" style="height: 150px;"></div>
      `;
      plantList.appendChild(listItem);

      if (plant.lat && plant.lon) {
        const miniMap = L.map(`mini-map-${plant.id}`).setView([plant.lat, plant.lon], 13);
        L.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(miniMap);
        L.marker([plant.lat, plant.lon]).addTo(miniMap);
      }

      listItem.querySelector('.mark-watered-button').addEventListener('click', () => {
        this.presenter.markWatered(plant.id);
      });

      listItem.querySelector('.delete-plant-button').addEventListener('click', () => {
        this.presenter.deletePlant(plant.id);
      });
    });
  }

  #calculateDaysUntilNextWatering(lastWateredDate, wateringFrequency) {
    const lastWatered = new Date(lastWateredDate);
    const nextWateringDate = new Date(lastWatered);
    nextWateringDate.setDate(lastWatered.getDate() + wateringFrequency);
    const today = new Date();
    const timeDiff = nextWateringDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  }
}
