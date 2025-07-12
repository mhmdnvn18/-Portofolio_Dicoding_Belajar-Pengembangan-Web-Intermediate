import { loginUser } from '../../data/api';

class LoginPagePresenter {
  constructor(view) {
    this.view = view;
  }

  async login(email, password) {
    const result = await loginUser(email, password);
    if (!result.error) {
      localStorage.setItem('token', result.loginResult.token);
      alert('Login berhasil');
      window.location.hash = '#/';
    } else {
      alert('Login gagal');
    }
  }
}

export default class LoginPage {
  constructor() {
    this.presenter = new LoginPagePresenter(this);
  }

  async render() {
    return `
      <section class="container" role="region" aria-labelledby="login-page-title">
        <h1 id="login-page-title"><i class="fas fa-sign-in-alt"></i> Masuk</h1>
        <p>Silakan masukkan email dan kata sandi Anda untuk masuk.</p>
        <form id="login-form" aria-labelledby="login-form-title">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required aria-labelledby="email-label">
          <label id="email-label" for="email">Email</label>
          <label for="password">Kata Sandi:</label>
          <input type="password" id="password" name="password" required aria-labelledby="password-label">
          <label id="password-label" for="password">Kata Sandi</label>
          <button type="submit" aria-label="Login">Masuk</button>
        </form>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a>.</p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await this.presenter.login(email, password);
    });
  }
}
