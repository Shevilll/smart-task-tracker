import axios from "axios"
import toast from "react-hot-toast"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api"

console.log("API Base URL:", API_BASE_URL) // Debug log

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log("Adding auth token to request") // Debug log
    } else {
      console.log("No auth token found") // Debug log
    }
    console.log("Making request to:", config.url) // Debug log
    return config
  },
  (error) => {
    console.error("Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status) // Debug log
    return response
  },
  async (error) => {
    console.error("API Error:", error.response?.status, error.response?.data) // Debug log

    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        if (refreshToken) {
          console.log("Attempting to refresh token") // Debug log
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          localStorage.setItem("access_token", access)

          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError)
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
      }
    }

    // Better error handling
    if (error.response?.status === 500) {
      toast.error("Server error. Please check if the backend is running.")
    } else if (error.response?.status === 403) {
      toast.error("Permission denied. You don't have access to this resource.")
    } else if (error.response?.status === 404) {
      toast.error("Resource not found.")
    } else if (error.response?.data?.detail) {
      toast.error(error.response.data.detail)
    } else if (error.response?.data?.error) {
      toast.error(error.response.data.error)
    } else if (error.message === "Network Error") {
      toast.error("Cannot connect to server. Please check if the backend is running.")
    } else if (error.message) {
      toast.error(error.message)
    }

    return Promise.reject(error)
  },
)
