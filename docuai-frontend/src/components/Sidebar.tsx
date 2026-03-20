import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../Logo'

const icons = {
  dashboard: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  upload:    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  docs:      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  ask:       <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  history:   <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  admin:     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  logout:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  folder:    <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  profile:   <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
               <circle cx="12" cy="7" r="4"/>
               <path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>
             </svg>
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/upload', label: 'Upload PDF', icon: 'upload' },
  { path: '/documents', label: 'Documents', icon: 'docs' },
  { path: '/ask', label: 'Ask AI', icon: 'ask' },
  { path: '/history', label: 'History', icon: 'history' },
  { path: '/profile', label: 'Profile', icon: 'profile' },
]

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <aside className={`sidebar ${collapsed ? 'closed' : ''}`}>
      <div className="sidebar-inner">

        {/* Brand */}
        <div className="brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <Logo size={28} />
          <span className="brand-name">PaperMind</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <span className="nav-section">Navigation</span>

          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-item ${pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {icons[item.icon as keyof typeof icons]}
              {item.label}
            </button>
          ))}

          {isAdmin && (
            <>
              <span className="nav-section">Admin</span>
              <button
                className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}
                onClick={() => navigate('/admin')}
              >
                {icons.admin}
                Admin Panel
              </button>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-row">
            <div className="avatar">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </div>

            <div className="user-info">
              <div className="u-name">{user?.name}</div>
              <div className="u-email">{user?.email}</div>
            </div>

            <button
              className="icon-btn"
              onClick={() => { logout(); navigate('/login') }}
              title="Logout"
            >
              {icons.logout}
            </button>
          </div>
        </div>

      </div>
    </aside>
  )
}