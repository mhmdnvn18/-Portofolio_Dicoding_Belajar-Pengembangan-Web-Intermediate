import RegisterPage from '../pages/auth/register/register-page';
import LoginPage from '../pages/auth/login/login-page';
import HomePage from '../pages/home/home-page';         
import NewPage from '../pages/new/new-page';             

import StoryDetailPage from '../pages/story-detail/story-detail-page'; 

import BookmarkPage from '../pages/bookmark/bookmark-page'; 
import * as StoryAPI from '../data/api';

import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth'; 
export const routes = {
  
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/new': () => checkAuthenticatedRoute(new NewPage()),
  
  
  '/stories/:id': () => checkAuthenticatedRoute(new StoryDetailPage()), 
  
  '/bookmark': () => checkAuthenticatedRoute(new BookmarkPage()),

  '/statistics': () => ({
    render: async () => {
      // Ambil semua laporan dari API
      const response = await StoryAPI.getAllStories({});
      let statsHtml = '';
      let chartHtml = '';
      if (response.ok && Array.isArray(response.listStory)) {
        const stories = response.listStory;
        const total = stories.length;
        const withLocation = stories.filter(s => typeof s.lat === 'number' && typeof s.lon === 'number').length;
        const withoutLocation = total - withLocation;

        // Contoh statistik tambahan: jumlah laporan per bulan
        const perMonth = {};
        stories.forEach(story => {
          if (story.createdAt) {
            const date = new Date(story.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            perMonth[key] = (perMonth[key] || 0) + 1;
          }
        });
        const monthLabels = Object.keys(perMonth).sort();
        const monthData = monthLabels.map(label => perMonth[label]);

        statsHtml = `
          <table style="margin:auto;max-width:400px;width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;">Total Laporan</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${total}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;">Laporan dengan Lokasi</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${withLocation}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;">Laporan tanpa Lokasi</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${withoutLocation}</td>
            </tr>
          </table>
        `;

        // Chart.js grafik laporan per bulan
        chartHtml = `
          <div style="max-width:600px;margin:2rem auto;">
            <canvas id="statistics-chart" height="120"></canvas>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <script>
            (function() {
              const ctx = document.getElementById('statistics-chart').getContext('2d');
              new window.Chart(ctx, {
                type: 'bar',
                data: {
                  labels: ${JSON.stringify(monthLabels)},
                  datasets: [{
                    label: 'Jumlah Laporan per Bulan',
                    data: ${JSON.stringify(monthData)},
                    backgroundColor: '#b71c1c',
                  }]
                },
                options: {
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Statistik Laporan per Bulan' }
                  },
                  scales: {
                    x: { title: { display: true, text: 'Bulan' } },
                    y: { title: { display: true, text: 'Jumlah Laporan' }, beginAtZero: true }
                  }
                }
              });
            })();
          </script>
        `;
      } else {
        statsHtml = `<p style="text-align:center;">Gagal memuat data statistik.</p>`;
      }
      return `
        <section class="container">
          <h1 class="section-title">Statistik Wilayah</h1>
          <div style="text-align:center;padding:2rem;">
            ${statsHtml}
            ${chartHtml}
          </div>
        </section>
      `;
    },
    afterRender: async () => {},
  }),
  
};