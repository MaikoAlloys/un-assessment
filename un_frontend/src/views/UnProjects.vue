<template>
  <div class="projects-container">
    <div class="header">
      <h1>UN-Habitat Projects</h1>
      <div class="controls">
        <div class="search-filter">
          <input 
            v-model="searchQuery" 
            placeholder="Search projects..." 
            class="search-input"
          />
          <select v-model="statusFilter" class="status-filter">
            <option value="">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending Approval">Pending Approval</option>
          </select>
        </div>
        <div class="row-count">
          <span>Show:</span>
          <select v-model="perPage" class="per-page-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="0">All</option>
          </select>
        </div>
        <button @click="showAddModal = true" class="add-button">
          Add Project
        </button>
      </div>
    </div>

    <div class="navigation-links">
      <button @click="fetchAllProjects" class="nav-button">All Projects</button>
      <button @click="fetchKenyaProjects" class="nav-button">Kenya Projects</button>
      <button @click="fetchApprovedProjects" class="nav-button">Approved Projects</button>
      <router-link to="/admin-dashboard" class="nav-button">
  <button>Visuals</button>
</router-link>

    </div>

    <div class="json-links">
      <h3>JSON Data Links:</h3>
      <div class="links-container">
        <a :href="apiBaseUrl + '/api/projects/all'" target="_blank" class="json-link">All Projects</a>
        <a :href="apiBaseUrl + '/api/projects/country/kenya'" target="_blank" class="json-link">Kenya Projects</a>
        <a :href="apiBaseUrl + '/api/projects/approval-status/approved'" target="_blank" class="json-link">Approved Projects</a>
      </div>
    </div>

    <div class="table-container">
      <table class="projects-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Country</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in paginatedProjects" :key="project.ProjectID">
            <td>{{ project.ProjectID }}</td>
            <td>{{ project['Project Title'] }}</td>
            <td>{{ project['Country(ies)'] }}</td>
            <td :class="statusClass(project['Approval Status'])">
              {{ project['Approval Status'] }}
            </td>
            <td>{{ formatDate(project['Start Date']) }}</td>
            <td>{{ formatDate(project['End Date']) }}</td>
            <td class="actions">
              <button @click="viewProject(project.ProjectID)" class="action-btn view">View</button>
              <button @click="editProject(project)" class="action-btn edit">Edit</button>
              <button @click="confirmDelete(project.ProjectID)" class="action-btn delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="perPage > 0">
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="pagination-button"
      >
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        class="pagination-button"
      >
        Next
      </button>
    </div>

    <!-- Add/Edit Project Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ showAddModal ? 'Add New Project' : 'Edit Project' }}</h2>
        <form @submit.prevent="showAddModal ? addProject() : updateProject()">
          <div class="form-group">
            <label>Project Title:</label>
            <input v-model="currentProject['Project Title']" required />
          </div>
          <div class="form-group">
            <label>Country:</label>
            <input v-model="currentProject['Country(ies)']" required />
          </div>
          <div class="form-group">
            <label>Status:</label>
            <select v-model="currentProject['Approval Status']" required>
              <option value="Approved">Approved</option>
              <option value="Pending Approval">Pending Approval</option>
            </select>
          </div>
          <div class="form-group">
            <label>Start Date:</label>
            <input type="date" v-model="currentProject.startDateFormatted" required />
          </div>
          <div class="form-group">
            <label>End Date:</label>
            <input type="date" v-model="currentProject.endDateFormatted" required />
          </div>
          <div class="form-group">
            <label>PAG Value:</label>
            <input type="number" v-model="currentProject['PAG Value']" required />
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="submit-btn">
              {{ showAddModal ? 'Add Project' : 'Update Project' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Project Modal -->
    <div v-if="showViewModal" class="modal-overlay">
      <div class="modal view-modal">
        <h2>Project Details</h2>
        <div class="project-details">
          <div class="detail-row">
            <span class="detail-label">Project ID:</span>
            <span class="detail-value">{{ currentProject.ProjectID }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Title:</span>
            <span class="detail-value">{{ currentProject['Project Title'] }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Country:</span>
            <span class="detail-value">{{ currentProject['Country(ies)'] }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span :class="statusClass(currentProject['Approval Status'])">{{ currentProject['Approval Status'] }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Start Date:</span>
            <span class="detail-value">{{ formatDate(currentProject['Start Date']) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">End Date:</span>
            <span class="detail-value">{{ formatDate(currentProject['End Date']) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">PAG Value:</span>
            <span class="detail-value">${{ currentProject['PAG Value']?.toLocaleString() || '0' }}</span>
          </div>
          <div class="json-viewer-toggle" @click="showJsonViewer = !showJsonViewer">
            {{ showJsonViewer ? 'Hide JSON Data' : 'View Raw JSON Data' }}
          </div>
          <div v-if="showJsonViewer" class="json-viewer">
            <pre>{{ JSON.stringify(currentProject, null, 2) }}</pre>
          </div>
        </div>
        <button @click="showViewModal = false" class="close-btn">Close</button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal delete-modal">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this project?</p>
        <div class="delete-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">Cancel</button>
          <button @click="deleteProject" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";

export default {
  name: 'UnProjects',
  data() {
    return {
      projects: [],
      filteredProjects: [],
      currentProject: {
        'Project Title': '',
        'Country(ies)': '',
        'Approval Status': 'Approved',
        'Start Date': '',
        'End Date': '',
        'PAG Value': 0,
        startDateFormatted: '',
        endDateFormatted: ''
      },
      searchQuery: '',
      statusFilter: '',
      perPage: 10,
      currentPage: 1,
      showAddModal: false,
      showEditModal: false,
      showViewModal: false,
      showDeleteModal: false,
      projectToDelete: null,
      showJsonViewer: false,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || window.location.origin
    };
  },
  computed: {
    paginatedProjects() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = this.perPage > 0 ? start + this.perPage : this.filteredProjects.length;
      return this.filteredProjects.slice(start, end);
    },
    totalPages() {
      return this.perPage > 0 ? Math.ceil(this.filteredProjects.length / this.perPage) : 1;
    }
  },
  watch: {
    searchQuery() {
      this.filterProjects();
      this.currentPage = 1;
    },
    statusFilter() {
      this.filterProjects();
      this.currentPage = 1;
    },
    perPage() {
      this.currentPage = 1;
    }
  },
  created() {
    this.fetchAllProjects();
  },
  methods: {
    async fetchAllProjects() {
      try {
        const response = await api.get('/api/projects/all');
        this.projects = response.data;
        this.filterProjects();
      } catch (error) {
        console.error('Error fetching projects:', error);
        this.showError('Failed to fetch projects. Please try again.');
      }
    },
    async fetchKenyaProjects() {
      try {
        const response = await api.get('/api/projects/country/kenya');
        this.projects = response.data;
        this.filterProjects();
        if (this.projects.length === 0) {
          this.showInfo('No Kenya projects found.');
        }
      } catch (error) {
        console.error('Error fetching Kenya projects:', error);
        this.showError('Failed to fetch Kenya projects. Please try again.');
      }
    },
    async fetchApprovedProjects() {
      try {
        const response = await api.get('/api/projects/approval-status/approved');
        this.projects = response.data;
        this.filterProjects();
      } catch (error) {
        console.error('Error fetching approved projects:', error);
        this.showError('Failed to fetch approved projects. Please try again.');
      }
    },
    filterProjects() {
      this.filteredProjects = this.projects.filter(project => {
        const matchesSearch = project['Project Title'].toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                             project['Country(ies)'].toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesStatus = !this.statusFilter || project['Approval Status'] === this.statusFilter;
        return matchesSearch && matchesStatus;
      });
    },
    viewProject(id) {
      api.get(`/api/projects/view/${id}`)
        .then(response => {
          this.currentProject = response.data;
          this.showViewModal = true;
          this.showJsonViewer = false;
        })
        .catch(error => {
          console.error('Error fetching project:', error);
          this.showError('Failed to fetch project details. Please try again.');
        });
    },
    editProject(project) {
      this.currentProject = { ...project };
      // Convert dates to format suitable for date input
      this.currentProject.startDateFormatted = this.formatDateForInput(project['Start Date']);
      this.currentProject.endDateFormatted = this.formatDateForInput(project['End Date']);
      this.showEditModal = true;
    },
    addProject() {
      // Convert formatted dates back to database format
      const projectToAdd = {
        ...this.currentProject,
        'Start Date': new Date(this.currentProject.startDateFormatted).toISOString(),
        'End Date': new Date(this.currentProject.endDateFormatted).toISOString()
      };
      delete projectToAdd.startDateFormatted;
      delete projectToAdd.endDateFormatted;

      api.post('/api/projects/create', projectToAdd)
        .then(() => {
          this.fetchAllProjects();
          this.closeModal();
          this.showSuccess('Project added successfully!');
        })
        .catch(error => {
          console.error('Error adding project:', error);
          this.showError('Failed to add project. Please try again.');
        });
    },
    updateProject() {
      // Convert formatted dates back to database format
      const projectToUpdate = {
        ...this.currentProject,
        'Start Date': new Date(this.currentProject.startDateFormatted).toISOString(),
        'End Date': new Date(this.currentProject.endDateFormatted).toISOString()
      };
      delete projectToUpdate.startDateFormatted;
      delete projectToUpdate.endDateFormatted;

      api.put(`/api/projects/update/${this.currentProject.ProjectID}`, projectToUpdate)
        .then(() => {
          this.fetchAllProjects();
          this.closeModal();
          this.showSuccess('Project updated successfully!');
        })
        .catch(error => {
          console.error('Error updating project:', error);
          this.showError('Failed to update project. Please try again.');
        });
    },
    confirmDelete(id) {
      this.projectToDelete = id;
      this.showDeleteModal = true;
    },
    deleteProject() {
      api.delete(`/api/projects/delete/${this.projectToDelete}`)
        .then(() => {
          this.fetchAllProjects();
          this.showDeleteModal = false;
          this.showSuccess('Project deleted successfully!');
        })
        .catch(error => {
          console.error('Error deleting project:', error);
          this.showError('Failed to delete project. Please try again.');
        });
    },
    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.showViewModal = false;
      this.currentProject = {
        'Project Title': '',
        'Country(ies)': '',
        'Approval Status': 'Approved',
        'Start Date': '',
        'End Date': '',
        'PAG Value': 0,
        startDateFormatted: '',
        endDateFormatted: ''
      };
      this.showJsonViewer = false;
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    formatDateForInput(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    },
    statusClass(status) {
      return {
        'status-approved': status === 'Approved',
        'status-pending': status === 'Pending Approval'
      };
    },
    showSuccess(message) {
      // You can replace this with a proper notification system
      alert(message);
    },
    showError(message) {
      // You can replace this with a proper notification system
      alert(message);
    },
    showInfo(message) {
      // You can replace this with a proper notification system
      alert(message);
    }
  }
};
</script>

<style scoped>
.projects-container {
  font-family: 'Open Sans', Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  color: #005B9A;
  margin: 0;
}

.controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-filter {
  display: flex;
  gap: 10px;
}

.search-input, .status-filter, .per-page-select {
  padding: 8px 12px;
  border: 1px solid #666666;
  border-radius: 4px;
  font-size: 14px;
}

.add-button {
  background-color: #009EDB;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #0085C7;
}

.navigation-links {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.nav-button {
  background-color: #005B9A;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-button:hover {
  background-color: #004880;
}

.json-links {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.json-links h3 {
  margin-top: 0;
  color: #005B9A;
}

.links-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.json-link {
  color: #009EDB;
  text-decoration: none;
  padding: 5px 10px;
  border: 1px solid #009EDB;
  border-radius: 4px;
  transition: all 0.3s;
}

.json-link:hover {
  background-color: #009EDB;
  color: white;
}

.table-container {
  overflow-x: auto;
}

.projects-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.projects-table th, .projects-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.projects-table th {
  background-color: #005B9A;
  color: white;
  font-weight: bold;
}

.projects-table tr:hover {
  background-color: #f0f8ff;
}

.status-approved {
  color: #2E7D32;
  font-weight: bold;
}

.status-pending {
  color: #D32F2F;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: opacity 0.3s;
}

.action-btn:hover {
  opacity: 0.8;
}

.action-btn.view {
  background-color: #009EDB;
  color: white;
}

.action-btn.edit {
  background-color: #FFC107;
  color: #000;
}

.action-btn.delete {
  background-color: #D32F2F;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination-button {
  background-color: #009EDB;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-button:disabled {
  background-color: #666666;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.view-modal {
  max-width: 800px;
}

.modal h2 {
  color: #005B9A;
  margin-top: 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #666666;
  border-radius: 4px;
}

.form-actions, .delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  background-color: #009EDB;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #666666;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn {
  background-color: #D32F2F;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn {
  background-color: #666666;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
}

.project-details {
  margin: 20px 0;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.detail-label {
  font-weight: bold;
  width: 120px;
  color: #555;
}

.detail-value {
  flex: 1;
}

.json-viewer-toggle {
  margin: 20px 0 10px;
  color: #009EDB;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
}

.json-viewer {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  font-family: monospace;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .controls {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .navigation-links, .links-container {
    flex-wrap: wrap;
  }
  
  .projects-table th, .projects-table td {
    padding: 8px;
    font-size: 14px;
  }
  
  .actions {
    flex-direction: column;
    gap: 3px;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .detail-row {
    flex-direction: column;
  }
  
  .detail-label {
    width: 100%;
    margin-bottom: 5px;
  }
}
</style>