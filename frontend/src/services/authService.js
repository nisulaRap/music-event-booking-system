import axios from 'axios'
 
const api = axios.create({ baseURL: '/api/auth', headers: { 'Content-Type': 'application/json' } })
 
export const authService = {
  register:       (data)  => api.post('/register', data).then(r => r.data),
  login:          (data)  => api.post('/login', data).then(r => r.data),
  forgotPassword: (email) => api.post(`/forgot-password?email=${encodeURIComponent(email)}`).then(r => r.data),
}
 
export const getToken   = () => localStorage.getItem('token')
export const getUser    = () => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } }
export const isLoggedIn = () => Boolean(getToken())
export const isAdmin    = () => getUser()?.role === 'ADMIN'
 
export const saveAuth = (data) => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify({
    id:    data.userId,
    email: data.email,
    name:  data.name,
    role:  data.role,
  }))
}
 
export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}