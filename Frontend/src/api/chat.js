import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

export const getChatHistory = (userId) => api.get(`/chat/history/${userId}`)
