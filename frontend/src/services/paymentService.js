import axios from 'axios'
import { getToken } from './authService'

const api = axios.create({ baseURL: '/api/payments', headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use(cfg => { const t = getToken(); if (t) cfg.headers.Authorization = `Bearer ${t}`; return cfg })

export const paymentService = {
  createIntent: (data) => api.post('/create-intent', data).then(r => r.data),
  getMy:        ()     => api.get('/my').then(r => r.data),
  getByBooking: (id)   => api.get(`/booking/${id}`).then(r => r.data),
}