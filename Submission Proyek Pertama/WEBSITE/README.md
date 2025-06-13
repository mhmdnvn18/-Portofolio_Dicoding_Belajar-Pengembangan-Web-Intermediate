# Api Dicoding = 'https://story-api.dicoding.dev/v1';
# Key MapTiler= 'pGG8hVIJSfVPuzEtT1Eu';

# Portal Laporan & Aspirasi Warga

## Cara Menjalankan Web Ini

1. **Pastikan Node.js dan npm sudah terpasang di komputer Anda.**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Jalankan mode pengembangan (development):**
   ```bash
   npm run start
   ```
   atau
   ```bash
   npm run dev
   ```
   Web akan berjalan di `http://localhost:8080` (atau port lain sesuai konfigurasi).

4. **Build untuk produksi:**
   ```bash
   npm run build
   ```
   Hasil build akan ada di folder `dist/`.

5. **Buka di browser:**
   - Untuk development: buka `http://localhost:8080`
   - Untuk produksi: buka file `dist/index.html` menggunakan server lokal (misal: `npx serve dist`)

## Catatan

- Pastikan koneksi internet untuk mengakses CDN (Google Fonts, Font Awesome, Chart.js, dll).
- Untuk fitur peta, API key MapTiler sudah disediakan di file konfigurasi.
- Jika ingin mengganti API endpoint, edit file `src/scripts/config.js`.