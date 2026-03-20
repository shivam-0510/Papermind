import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/api'

export default function Admin() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [docs, setDocs] = useState<any[]>([])
  const [tab, setTab] = useState<'stats' | 'users' | 'docs'>('stats')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return }

    Promise.all([
      api.adminGetStats().then(r => setStats(r.data)),
      api.adminGetUsers().then(r => setUsers(r.data)),
      api.adminGetDocuments().then(r => setDocs(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (!isAdmin) return null
  if (loading) {
    return (
      <div className="empty">
        <div className="spin" style={{ width: 24, height: 24 }} />
      </div>
    )
  }

  const fmt = (b?: number) =>
    !b ? '—'
      : b > 1024 * 1024
        ? (b / 1024 / 1024).toFixed(1) + 'MB'
        : (b / 1024).toFixed(0) + 'KB'

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'PROCESSED': return 'b-processed'
      case 'PROCESSING': return 'b-processing'
      case 'UPLOADED': return 'b-uploaded'
      case 'FAILED': return 'b-failed'
      default: return ''
    }
  }

  return (
    <>
      {/* ✅ Fixed header class */}
      <div className="page-hdr">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-sub">Platform-wide statistics and management</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 20,
        borderBottom: '1px solid var(--border)'
      }}>
        {(['stats', 'users', 'docs'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="btn btn-ghost btn-sm"
            style={{
              fontWeight: tab === t ? 600 : 500,
              color: tab === t ? 'var(--accent)' : undefined,
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              borderRadius: 0
            }}
          >
            {t === 'stats'
              ? 'Statistics'
              : t === 'users'
                ? `Users (${users.length})`
                : `Documents (${docs.length})`}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {tab === 'stats' && stats && (
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="stat-box">
              <div className="stat-num">{String(v)}</div>
              {/* ✅ Fixed stat label */}
              <div className="stat-lbl">
                {k.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="card" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Name', 'Email', 'Role', 'Docs', 'Questions', 'Joined'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: 12,
                      color: 'var(--text-muted)'
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 }}>{u.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {/* ✅ Fixed badge classes */}
                    <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'b-processing' : 'b-uploaded'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{u.documentCount}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{u.questionCount}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Documents Tab */}
      {tab === 'docs' && (
        <div className="card" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'File', 'Owner', 'Status', 'Size', 'Uploaded'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: 12,
                      color: 'var(--text-muted)'
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 }}>{d.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.fileName}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: 12 }}>{d.ownerEmail}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {/* ✅ Fixed badge mapping */}
                    <span className={`badge ${getBadgeClass(d.status)}`}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {fmt(d.fileSizeBytes)}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}