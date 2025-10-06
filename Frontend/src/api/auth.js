import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

export const login = (credentials) => api.post('/auth/login', credentials)
export const register = (userData) => api.post('/auth/register', userData)

export const getProfile = (userId, token) =>
  api.get(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const followUser = (userId) => {
  const token = localStorage.getItem('token');
  return api.post(`/users/follow`, { userId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const unfollowUser = (userId) => {
  const token = localStorage.getItem('token');
  return api.post(`/users/unfollow`, { userId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
