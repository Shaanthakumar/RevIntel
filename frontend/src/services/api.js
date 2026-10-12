import axios from 'axios';

const API_BASE = '/api';

export const fetchDatasetStatus = async () => {
  const response = await axios.get(`${API_BASE}/dataset-status`);
  return response.data;
};

export const loadSampleDataset = async () => {
  const response = await axios.post(`${API_BASE}/load-sample`);
  return response.data;
};

export const uploadDatasetFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchAnalytics = async (filters = {}) => {
  const response = await axios.post(`${API_BASE}/analytics`, filters);
  return response.data;
};

export const fetchInsightsAndAnomalies = async (filters = {}) => {
  const response = await axios.post(`${API_BASE}/insights`, filters);
  return response.data;
};

export const updateInventoryConfig = async (capacity) => {
  const response = await axios.post(`${API_BASE}/inventory-config`, { capacity });
  return response.data;
};
