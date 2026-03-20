import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Sidebar from './components/Sidebar'

import Login    from './pages/Login'
import Register from './pages/Register'
import Dashboard  from './pages/Dashboard'
import Upload     from './pages/Upload'
import Documents  from './pages/Documents'
import AskAI      from './pages/AskAI'
import History    from './pages/History'
import Profile    from './pages/Profile'
import Admin      from './pages/Admin'
import SharedView from './pages/SharedView'

const SunIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const MenuIcon = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      className="topbar-toggle"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ position: 'relative' }}
    >
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.2s, transform 0.2s',
        opacity: isDark ? 0 : 1,
        transform: isDark ? 'rotate(90deg) scale(0.6)' : 'rotate(0deg) scale(1)',
        position: isDark ? 'absolute' : 'relative',
      }}>
        <MoonIcon />
      </span>
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.2s, transform 0.2s',
        opacity: isDark ? 1 : 0,
        transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.6)',
        position: isDark ? 'relative' : 'absolute',
      }}>
        <SunIcon />
      </span>
    </button>
  )
}

function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(true)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <div className="app">
      <Sidebar collapsed={!open} />
      <div className="main">
        <header className="topbar">
          <button className="topbar-toggle" onClick={() => setOpen(o => !o)}><MenuIcon /></button>
          <span className="topbar-title">{title}</span>
          <ThemeToggle />
        </header>
        <div className="page">{children}</div>
      </div>
    </div>
  )
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"          element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"     element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"  element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/share/:token" element={<SharedView />} />
      <Route path="/dashboard" element={<AppShell title="Dashboard"><Dashboard /></AppShell>} />
      <Route path="/upload"    element={<AppShell title="Upload Document"><Upload /></AppShell>} />
      <Route path="/documents" element={<AppShell title="My Documents"><Documents /></AppShell>} />
      <Route path="/ask"       element={<AppShell title="Ask AI"><AskAI /></AppShell>} />
      <Route path="/history"   element={<AppShell title="Chat History"><History /></AppShell>} />
      <Route path="/profile"   element={<AppShell title="Profile & Settings"><Profile /></AppShell>} />
      <Route path="/admin"     element={<AppShell title="Admin Panel"><Admin /></AppShell>} />
      <Route path="*"          element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToasterThemed />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

function ToasterThemed() {
  const { isDark } = useTheme()
  return (
    <Toaster position="bottom-right" toastOptions={{
      style: {
        background: isDark ? '#2a2a2a' : '#fff',
        color: isDark ? '#ececec' : '#1a1915',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        borderRadius: '10px', fontFamily: "'Inter', sans-serif", fontSize: '13px',
        boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)',
      },
      success: { iconTheme: { primary: isDark ? '#22c55e' : '#16a34a', secondary: isDark ? '#2a2a2a' : '#fff' } },
      error:   { iconTheme: { primary: isDark ? '#f87171' : '#dc2626', secondary: isDark ? '#2a2a2a' : '#fff' } },
    }} />
  )
}