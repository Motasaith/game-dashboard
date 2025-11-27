import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL.endsWith('/api') 
    ? import.meta.env.VITE_API_URL.slice(0, -4) 
    : import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: baseUrl
});

export default api;
