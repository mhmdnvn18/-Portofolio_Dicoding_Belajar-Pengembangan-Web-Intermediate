export default class AboutPage {
  async render() {
    return `
      <section class="container mt-5" role="region" aria-labelledby="about-page-title">
        <h1 id="about-page-title"><i class="fas fa-info-circle"></i> Tentang PlantCare</h1>
        <p class="mt-3">Selamat datang di PlantCare, alat manajemen tanaman terbaik Anda. Misi kami adalah membantu Anda melacak pertumbuhan tanaman, jadwal penyiraman, dan kesehatan keseluruhan tanaman Anda. Baik Anda seorang tukang kebun berpengalaman atau baru memulai, PlantCare menyediakan alat yang Anda butuhkan untuk memastikan tanaman Anda tumbuh subur.</p>
        <h2 class="mt-4">Fitur</h2>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">Melacak pertumbuhan tanaman dengan grafik yang terperinci</li>
          <li class="list-group-item">Mengelola jadwal penyiraman dengan kalender bawaan</li>
          <li class="list-group-item">Menangkap dan menyimpan foto tanaman Anda</li>
          <li class="list-group-item">Melihat lokasi tanaman pada peta interaktif</li>
        </ul>
        <h2 class="mt-4">Jenis Bunga</h2>
        <p>Berikut adalah beberapa jenis bunga populer yang dapat Anda tanam dan kelola dengan PlantCare:</p>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>Mawar:</strong> Dikenal karena keindahan dan aromanya, mawar hadir dalam berbagai warna dan ukuran.</li>
          <li class="list-group-item"><strong>Tulip:</strong> Tulip adalah tanaman tahunan yang mekar di musim semi dan hadir dalam banyak warna cerah.</li>
          <li class="list-group-item"><strong>Bunga Matahari:</strong> Bunga matahari dikenal dengan bunga besar berwarna kuning cerah dan dapat tumbuh sangat tinggi.</li>
          <li class="list-group-item"><strong>Anggrek:</strong> Anggrek adalah bunga eksotis yang hadir dalam berbagai warna dan pola.</li>
          <li class="list-group-item"><strong>Lili:</strong> Lili adalah bunga elegan yang hadir dalam berbagai warna dan sering digunakan dalam rangkaian bunga.</li>
        </ul>
        <h2 class="mt-4">Tim Kami</h2>
        <p>PlantCare dikembangkan oleh tim yang terdiri dari penggemar tanaman dan pengembang perangkat lunak yang berdedikasi. Kami berkomitmen untuk memberikan pengalaman terbaik bagi pengguna kami dan terus meningkatkan platform kami.</p>
        <h2 class="mt-4">Hubungi Kami</h2>
        <p>Jika Anda memiliki pertanyaan atau umpan balik, jangan ragu untuk menghubungi kami di <a href="mailto:support@plantcare.com">support@plantcare.com</a>. Kami akan senang mendengar dari Anda!</p>
        <h2 class="mt-4">Ikuti Kami</h2>
        <p>Ikuti kami di media sosial untuk mendapatkan berita dan pembaruan terbaru:</p>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><a href="https://facebook.com/plantcare" target="_blank"><i class="fab fa-facebook"></i> Facebook</a></li>
          <li class="list-group-item"><a href="https://twitter.com/plantcare" target="_blank"><i class="fab fa-twitter"></i> Twitter</a></li>
          <li class="list-group-item"><a href="https://instagram.com/plantcare" target="_blank"><i class="fab fa-instagram"></i> Instagram</a></li>
        </ul>
      </section>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}
