import axios from 'axios'
import Swal from 'sweetalert2'

// Base URL comes directly from .env (VITE_API_BASE_URL)
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 10000
})

// Request Interceptor: Attach JWT / Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('unique_castle_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Handle Global Errors (401 Unauthorized, 403 Forbidden, 500, or Spring Boot 200 OK unauthorized payloads)
apiClient.interceptors.response.use(
  (response) => {
    const resData = response?.data
    // Spring Boot returns HTTP 200 OK with custom payload:
    // { "status": "false", "message": "Unauthorized or token missing/expired" }
    if (
      resData &&
      (resData.status === 'false' || resData.status === false) &&
      typeof resData.message === 'string' &&
      (
        resData.message.toLowerCase().includes('unauthorized') ||
        resData.message.toLowerCase().includes('token missing') ||
        resData.message.toLowerCase().includes('token expired') ||
        resData.message.toLowerCase().includes('expired')
      )
    ) {
      localStorage.removeItem('unique_castle_token')
      localStorage.removeItem('unique_castle_user')

      if (!window.location.pathname.includes('/login')) {
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: resData.message || 'Your session has expired. Please sign in again.',
          confirmButtonColor: '#4f46e5'
        }).then(() => {
          const currentPath = window.location.pathname + window.location.search
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
        })
      }

      return Promise.reject(new Error(resData.message))
    }

    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      // If token expired or unauthorized, logout user
      if (status === 401 || (data && (data.status === 'false' || data.status === false) && String(data.message).toLowerCase().includes('unauthorized'))) {
        localStorage.removeItem('unique_castle_token')
        localStorage.removeItem('unique_castle_user')

        // Only alert if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: data?.message || 'Your session has expired. Please sign in again.',
            confirmButtonColor: '#4f46e5'
          }).then(() => {
            const currentPath = window.location.pathname + window.location.search
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
          })
        }
      } else if (status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'You do not have permission to perform this action.',
          confirmButtonColor: '#4f46e5'
        })
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
