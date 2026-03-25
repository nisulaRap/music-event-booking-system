import axios from 'axios'
import { getToken } from './authService'

const api = axios.create({ baseURL: '/api/bookings', headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use(cfg => { const t = getToken(); if (t) cfg.headers.Authorization = `Bearer ${t}`; return cfg })

export const bookingService = {
  create:    (data)   => api.post('', data).then(r => r.data),
  getMy:     ()       => api.get('/my').then(r => r.data),
  getById:   (id)     => api.get(`/${id}`).then(r => r.data),
  cancel:    (id)     => api.put(`/${id}/cancel`).then(r => r.data),
}