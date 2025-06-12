import L from 'leaflet';

export default class MapPage {
  async render() {
    return `
      <section class="container" role="region" aria-labelledby="map-page-title">
        <h1 id="map-page-title"><i class="fas fa-map"></i> Peta Sebaran Tanaman</h1>
        <p>Gunakan peta di bawah ini untuk melihat sebaran tanaman berdasarkan asalnya. Anda dapat melihat lokasi tanaman pada peta interaktif.</p>
        <div id="map" style="height: 500px;"></div>
        <h2>Cara Menggunakan</h2>
        <p>Untuk melihat informasi lebih lanjut tentang tanaman, klik pada penanda di peta.</p>
        <h2>Lapisan Peta</h2>
        <p>Beralih antara berbagai lapisan peta menggunakan kontrol di sudut kanan atas peta. Anda dapat memilih antara OpenStreetMap, MapTiler Streets, dan MapTiler Satellite views.</p>
      </section>
    `;
  }

  async afterRender() {
    const mapElement = document.getElementById('map');
    const map = L.map(mapElement).setView([-2.548926, 118.0148634], 5); // Centered on Indonesia

    const baseLayers = {
      'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      'MapTiler Streets': L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAP_SERVICE_API_KEY}`, {
        attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> contributors'
      }),
      'MapTiler Satellite': L.tileLayer(`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${import.meta.env.VITE_MAP_SERVICE_API_KEY}`, {
        attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> contributors'
      })
    };

    baseLayers['OpenStreetMap'].addTo(map);
    L.control.layers(baseLayers).addTo(map);

    const plantData = [
      { name: 'Anggrek Bulan', lat: -6.208763, lon: 106.845599, description: 'Jakarta' },
      { name: 'Rafflesia Arnoldii', lat: -3.318606, lon: 102.231928, description: 'Bengkulu' },
      { name: 'Bunga Bangkai', lat: -0.789275, lon: 113.921327, description: 'Kalimantan' },
      { name: 'Melati', lat: -6.914744, lon: 107.609810, description: 'Bandung' },
      { name: 'Kamboja', lat: -8.409518, lon: 115.188919, description: 'Bali' },
      { name: 'Kenanga', lat: -7.797068, lon: 110.370529, description: 'Yogyakarta' },
      { name: 'Cempaka', lat: 1.48218, lon: 124.84892, description: 'Manado' },
      { name: 'Bougenville', lat: -7.257472, lon: 112.752088, description: 'Surabaya' },
      { name: 'Edelweiss', lat: -8.340539, lon: 115.091949, description: 'Gunung Rinjani' },
      { name: 'Kembang Sepatu', lat: -6.175110, lon: 106.865036, description: 'Jakarta' },
      { name: 'Teratai', lat: -6.917464, lon: 107.619123, description: 'Bandung' },
      { name: 'Mawar', lat: -6.208763, lon: 106.845599, description: 'Jakarta' },
      { name: 'Tulip', lat: -6.208763, lon: 106.845599, description: 'Jakarta' },
      { name: 'Anggrek Hitam', lat: -1.237927, lon: 116.852852, description: 'Kalimantan Timur' },
      { name: 'Sedap Malam', lat: -6.208763, lon: 106.845599, description: 'Jakarta' }
    ];

    plantData.forEach(plant => {
      const marker = L.marker([plant.lat, plant.lon]).addTo(map);
      marker.bindPopup(`<b>${plant.name}</b><br>${plant.description}`);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.#showPosition.bind(this), this.#showError);
    } else {
      this.#showError({ message: 'Geolocation is not supported by this browser.' });
    }
  }

  #showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker([lat, lon]).addTo(map)
      .bindPopup(`Latitude: ${lat}, Longitude: ${lon}`).openPopup();
  }

  #showError(error) {
    const mapElement = document.getElementById('map');
    mapElement.innerHTML = `<p class="error-message">Error getting location: ${error.message}</p>`;
    console.error('Error getting location:', error);
  }
}
