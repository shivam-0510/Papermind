import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../services/api'

export default function History() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.getAllHistory()
      .then(r => setHistory(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = history.filter(h =>
    h.question.toLowerCase().includes(search.toLowerCase()) ||
    h.documentName.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="empty">
        <div className="spin" style={{ width: 24, height: 24 }} />
      </div>
    )
  }

  return (
    <>
      {/* ✅ Fixed header class */}
      <div className="page-hdr">
        <h1 className="page-title">Chat History</h1>
        <p className="page-sub">
          {history.length} conversations across all documents
        </p>
      </div>

      {history.length > 0 && (
        /* ✅ Fixed form classes */
        <div className="fg" style={{ maxWidth: 360, marginBottom: 20 }}>
          <input
            className="fi"
            placeholder="Search history..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon" />
          {/* ✅ Fixed empty classes */}
          <div className="empty-t">
            {history.length === 0 ? 'No history yet' : 'No results'}
          </div>
          <div className="empty-s">
            {history.length === 0
              ? 'Your AI conversations will appear here'
              : 'Try a different search term'}
          </div>

          {history.length === 0 && (
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => navigate('/ask')}
            >
              Ask AI
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {filtered.map((h, i) => (
            <div
              key={h.id}
              style={{
                padding: '18px 24px',
                borderBottom:
                  i < filtered.length - 1
                    ? '1px solid var(--border)'
                    : 'none'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <div className="dc-icon" style={{ width: 26, height: 26 }}>
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {h.documentName}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {new Date(h.createdAt).toLocaleString()}
                  </span>

                  {/* ✅ Fixed badge classes */}
                  <span
                    className={`badge ${
                      h.source === 'CACHE'
                        ? 'b-processing'
                        : 'b-processed'
                    }`}
                    style={{ fontSize: 10 }}
                  >
                    {h.source}
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 8,
                  color: 'var(--text-primary)'
                }}
              >
                {h.question}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  maxHeight: 80,
                  overflow: 'hidden'
                }}
              >
                {h.answer}
              </div>

              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 8 }}
                onClick={() =>
                  navigate(`/ask?docId=${h.documentId}`)
                }
              >
                Continue conversation →
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}