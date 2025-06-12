import { registerUser } from '../../data/api';

class RegisterPagePresenter {
  constructor(view) {
    this.view = view;
  }

  async register(name, email, password) {
    const result = await registerUser(name, email, password);
    if (!result.error) {
      alert('Pendaftaran berhasil');
      window.location.hash = '#/login';
    } else {
      alert('Pendaftaran gagal');
    }
  }
}

export default class RegisterPage {
  constructor() {
    this.presenter = new RegisterPagePresenter(this);
  }

  async render() {
    return `
      <section class="container" role="region" aria-labelledby="register-page-title">
        <h1 id="register-page-title"><i class="fas fa-user-plus"></i> Daftar</h1>
        <p>Silakan isi formulir di bawah ini untuk membuat akun baru.</p>
        <form id="register-form" aria-labelledby="register-form-title">
          <label for="name">Nama:</label>
          <input type="text" id="name" name="name" required aria-labelledby="name-label">
          <label id="name-label" for="name">Nama</label>
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required aria-labelledby="email-label">
          <label id="email-label" for="email">Email</label>
          <label for="password">Kata Sandi:</label>
          <input type="password" id="password" name="password" required aria-labelledby="password-label">
          <label id="password-label" for="password">Kata Sandi</label>
          <button type="submit" aria-label="Daftar">Daftar</button>
        </form>
        <p>Sudah punya akun? <a href="#/login">Masuk di sini</a>.</p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await this.presenter.register(name, email, password);
    });
  }
}
