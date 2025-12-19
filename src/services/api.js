import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: 'https://localhost:44363/api', // URL base da sua API .NET
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar o token JWT a todas as requisiÃ§Ãµes autenticadas
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token || localStorage.getItem('userToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default api
