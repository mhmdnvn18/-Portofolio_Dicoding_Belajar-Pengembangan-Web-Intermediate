# BerbagiCerita PWA 🚀

Progressive Web App untuk berbagi cerita dan pengalaman dengan fitur lokasi. Aplikasi ini dibangun menggunakan Vanilla JavaScript dan mengimplementasikan semua fitur PWA modern.

## ✨ Fitur PWA

### ✅ Kriteria Wajib Terpenuhi:

1. **💾 Installable PWA**
   - Web App Manifest
   - Add to Homescreen
   - Standalone mode

2. **🔄 Offline Support**
   - Service Worker untuk caching
   - Offline fallback pages
   - Cache strategy untuk static assets

3. **🔔 Push Notifications**
   - VAPID integration dengan Dicoding API
   - Background sync
   - Notification click handling

4. **💿 IndexedDB Storage**
   - Auto-save stories untuk akses offline
   - Favorite stories storage
   - Data management (save, read, delete)

5. **🏗️ Application Shell Architecture**
   - Pemisahan konten statis dan dinamis
   - Fast loading dengan shell caching

### 🔧 Fitur Tambahan:

- **📱 Responsive Design** - Optimal di semua device
- **♿ Accessibility** - WCAG compliance
- **🎨 Modern UI/UX** - Material Design inspired
- **🗺️ Location Integration** - Maps dengan Leaflet
- **📸 Camera API** - Upload foto dari kamera
- **🔐 Authentication** - JWT token management

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool:** Webpack 5
- **PWA:** Service Worker, Web App Manifest, Push API
- **Storage:** IndexedDB, LocalStorage
- **Maps:** Leaflet.js
- **Icons:** Font Awesome
- **API:** Dicoding Story API

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 atau lebih baru)
- npm atau yarn

### Installation

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Development mode**
   ```bash
   npm run start-dev
   ```
   Aplikasi akan berjalan di `http://localhost:9000`

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Serve production build**
   ```bash
   npm run serve
   ```

## 📁 Project Structure

```
src/
├── index.html                 # Main HTML file
├── public/                    # Static assets
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   ├── favicon.png           # App icon
│   └── images/               # Image assets
├── scripts/                  # JavaScript modules
│   ├── index.js             # Main entry point
│   ├── config.js            # App configuration
│   ├── templates.js         # HTML templates
│   ├── data/                # API & data management
│   │   ├── api.js          # API calls
│   │   ├── api-mapper.js   # Data mapping
│   │   └── bookmark-storage.js
│   ├── pages/               # Page components
│   │   ├── app.js          # Main app
│   │   ├── auth/           # Authentication pages
│   │   ├── home/           # Home page
│   │   ├── new/            # Create story page
│   │   ├── story-detail/   # Story detail page
│   │   ├── bookmark/       # Bookmark page
│   │   └── offline/        # Offline page
│   ├── routes/             # Routing
│   │   ├── routes.js       # Route definitions
│   │   └── url-parser.js   # URL parser
│   └── utils/              # Utilities
│       ├── indexeddb.js    # IndexedDB helper
│       ├── push-notification.js # Push notification
│       ├── auth.js         # Authentication utils
│       ├── camera.js       # Camera utils
│       ├── map.js          # Map utils
│       └── index.js        # Common utils
└── styles/                 # CSS files
    ├── styles.css          # Main styles
    └── responsives.css     # Responsive styles
```

## 🎯 PWA Implementation Details

### 1. Web App Manifest
- **File:** `src/public/manifest.json`
- **Features:** App name, icons, theme color, display mode
- **Result:** Installable dengan "Add to Homescreen"

### 2. Service Worker
- **File:** `src/public/sw.js`
- **Strategy:** Cache First untuk static assets, Network First untuk API
- **Features:** 
  - Asset caching
  - Offline fallback
  - Push notification handling
  - Background sync

### 3. IndexedDB Implementation
- **File:** `src/scripts/utils/indexeddb.js`
- **Database:** BerbagiCeritaDB
- **Stores:** stories, favorites
- **Operations:** Create, Read, Update, Delete
- **Auto-save:** Stories dari API otomatis tersimpan untuk akses offline

### 4. Push Notifications
- **File:** `src/scripts/utils/push-notification.js`
- **VAPID Key:** Dicoding API public key
- **Features:** Subscribe, unsubscribe, notification click handling

### 5. Offline Strategy
- **Static Assets:** Cache first dengan service worker
- **API Data:** Network first, fallback ke IndexedDB
- **Offline Page:** `/offline` untuk manajemen data offline
- **UI Feedback:** Status koneksi dan mode offline

## 🔧 Development Scripts

```bash
# Development server with hot reload
npm run start-dev

# Production build
npm run build

# Serve production build locally
npm run serve

# Format code with Prettier
npm run prettier:write
```

## 🌐 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 11.1+
- ✅ Edge 79+

**PWA Features Support:**
- Service Worker: ✅ Modern browsers
- Web App Manifest: ✅ Modern browsers
- Push API: ✅ Chrome, Firefox, Edge
- IndexedDB: ✅ All modern browsers

## 📱 Mobile Experience

- **Progressive Enhancement:** Berfungsi di semua device
- **Touch Friendly:** UI optimal untuk touch interface
- **Responsive:** Breakpoints untuk phone, tablet, desktop
- **Fast Loading:** Optimized assets dan caching strategy

## 🔒 Security

- **HTTPS Required:** PWA features memerlukan HTTPS
- **Content Security Policy:** Implemented untuk keamanan
- **Token Management:** Secure JWT handling
- **Data Validation:** Input sanitization dan validation

## 🚀 Deployment

### GitHub Pages (Recommended)
1. Push ke repository GitHub
2. Enable GitHub Pages di repository settings
3. GitHub Actions akan otomatis build dan deploy

### Manual Deployment
1. Build aplikasi: `npm run build`
2. Upload folder `dist/` ke hosting provider
3. Pastikan HTTPS enabled untuk PWA features

## 🐛 Troubleshooting

### Service Worker Issues
```bash
# Clear browser cache dan reload
# Atau gunakan DevTools > Application > Storage > Clear Storage
```

### Push Notification Not Working
- Pastikan aplikasi running di HTTPS
- Check browser permission untuk notifications
- Verify VAPID key configuration

### IndexedDB Issues
- Check browser support dan permissions
- Clear IndexedDB di DevTools jika corrupt

## 📞 Support

Jika mengalami masalah atau punya pertanyaan:

2. **Email:** adityanavra567@gmail.com
3. **Documentation:** Check README.md dan komentar di code

## 📄 License

MIT License - Silakan gunakan untuk pembelajaran dan pengembangan.

## 🙏 Acknowledgments

- **Dicoding Academy** - API dan pembelajaran PWA
- **Leaflet.js** - Interactive maps
- **Font Awesome** - Icons
- **MDN Web Docs** - PWA documentation

---

**Dibuat dengan ❤️ oleh Aditya Navra Erlangga untuk submission Dicoding PWA** 