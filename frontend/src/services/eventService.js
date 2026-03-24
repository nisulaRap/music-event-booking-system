import axios from 'axios'

const api = axios.create({
  baseURL: '/api/events',
  headers: { 'Content-Type': 'application/json' },
})

export const eventService = {
  /** GET /api/events */
  getAll: async () => {
    const { data } = await api.get('')
    return data
  },

  /** GET /api/events/:id */
  getById: async (id) => {
    const { data } = await api.get(`/${id}`)
    return data
  },

  /** POST /api/events */
  create: async (payload) => {
    const { data } = await api.post('', payload)
    return data
  },

  /** PUT /api/events/:id */
  update: async (id, payload) => {
    const { data } = await api.put(`/${id}`, payload)
    return data
  },

  /** DELETE /api/events/:id */
  delete: async (id) => {
    const { data } = await api.delete(`/${id}`)
    return data
  },

  /** PUT /api/events/:id/reduce-seats */
  reduceSeats: async (id, seats) => {
    const { data } = await api.put(`/${id}/reduce-seats`, seats)
    return data
  },
}