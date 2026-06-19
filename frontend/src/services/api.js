import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络错误';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// 用户相关API
export const userAPI = {
  register: (idNumber) => apiClient.post('/user/register', { id_number: idNumber }),
  getUserByIdNumber: (idNumber) => apiClient.get(`/user/${idNumber}`),
};

// 支付相关API
export const paymentAPI = {
  createPayment: (userId, amount = 1.00) => apiClient.post('/payment/create', { user_id: userId, amount }),
};

// 抽奖相关API
export const lotteryAPI = {
  draw: (userId) => apiClient.post('/lottery/draw', { user_id: userId }),
  getHistory: (userId) => apiClient.get(`/lottery/history/${userId}`),
  getRemainingChances: (userId) => apiClient.get(`/lottery/remaining/${userId}`),
};

// 奖品相关API
export const prizeAPI = {
  getActivePrizes: () => apiClient.get('/prizes/active'),
  getAllPrizes: () => apiClient.get('/admin/prizes'),
  createPrize: (data) => apiClient.post('/admin/prizes', data),
  updatePrize: (id, data) => apiClient.put(`/admin/prizes/${id}`, data),
  deletePrize: (id) => apiClient.delete(`/admin/prizes/${id}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axios.post(`${API_BASE_URL}/admin/prizes/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// 统计相关API
export const adminAPI = {
  getStatistics: () => apiClient.get('/admin/statistics'),
  getRecentRecords: (limit = 100) => apiClient.get(`/admin/records?limit=${limit}`),
};

export default apiClient;
