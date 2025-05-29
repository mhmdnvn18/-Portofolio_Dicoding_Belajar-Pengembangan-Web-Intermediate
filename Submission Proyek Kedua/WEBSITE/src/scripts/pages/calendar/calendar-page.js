// Model
class CalendarModel {
  getCalendarData() {
    return JSON.parse(localStorage.getItem('calendarData')) || [];
  }
  saveCalendarData(data) {
    localStorage.setItem('calendarData', JSON.stringify(data));
  }
}

// Presenter
class CalendarPagePresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }
  addSchedule(schedule) {
    const data = this.model.getCalendarData();
    data.push(schedule);
    this.model.saveCalendarData(data);
    this.view.displayCalendar(data);
  }
  getCalendarData() {
    return this.model.getCalendarData();
  }
  displayCalendar() {
    this.view.displayCalendar(this.model.getCalendarData());
  }
}

// View
export default class CalendarPage {
  constructor() {
    this.model = new CalendarModel();
    this.presenter = new CalendarPagePresenter(this, this.model);
  }

  async render() {
    return `
      <section class="container mt-5" role="region" aria-labelledby="calendar-page-title">
        <h1 id="calendar-page-title"><i class="fas fa-calendar-alt"></i> Kalender Penyiraman</h1>
        <form id="calendar-form" class="mb-4">
          <div class="form-group">
            <label for="plant-name"><i class="fas fa-leaf"></i> Nama Tanaman:</label>
            <input type="text" class="form-control" id="plant-name" name="plant-name" required>
          </div>
          <div class="form-group">
            <label for="watering-date"><i class="fas fa-calendar-day"></i> Tanggal Penyiraman:</label>
            <input type="date" class="form-control" id="watering-date" name="watering-date" required>
          </div>
          <button type="submit" class="btn btn-primary"><i class="fas fa-plus-circle"></i> Tambah Jadwal</button>
        </form>
        <table id="calendar-table" class="table mt-4">
          <thead>
            <tr>
              <th>Nama Tanaman</th>
              <th>Tanggal Penyiraman</th>
            </tr>
          </thead>
          <tbody id="calendar-list"></tbody>
        </table>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('calendar-form');

    // Add dummy data
    const dummyData = [
      { plantName: 'Rose', wateringDate: '2023-05-01' },
      { plantName: 'Tulip', wateringDate: '2023-05-05' },
      { plantName: 'Sunflower', wateringDate: '2023-05-10' },
      { plantName: 'Daisy', wateringDate: '2023-05-15' },
      { plantName: 'Lavender', wateringDate: '2023-05-20' },
      { plantName: 'Orchid', wateringDate: '2023-05-25' },
      { plantName: 'Jasmine', wateringDate: '2023-05-30' },
      { plantName: 'Marigold', wateringDate: '2023-06-04' },
      { plantName: 'Lily', wateringDate: '2023-06-09' },
      { plantName: 'Chrysanthemum', wateringDate: '2023-06-14' },
      { plantName: 'Peony', wateringDate: '2023-06-19' },
      { plantName: 'Daffodil', wateringDate: '2023-06-24' },
      { plantName: 'Hydrangea', wateringDate: '2023-06-29' },
      { plantName: 'Begonia', wateringDate: '2023-07-04' },
      { plantName: 'Petunia', wateringDate: '2023-07-09' }
    ];

    const existingData = this.presenter.getCalendarData();
    if (existingData.length === 0) {
      dummyData.forEach(data => this.presenter.addSchedule(data));
    } else {
      this.presenter.displayCalendar();
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const plantName = document.getElementById('plant-name').value;
      const wateringDate = document.getElementById('watering-date').value;
      this.presenter.addSchedule({ plantName, wateringDate });
      form.reset();
    });
  }

  displayCalendar(data) {
    const calendarList = document.getElementById('calendar-list');
    calendarList.innerHTML = '';
    data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.plantName}</td>
        <td>${item.wateringDate}</td>
      `;
      calendarList.appendChild(row);
    });
  }
}
