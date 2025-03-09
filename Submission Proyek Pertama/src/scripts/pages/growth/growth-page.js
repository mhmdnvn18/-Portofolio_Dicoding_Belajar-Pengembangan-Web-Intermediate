import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default class GrowthPage {
  async render() {
    return `
      <section class="container mt-5" role="region" aria-labelledby="growth-page-title">
        <h1 id="growth-page-title"><i class="fas fa-chart-line"></i> Grafik Pertumbuhan Tanaman</h1>
        <form id="growth-form" class="mb-4">
          <div class="form-group">
            <label for="plant-name"><i class="fas fa-leaf"></i> Nama Tanaman:</label>
            <input type="text" class="form-control" id="plant-name" name="plant-name" required>
          </div>
          <div class="form-group">
            <label for="growth-date"><i class="fas fa-calendar-day"></i> Tanggal:</label>
            <input type="date" class="form-control" id="growth-date" name="growth-date" required>
          </div>
          <div class="form-group">
            <label for="plant-height"><i class="fas fa-ruler-vertical"></i> Tinggi (cm):</label>
            <input type="number" class="form-control" id="plant-height" name="plant-height" required>
          </div>
          <button type="submit" class="btn btn-primary"><i class="fas fa-plus-circle"></i> Tambah Data</button>
        </form>
        <canvas id="growth-chart" width="400" height="200"></canvas>
        <table id="growth-table" class="table mt-4">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Tinggi (cm)</th>
            </tr>
          </thead>
          <tbody id="growth-list"></tbody>
        </table>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('growth-form');
    const ctx = document.getElementById('growth-chart').getContext('2d');
    const growthList = document.getElementById('growth-list');
    const growthData = {
      labels: [],
      datasets: [{
        label: 'Tinggi Tanaman (cm)',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      }]
    };
    const growthChart = new Chart(ctx, {
      type: 'line',
      data: growthData,
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // Load data from Pelacak Tanaman
    const plants = JSON.parse(localStorage.getItem('growthData')) || [];
    plants.forEach(plant => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${plant.growthDate}</td>
        <td>${plant.plantHeight}</td>
      `;
      growthList.appendChild(row);
      growthData.labels.push(plant.growthDate);
      growthData.datasets[0].data.push(plant.plantHeight);
    });

    growthChart.update();

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const plantName = document.getElementById('plant-name').value;
      const growthDate = document.getElementById('growth-date').value;
      const plantHeight = document.getElementById('plant-height').value;
      growthData.labels.push(growthDate);
      growthData.datasets[0].data.push(plantHeight);
      growthChart.update();

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${growthDate}</td>
        <td>${plantHeight}</td>
      `;
      growthList.appendChild(row);

      form.reset();
    });
  }
}
