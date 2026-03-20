import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthUser {
  name: string
  email: string
  role: string
  token: string
}

interface AuthCtx {
  user: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (data: { token: string; name: string; email: string; role: string }) => void
  logout: () => void
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const s = localStorage.getItem('pm_user')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  const login = (data: { token: string; name: string; email: string; role: string }) => {
    const u: AuthUser = { name: data.name, email: data.email, role: data.role, token: data.token }
    localStorage.setItem('pm_token', data.token)
    localStorage.setItem('pm_user', JSON.stringify(u))
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('pm_token')
    localStorage.removeItem('pm_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ROLE_ADMIN',
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)