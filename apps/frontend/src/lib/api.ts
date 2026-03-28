import axios, { AxiosError } from 'axios'
import type { ApiError } from '@/types'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

function toCamelCase(str: string) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => convertKeysToCamelCase(v))
  } else if (obj !== null && obj?.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      result[toCamelCase(key)] = convertKeysToCamelCase(obj[key])
      return result
    }, {} as any)
  }
  return obj
}

// Response interceptor: handle snake_case to camelCase AND 401 token expiry
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = convertKeysToCamelCase(response.data)
    }
    return response
  },
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean }
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        return api(original)
      } catch {
        // Refresh failed - redirect to login
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const getApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error) && error.response?.data?.error) {
    return error.response.data.error as ApiError
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    status: 500,
  }
}

export default api
