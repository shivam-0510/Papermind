import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as api from '../services/api'
import { useAuth } from '../context/AuthContext'

interface Message {
  role: 'user' | 'ai'
  text: string
  source?: string
  streaming?: boolean
}

const suggestions = [
  'Summarize the key points of this document',
  'What are the main conclusions?',
  'List the important dates mentioned',
  'Explain the main topic in simple terms',
]

export default function AskAI() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const [docs, setDocs] = useState<any[]>([])
  const [docId, setDocId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    api.getDocuments().then(r => {
      const processed = r.data.filter((d: any) => d.status === 'PROCESSED')
      setDocs(processed)

      const preselect = params.get('docId')
      if (preselect) {
        setDocId(preselect)
        loadHistory(Number(preselect))
      } else if (processed.length > 0) {
        setDocId(String(processed[0].id))
        loadHistory(Number(processed[0].id))
      }
    }).catch(() => {})
  }, [])

  const loadHistory = async (id: number) => {
    try {
      const res = await api.getDocumentHistory(id)
      const msgs: Message[] = []
      for (const h of res.data) {
        msgs.push({ role: 'user', text: h.question })
        msgs.push({ role: 'ai', text: h.answer, source: h.source })
      }
      setMessages(msgs)
    } catch {
      setMessages([])
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 170) + 'px'
    }
  }

  const send = async (q?: string) => {
    const question = (q || input).trim()
    if (!question || !docId || loading) return

    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, { role: 'user', text: question }])
    setMessages(prev => [...prev, { role: 'ai', text: '', streaming: true }])

    try {
      const res = await api.askQuestion(Number(docId), question)

      setMessages(prev => prev.slice(0, -1))

      const full = res.data.answer
      const source = res.data.source
      const words = full.split(' ')
      let i = 0

      setMessages(prev => [...prev, { role: 'ai', text: '', streaming: true }])

      const interval = setInterval(() => {
        if (i >= words.length) {
          clearInterval(interval)
          setMessages(prev => {
            const next = [...prev]
            next[next.length - 1] = {
              role: 'ai',
              text: full,
              source,
              streaming: false
            }
            return next
          })
          setLoading(false)
          return
        }

        const chunk = words.slice(0, i + 1).join(' ')
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = {
            role: 'ai',
            text: chunk,
            streaming: true
          }
          return next
        })

        i++
      }, 28)

    } catch (err: any) {
      setMessages(prev => prev.slice(0, -2))
      toast.error(
        err.response?.data?.answer ||
        err.response?.data?.error ||
        'AI request failed'
      )
      setLoading(false)
    }
  }

  const handleDocChange = (id: string) => {
    setDocId(id)
    setMessages([])
    if (id) loadHistory(Number(id))
  }

  return (
    <div className="chat-layout">

      {/* Document selector */}
      <div className="chat-doc-bar">
        <select
          className="doc-select"
          value={docId}
          onChange={e => handleDocChange(e.target.value)}
        >
          <option value="">— Select a document —</option>
          {docs.map(d => (
            <option key={d.id} value={d.id}>
              {d.fileName}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && docId ? (
          <div className="suggestions">
            <div className="sug-title">Ask about this document</div>
            <div className="sug-sub">
              Try one of these or type your own question
            </div>
            <div className="sug-grid">
              {suggestions.map(s => (
                <button
                  key={s}
                  className="sug-pill"
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty">
            <div className="empty-icon" />
            <div className="empty-t">Select a document to start</div>
            <div className="empty-s">
              Choose a processed document above to begin asking questions
            </div>
          </div>
        ) : (
          <div className="chat-inner">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role}`}>
                <div className="msg-av">
                  {msg.role === 'user'
                    ? (user?.name?.[0]?.toUpperCase() || 'U')
                    : 'AI'}
                </div>

                <div className="msg-body">
                  <div className="msg-role">
                    {msg.role === 'user' ? 'You' : 'PaperMind AI'}
                  </div>

                  {msg.role === 'ai' && msg.text === '' && msg.streaming ? (
                    <div className="typing">
                      <span /><span /><span />
                    </div>
                  ) : (
                    <>
                      <div className="msg-text">
                        {msg.text}
                        {msg.streaming && <span className="cursor" />}
                      </div>

                      {msg.source && !msg.streaming && (
                        <div className="msg-meta">
                          {msg.source}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-wrap">
        <div className="chat-input-box">
          <textarea
            ref={textareaRef}
            className="chat-ta"
            placeholder={
              docId
                ? "Ask a question about the document..."
                : "Select a document first"
            }
            value={input}
            disabled={!docId || loading}
            onChange={e => {
              setInput(e.target.value)
              autoResize()
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            rows={1}
          />

          <div className="input-footer">
            <span className="input-hint">
              Enter to send · Shift+Enter for new line
            </span>

            <button
              className="send-btn"
              onClick={() => send()}
              disabled={!input.trim() || !docId || loading}
            >
              {loading ? (
                <span className="spin" />
              ) : (
                '→'
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}