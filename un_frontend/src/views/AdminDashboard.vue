<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <h1>UN-Habitat Projects Dashboard</h1>
      <router-link to="/projects" class="projects-link">
        View Projects List
      </router-link>
    </header>

    <div v-if="loading" class="loading-message">
      <p>Loading dashboard data...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchData" class="retry-button">Retry</button>
    </div>

    <div v-else class="dashboard-content">
      <div class="chart-container">
        <div class="chart-card">
          <h2>Projects by Country (Top 15)</h2>
          <div class="chart-wrapper">
            <apexchart
              type="bar"
              height="400"
              :options="countryChartOptions"
              :series="countrySeries"
            ></apexchart>
          </div>
        </div>
      </div>

      <div class="chart-row">
        <div class="chart-card half-width">
          <h2>Projects by Lead Org Unit</h2>
          <div class="chart-wrapper">
            <apexchart
              type="pie"
              height="350"
              :options="orgUnitChartOptions"
              :series="orgUnitSeries"
            ></apexchart>
          </div>
        </div>

        <div class="chart-card half-width">
          <h2>Projects by Theme (Top 10)</h2>
          <div class="chart-wrapper">
            <apexchart
              type="bar"
              height="350"
              :options="themeChartOptions"
              :series="themeSeries"
            ></apexchart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'
import api from "@/api";

export default {
  name: 'AdminDashboard',
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      countryData: [],
      orgUnitData: [],
      themeData: [],
      loading: true,
      error: null,
    }
  },
  computed: {
    countrySeries() {
      const filteredData = this.countryData
        .filter(item => item.country && item.country.trim() !== '')
        .sort((a, b) => b.project_count - a.project_count)
        .slice(0, 15);
      
      return [{
        name: 'Projects',
        data: filteredData.map(item => item.project_count)
      }]
    },
    countryChartOptions() {
      const categories = this.countryData
        .filter(item => item.country && item.country.trim() !== '')
        .sort((a, b) => b.project_count - a.project_count)
        .slice(0, 15)
        .map(item => item.country || 'Unspecified');
      
      return {
        chart: {
          type: 'bar',
          toolbar: { show: true },
          animations: { enabled: true }
        },
        colors: ['#009EDB'],
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
            dataLabels: { position: 'top' }
          }
        },
        dataLabels: {
          enabled: true,
          offsetX: -6,
          style: {
            fontSize: '12px',
            colors: ['#666666']
          }
        },
        xaxis: {
          categories: categories,
          labels: {
            style: {
              colors: '#666666',
              fontSize: '12px'
            }
          },
          title: {
            text: 'Number of Projects',
            style: {
              color: '#666666',
              fontSize: '14px'
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              colors: '#666666',
              fontSize: '12px'
            }
          }
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " projects"
            }
          }
        },
        grid: {
          borderColor: '#e0e0e0'
        }
      }
    },
    orgUnitSeries() {
      return this.orgUnitData
        .filter(item => item.org_unit && item.org_unit.trim() !== '')
        .sort((a, b) => b.project_count - a.project_count)
        .map(item => item.project_count)
    },
    orgUnitChartOptions() {
      const labels = this.orgUnitData
        .filter(item => item.org_unit && item.org_unit.trim() !== '')
        .sort((a, b) => b.project_count - a.project_count)
        .map(item => item.org_unit || 'Unspecified');
      
      return {
        chart: {
          type: 'pie',
          animations: { enabled: true }
        },
        colors: ['#009EDB', '#005B9A', '#B9E0F7', '#666666', '#7FDBFF', '#39CCCC', '#3D9970'],
        labels: labels,
        dataLabels: {
          enabled: true,
          formatter: function (val, { seriesIndex, w }) {
            return w.config.labels[seriesIndex] + ': ' + w.config.series[seriesIndex]
          },
          style: { colors: ['#ffffff'] },
          dropShadow: { enabled: false }
        },
        legend: {
          position: 'right',
          labels: {
            colors: '#666666',
            useSeriesColors: false
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: 'bottom' }
          }
        }],
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " projects"
            }
          }
        }
      }
    },
    themeSeries() {
      const themeMap = {};
      
      this.themeData.forEach(item => {
        if (item.theme && item.theme.trim() !== '') {
          const themes = item.theme.split(',').map(t => t.trim());
          themes.forEach(theme => {
            if (theme) {
              themeMap[theme] = (themeMap[theme] || 0) + (item.project_count || 0);
            }
          });
        }
      });
      
      const sortedThemes = Object.entries(themeMap)
        .map(([theme, count]) => ({ theme, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return [{
        name: 'Projects',
        data: sortedThemes.map(item => item.count)
      }]
    },
    themeChartOptions() {
      const themeMap = {};
      
      this.themeData.forEach(item => {
        if (item.theme && item.theme.trim() !== '') {
          const themes = item.theme.split(',').map(t => t.trim());
          themes.forEach(theme => {
            if (theme) {
              themeMap[theme] = (themeMap[theme] || 0) + (item.project_count || 0);
            }
          });
        }
      });
      
      const sortedThemes = Object.entries(themeMap)
        .map(([theme, count]) => ({ theme, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        chart: {
          type: 'bar',
          toolbar: { show: true },
          animations: { enabled: true }
        },
        colors: ['#009EDB'],
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: false,
            columnWidth: '70%',
            dataLabels: { position: 'top' }
          }
        },
        dataLabels: {
          enabled: true,
          offsetY: -20,
          style: {
            fontSize: '12px',
            colors: ['#666666']
          }
        },
        xaxis: {
          categories: sortedThemes.map(item => item.theme),
          labels: {
            style: {
              colors: '#666666',
              fontSize: '12px'
            },
            rotate: -45,
            rotateAlways: true
          }
        },
        yaxis: {
          title: {
            text: 'Number of Projects',
            style: {
              color: '#666666',
              fontSize: '14px'
            }
          },
          labels: {
            style: {
              colors: '#666666',
              fontSize: '12px'
            }
          }
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " projects"
            }
          }
        },
        grid: {
          borderColor: '#e0e0e0'
        }
      }
    }
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      
      try {
        const endpoints = [
          '/api/projects/by-country',
          '/api/projects/by-org-unit',
          '/api/projects/by-theme'
        ];
        
        const responses = await Promise.all(
          endpoints.map(endpoint => api.get(endpoint))
        );
        
        this.countryData = responses[0].data || [];
        this.orgUnitData = responses[1].data || [];
        this.themeData = responses[2].data || [];
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again later.';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  font-family: 'Open Sans', Arial, sans-serif;
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.dashboard-header h1 {
  color: #005B9A;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.projects-link {
  background-color: #009EDB;
  color: white;
  padding: 10px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.projects-link:hover {
  background-color: #0085C3;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chart-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.chart-row {
  display: flex;
  gap: 24px;
}

.half-width {
  flex: 1;
  min-width: 0;
}

.chart-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  height: 100%;
}

.chart-card h2 {
  color: #005B9A;
  font-size: 18px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
}

.chart-wrapper {
  margin-top: 16px;
}

.loading-message, .error-message {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
  color: #666666;
}

.error-message {
  color: #d32f2f;
}

.retry-button {
  background-color: #009EDB;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #0085C3;
}

@media (max-width: 768px) {
  .chart-row {
    flex-direction: column;
  }
  
  .half-width {
    width: 100%;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>