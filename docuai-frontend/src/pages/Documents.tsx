import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as api from '../services/api'

export default function Documents() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [shareModal, setShareModal] =
    useState<{ docId: number; token?: string } | null>(null)
  const navigate = useNavigate()

  const load = () =>
    api.getDocuments().then(r => setDocs(r.data)).catch(() => {})

  useEffect(() => {
    load().finally(() => setLoading(false))
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [])

  const deleteDoc = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await api.deleteDocument(id)
      toast.success('Document deleted')
      setDocs(d => d.filter(x => x.id !== id))
    } catch {
      toast.error('Delete failed')
    }
  }

  const shareDoc = async (id: number) => {
    try {
      const res = await api.shareDocument(id)
      setShareModal({ docId: id, token: res.data.shareToken })
      toast.success('Share link created!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Share failed')
    }
  }

  const revokeShare = async (id: number) => {
    try {
      await api.revokeShare(id)
      setShareModal(null)
      toast.success('Share link revoked')
    } catch {
      toast.error('Revoke failed')
    }
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

  if (loading)
    return (
      <div className="empty">
        <div className="spin" style={{ width: 24, height: 24 }} />
      </div>
    )

  return (
    <>
      {/* ✅ Fixed header */}
      <div
        className="page-hdr"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <h1 className="page-title">My Documents</h1>
          <p className="page-sub">
            {docs.length} document{docs.length !== 1 ? 's' : ''} · auto-refreshes every 5s
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/upload')}
        >
          Upload
        </button>
      </div>

      {docs.length === 0 ? (
        <div className="empty">
          <div className="empty-icon" />
          {/* ✅ Fixed empty classes */}
          <div className="empty-t">No documents yet</div>
          <div className="empty-s">
            Upload your first PDF to get started
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => navigate('/upload')}
          >
            Upload PDF
          </button>
        </div>
      ) : (
        <div className="doc-grid">
          {docs.map(doc => (
            <div key={doc.id} className="doc-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                {/* ✅ Fixed icon class */}
                <div className="dc-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>

                {/* ✅ Fixed badge mapping */}
                <span className={`badge ${getBadgeClass(doc.status)}`}>
                  {doc.status}
                </span>
              </div>

              {/* ✅ Fixed name/meta classes */}
              <div className="dc-name">{doc.fileName}</div>
              <div className="dc-meta">
                <span>{fmt(doc.fileSizeBytes)}</span>
                <span>·</span>
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={doc.status !== 'PROCESSED'}
                  onClick={() => navigate(`/ask?docId=${doc.id}`)}
                >
                  Ask AI
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  disabled={doc.status !== 'PROCESSED'}
                  onClick={() => shareDoc(doc.id)}
                >
                  Share
                </button>

                <button
                  className="btn btn-sm"
                  style={{
                    color: 'var(--error)',
                    background: 'var(--error-bg)',
                    border: 'none'
                  }}
                  onClick={() => deleteDoc(doc.id, doc.fileName)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {shareModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 20
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 440 }}>
            <div className="card-title">Share Document</div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Anyone with this link can view the document info (but not the content).
            </p>

            <div style={{ display: 'flex', gap: 8 }}>
              {/* ✅ Fixed input class */}
              <input
                className="fi"
                readOnly
                value={`${window.location.origin}/share/${shareModal.token}`}
                style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/share/${shareModal.token}`
                  )
                  toast.success('Copied!')
                }}
              >
                Copy
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShareModal(null)}
              >
                Close
              </button>

              <button
                className="btn btn-sm"
                style={{
                  color: 'var(--error)',
                  background: 'var(--error-bg)',
                  border: 'none'
                }}
                onClick={() => revokeShare(shareModal.docId)}
              >
                Revoke Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}