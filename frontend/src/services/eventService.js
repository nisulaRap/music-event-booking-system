import axios from 'axios';

const API = "/api/events";

export const getEvents = () => axios.get(API)
export const getEventById = (id) => axios.get(`${API}/${id}`)
export const createEvent = (data) => axios.post(API, data)
export const updateEvent = (id, data) => axios.put(`${API}/${id}`, data)
export const deleteEvent = (id) => axios.delete(`${API}/${id}`)