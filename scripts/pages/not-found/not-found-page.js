export default class NotFoundPage {
  async render() {
    return `
      <section class="container" style="text-align:center; padding:60px 0;">
        <h1 style="font-size:3rem; color:#d32f2f;">404</h1>
        <p style="font-size:1.5rem;">Halaman tidak ditemukan</p>
        <a href="#/" class="btn" style="margin-top:2rem;">Kembali ke Beranda</a>
      </section>
    `;
  }
  async afterRender() {}
}
