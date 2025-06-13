export default class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async getRegistered({ name, email, password }) {
    this.#view.showSubmitLoadingButton(); 
    try {
      const response = await this.#model.registerUser({ name, email, password });

      if (!response.ok) { 
        console.error('Register attempt failed (API response not OK):', response);
        this.#view.registeredFailed(response.message || 'Proses registrasi gagal.');
        return;
      }

      this.#view.registeredSuccessfully(response.message);

    } catch (error) { 
      console.error('Register attempt failed (unexpected error):', error);
      this.#view.registeredFailed(error.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      this.#view.hideSubmitLoadingButton(); 
    }
  }
}