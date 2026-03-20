import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/api'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [docs, setDocs] = useState<any[]>([])
  const [rateLimit, setRateLimit] = useState<any>(null)

  useEffect(() => {
    api.getDocuments().then(r => setDocs(r.data)).catch(() => {})
    api.getRateLimit().then(r => setRateLimit(r.data)).catch(() => {})
  }, [])

  const processed = docs.filter(d => d.status === 'PROCESSED').length
  const processing = docs.filter(d => d.status === 'PROCESSING' || d.status === 'UPLOADED').length

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
      <div className="page-hdr">
        <h1 className="page-title">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="page-sub">
          Here's an overview of your document workspace
        </p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-num">{docs.length}</div>
          <div className="stat-lbl">Total Documents</div>
        </div>

        <div className="stat-box">
          <div className="stat-num" style={{ color: 'var(--success)' }}>
            {processed}
          </div>
          <div className="stat-lbl">Processed</div>
        </div>

        <div className="stat-box">
          <div className="stat-num" style={{ color: 'var(--warning)' }}>
            {processing}
          </div>
          <div className="stat-lbl">Processing</div>
        </div>

        {rateLimit && (
          <div className="stat-box">
            <div className="stat-num" style={{ color: 'var(--accent)' }}>
              {rateLimit.remaining}
            </div>
            <div className="stat-lbl">AI Queries Left</div>
          </div>
        )}
      </div>

      {/* Rate limit warning */}
      {rateLimit && rateLimit.remaining <= 5 && (
        <div className="banner warning">
          <span>
            You have only <strong>{rateLimit.remaining}</strong> AI queries left this hour.
          </span>
        </div>
      )}

      {/* Quick actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 22
        }}
      >
        {[
          { label: 'Upload Document', desc: 'Add a new PDF for AI analysis', path: '/upload', icon: '↑' },
          { label: 'Ask AI', desc: 'Query your processed documents', path: '/ask', icon: '✦' }
        ].map(a => (
          <div
            key={a.path}
            className="card"
            style={{
              cursor: 'pointer',
              transition: 'box-shadow 0.13s'
            }}
            onClick={() => navigate(a.path)}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  background: 'var(--accent-light)',
                  border: '1px solid var(--accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  color: 'var(--accent)',
                  flexShrink: 0
                }}
              >
                {a.icon}
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                  {a.label}
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {a.desc}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Documents */}
      {docs.length > 0 && (
        <div className="card">
          <div className="card-title">Recent Documents</div>

          <div>
            {docs.slice(0, 5).map(doc => (
              <div
                key={doc.id}
                onClick={() => navigate('/documents')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 7,
                  cursor: 'pointer',
                  transition: 'background 0.12s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: 'var(--error-bg)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--error)',
                    flexShrink: 0
                  }}
                >
                  📄
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {doc.fileName}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      marginTop: 1
                    }}
                  >
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <span className={`badge ${getBadgeClass(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}