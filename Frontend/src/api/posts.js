export const unlikePost = (postId) => {
  const token = localStorage.getItem('token');
  return api.post(`/posts/${postId}/unlike`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

export const getPosts = () => api.get('/posts')

export const getUserPosts = (userId) => {
  const token = localStorage.getItem('token');
  return api.get(`/posts/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const createPost = (formData) => {
  const token = localStorage.getItem('token');
  return api.post('/posts', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const likePost = (postId) => {
  const token = localStorage.getItem('token');
  return api.post(`/posts/${postId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const commentOnPost = (postId, comment) => {
  const token = localStorage.getItem('token');
  return api.post(`/posts/${postId}/comment`, { text: comment }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
