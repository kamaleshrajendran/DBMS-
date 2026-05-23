import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name, role: 'admin' }),
};

export const buildingAPI = {
  createBuilding: (data) => api.post('/admin/buildings', data),
  getBuildings: () => api.get('/admin/buildings'),
  getBuilding: (id) => api.get(`/admin/buildings/${id}`),
  updateBuilding: (id, data) => api.put(`/admin/buildings/${id}`, data),
  deleteBuilding: (id) => api.delete(`/admin/buildings/${id}`),
  getQRCode: (id, floorId) => api.get(`/admin/buildings/${id}/qr`, { 
    responseType: 'blob',
    params: { floorId }
  }),
};

export const floorAPI = {
  addFloor: (buildingId, data) => api.post(`/admin/buildings/${buildingId}/floors`, data),
  getFloors: (buildingId) => api.get(`/admin/buildings/${buildingId}/floors`),
  getFloor: (floorId) => api.get(`/admin/floors/${floorId}`),
  updateFloor: (floorId, data) => api.put(`/admin/floors/${floorId}`, data),
  deleteFloor: (floorId) => api.delete(`/admin/floors/${floorId}`),
};

export const venueAPI = {
  addVenue: (floorId, data) => api.post(`/admin/floors/${floorId}/venues`, data),
  getVenues: (floorId) => api.get(`/admin/floors/${floorId}/venues`),
  getVenue: (venueId) => api.get(`/admin/venues/${venueId}`),
  updateVenue: (venueId, data) => api.put(`/admin/venues/${venueId}`, data),
  deleteVenue: (venueId) => api.delete(`/admin/venues/${venueId}`),
  searchVenues: (floorId, query) =>
    api.get('/admin/venues/search', { params: { q: query, floorId } }),
};

export const navigationAPI = {
  calculateRoute: (data) => api.post('/visitor/navigation/route', data),
  createNavGraph: (data) => api.post('/visitor/navigation/graph', data),
  getNavGraph: (floorId) => api.get(`/visitor/navigation/graph/${floorId}`),
};

export const visitorAPI = {
  getBuilding: (id) => api.get(`/visitor/buildings/${id}`),
  getFloors: (buildingId) => api.get(`/visitor/buildings/${buildingId}/floors`),
};

export default api;
