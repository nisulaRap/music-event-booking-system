import axios from 'axios'
import { getToken } from './authService'

const api = axios.create({ baseURL: '/api/events', headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use(cfg => { const t = getToken(); if (t) cfg.headers.Authorization = `Bearer ${t}`; return cfg })

export const eventService = {
  getAll:      ()           => api.get('').then(r => r.data),
  getById:     (id)         => api.get(`/${id}`).then(r => r.data),
  create:      (payload)    => api.post('', payload).then(r => r.data),
  update:      (id, payload)=> api.put(`/${id}`, payload).then(r => r.data),
  delete:      (id)         => api.delete(`/${id}`).then(r => r.data),
  reduceSeats: (id, seats)  => api.put(`/${id}/reduce-seats`, seats).then(r => r.data),
}