import axios from 'axios'
import { getToken } from './authService'

const api = axios.create({ baseURL: '/api/users', headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use(cfg => { const t = getToken(); if (t) cfg.headers.Authorization = `Bearer ${t}`; return cfg })

export const userService = {
  getMe:    ()     => api.get('/me').then(r => r.data),
  updateMe: (data) => api.put('/me', data).then(r => r.data),
  deleteMe: ()     => api.delete('/me').then(r => r.data),
}