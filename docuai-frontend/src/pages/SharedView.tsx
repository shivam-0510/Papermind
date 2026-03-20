import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as api from '../services/api'

export default function SharedView() {
  const { token } = useParams<{ token: string }>()
  const [doc, setDoc] = useState<any>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setError(true)
      setLoading(false)
      return
    }

    api.getSharedDoc(token)
      .then(r => setDoc(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [token])

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
    <div className="auth-wrap">
      <div className="auth-box">

        {/* Brand */}
        <div className="auth-brand">
          <div className="brand-icon" style={{ width: 32, height: 32, borderRadius: 9 }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span className="brand-name">PaperMind</span>
        </div>

        {loading ? (
          <div className="empty">
            <div className="spin" style={{ width: 24, height: 24 }} />
            <div className="empty-s" style={{ marginTop: 12 }}>
              Loading shared document...
            </div>
          </div>

        ) : error ? (
          <div className="empty">
            <div className="empty-icon" />
            <div className="empty-t">Link not found</div>
            <div className="empty-s" style={{ marginBottom: 16 }}>
              This share link is invalid or has been revoked.
            </div>

            <Link to="/login" className="btn btn-secondary btn-sm">
              Go to PaperMind
            </Link>
          </div>

        ) : (
          <>
            <div className="auth-s" style={{ marginBottom: 6 }}>
              Shared document
            </div>

            <h1 className="auth-h" style={{ marginBottom: 4, wordBreak: 'break-word' }}>
              {doc.fileName}
            </h1>

            <p className="auth-s" style={{ marginBottom: 24 }}>
              Shared by <strong>{doc.sharedBy}</strong>
            </p>

            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className={`badge ${getBadgeClass(doc.status)}`}>
                  {doc.status}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Shared on</span>
                <span>
                  {new Date(doc.sharedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <Link to="/register" className="btn btn-primary btn-full">
              Sign up to use PaperMind AI →
            </Link>
          </>
        )}

      </div>
    </div>
  )
}