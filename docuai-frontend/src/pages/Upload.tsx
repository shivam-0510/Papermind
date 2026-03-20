import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as api from '../services/api'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf'))
      return toast.error('Only PDF files allowed')

    if (f.size > 25 * 1024 * 1024)
      return toast.error('File too large — max 25MB')

    setFile(f)
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    setProgress(true)

    try {
      await api.uploadDocument(file)
      toast.success('PDF uploaded! Processing via Kafka...')
      navigate('/documents')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(false)
    }
  }

  const fmt = (b: number) =>
    b > 1024 * 1024
      ? (b / 1024 / 1024).toFixed(1) + 'MB'
      : (b / 1024).toFixed(0) + 'KB'

  return (
    <>
      {/* ✅ Fixed header class */}
      <div className="page-hdr">
        <h1 className="page-title">Upload Document</h1>
        <p className="page-sub">
          Upload a PDF to extract text and enable AI Q&amp;A
        </p>
      </div>

      <div className="banner info">
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>
          PDF files only · max 25MB · processed asynchronously via Kafka
        </span>
      </div>

      <div
        className={`drop-zone${dragging ? ' drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          const f = e.dataTransfer.files[0]
          if (f) handleFile(f)
        }}
      >
        {/* ✅ Fixed icon/title/sub classes */}
        <div className="dz-icon">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>

        <div className="dz-title">
          {file ? file.name : 'Drop PDF here or click to browse'}
        </div>

        <div className="dz-sub">
          {file ? fmt(file.size) : 'PDF files up to 25MB'}
        </div>

        {progress && (
          <div className="progress" style={{ marginTop: 16 }}>
            <div className="progress-fill" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={e =>
          e.target.files?.[0] && handleFile(e.target.files[0])
        }
      />

      {file && (
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            className="btn btn-primary"
            onClick={upload}
            disabled={uploading}
          >
            {uploading
              ? <><span className="spin" /> Uploading...</>
              : 'Upload PDF'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setFile(null)}
          >
            Clear
          </button>
        </div>
      )}
    </>
  )
}