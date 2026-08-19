import axios from 'axios';

// Base Axios Instance
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Error Normalization
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const isAuthUrl = url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// 1. Authentication Services
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// 2. Jobs Services
export const jobService = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
};

// 3. Applications Services
export const applicationService = {
  applyForJob: (formData) =>
    api.post('/applications/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  applyJob: (formData) =>
    api.post('/applications/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyApplications: (params) => api.get('/applications/my-applications', { params }),
  getAllApplications: (params) => api.get('/applications/admin/all', { params }),
  getApplications: (params) => api.get('/applications/admin/all', { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  getApplication: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, data) => {
    const payload = typeof data === 'string' ? { status: data } : data;
    return api.put(`/applications/${id}/status`, payload);
  },
};

// 4. Candidate & Profile Services
export const applicantService = {
  getApplicants: (params) => api.get('/applicants', { params }),
  getApplicantById: (id) => api.get(`/applicants/${id}`),
  getProfile: () => api.get('/applicants/profile/me'),
  getMyProfile: () => api.get('/applicants/profile/me'),
  updateProfile: (formData) =>
    api.put('/applicants/profile/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateMyProfile: (formData) =>
    api.put('/applicants/profile/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const profileService = applicantService;

// 5. Dashboard Analytics Services
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
