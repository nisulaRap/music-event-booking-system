import axios from 'axios'
import { getToken } from './authService'

const api = axios.create({ baseURL: '/api/notifications', headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use(cfg => { const t = getToken(); if (t) cfg.headers.Authorization = `Bearer ${t}`; return cfg })

export const notificationService = {
  getMy: () => api.get('/my').then(r => r.data),
}