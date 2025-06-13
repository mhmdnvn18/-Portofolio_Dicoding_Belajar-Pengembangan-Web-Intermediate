# Laporan

**Laporan** adalah aplikasi Progressive Web App (PWA) untuk berbagi laporan, cerita, dan aspirasi warga berbasis lokasi. Aplikasi ini mendukung mode offline, notifikasi push, serta penyimpanan data lokal menggunakan IndexedDB.

## Fitur Utama

- **Autentikasi**: Registrasi dan login pengguna.
- **Buat Laporan**: Tambah cerita/laporan dengan foto dan lokasi.
- **Daftar Laporan**: Lihat daftar laporan dari pengguna lain.
- **Detail Laporan**: Lihat detail, lokasi, dan komentar pada laporan.
- **Favorit**: Simpan laporan ke daftar favorit untuk akses offline.
- **Offline Mode**: Akses laporan dan favorit tanpa koneksi internet.
- **Push Notification**: Dapatkan notifikasi untuk laporan baru.
- **PWA**: Install aplikasi ke perangkat seperti aplikasi native.

## Instalasi & Pengembangan

1. **Clone repository**
   ```bash
   git clone https://github.com/username/laporan.git
   cd laporan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Jalankan aplikasi (mode development)**
   ```bash
   npm run start
   ```

4. **Build untuk produksi**
   ```bash
   npm run build
   ```

5. **Akses aplikasi**
   - Buka `http://localhost:8080` di browser.

## Teknologi

- **Frontend**: JavaScript, HTML5, CSS3, [Leaflet](https://leafletjs.com/) (peta), [Tiny Slider](https://github.com/ganlanyuan/tiny-slider)
- **PWA**: Service Worker, Manifest, Push Notification
- **Storage**: IndexedDB, LocalStorage
- **API**: [Dicoding Story API](https://story-api.dicoding.dev/v1)

## Struktur Folder

- `src/` - Sumber kode aplikasi
  - `scripts/` - JavaScript modular (pages, utils, data, templates)
  - `styles/` - CSS
  - `public/` - Aset publik (manifest, sw.js, gambar)
- `dist/` - Hasil build produksi

## Konfigurasi

- Ubah variabel API di `src/scripts/config.js` jika perlu.
- Pastikan API key MapTiler sudah benar.

## Kontribusi

Pull request dan issue sangat diterima!

## Lisensi

MIT License

---

> Dibuat untuk submission kelas Dicoding "Belajar Pengembangan Web Aplikasi Intermediate".
