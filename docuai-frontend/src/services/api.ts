import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('pm_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const isPublic = err.config?.url?.includes('/public/')
      if (!isPublic) {
        localStorage.removeItem('pm_token')
        localStorage.removeItem('pm_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ─── Auth ──────────────────────────────────────────────────────────────────
export const register = (d: { name: string; email: string; password: string }) =>
  api.post('/auth/register', d)
export const login = (d: { email: string; password: string }) =>
  api.post('/auth/login', d)

// ─── Documents ─────────────────────────────────────────────────────────────
export const uploadDocument = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const getDocuments       = () => api.get('/documents')
export const getDocument        = (id: number) => api.get(`/documents/${id}`)
export const deleteDocument     = (id: number) => api.delete(`/documents/${id}`)
export const askQuestion        = (documentId: number, question: string) =>
  api.post('/documents/ask', { documentId, question })
export const getDocumentHistory = (id: number) => api.get(`/documents/${id}/history`)

// ─── Share ─────────────────────────────────────────────────────────────────
export const shareDocument = (id: number) => api.post(`/documents/${id}/share`)
export const revokeShare   = (id: number) => api.delete(`/documents/${id}/share`)
export const getMyShares   = () => api.get('/user/shares')
export const getSharedDoc  = (token: string) => axios.get(`/api/public/share/${token}`)

// ─── User ──────────────────────────────────────────────────────────────────
export const getProfile     = () => api.get('/user/profile')
export const updateProfile  = (name: string) => api.put('/user/profile', { name })
export const changePassword = (currentPassword: string, newPassword: string) =>
  api.put('/user/password', { currentPassword, newPassword })
export const getAllHistory   = () => api.get('/user/history')
export const getRateLimit   = () => api.get('/user/rate-limit')

// ─── Admin ─────────────────────────────────────────────────────────────────
export const adminGetStats     = () => api.get('/admin/stats')
export const adminGetUsers     = () => api.get('/admin/users')
export const adminGetDocuments = () => api.get('/admin/documents')

export default api