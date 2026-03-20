import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import * as api from '../services/api'

export default function Profile() {
  const { user, login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [name, setName] = useState(user?.name || '')
  const [currPwd, setCurrPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [saving, setSaving] = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [rateLimit, setRateLimit] = useState<any>(null)

  useEffect(() => {
    api.getRateLimit().then(r => setRateLimit(r.data)).catch(() => {})
  }, [])

  const saveName = async () => {
    if (!name.trim()) return toast.error('Name cannot be empty')
    setSaving(true)
    try {
      await api.updateProfile(name)
      if (user) login({ ...user, name, token: user.token })
      toast.success('Name updated!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (!currPwd || !newPwd)
      return toast.error('Fill both password fields')
    if (newPwd.length < 6)
      return toast.error('New password must be at least 6 characters')

    setPwdSaving(true)
    try {
      await api.changePassword(currPwd, newPwd)
      toast.success('Password changed!')
      setCurrPwd('')
      setNewPwd('')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Password change failed')
    } finally {
      setPwdSaving(false)
    }
  }

  return (
    <>
      {/* ✅ Fixed header class */}
      <div className="page-hdr">
        <h1 className="page-title">Profile & Settings</h1>
        <p className="page-sub">
          Manage your account information and preferences
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        maxWidth: 800
      }}>

        {/* Account Info */}
        <div className="card">
          <div className="card-title">
            Account Info
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 20,
            padding: '14px 0',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--accent)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {user?.email}
              </div>
              <div style={{
                fontSize: 11,
                color: user?.role === 'ROLE_ADMIN'
                  ? 'var(--accent)'
                  : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                marginTop: 2
              }}>
                {user?.role}
              </div>
            </div>
          </div>

          {/* ✅ Fixed form classes */}
          <div className="fg">
            <label className="fl">Display Name</label>
            <input
              className="fi"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
            />
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={saveName}
            disabled={saving}
          >
            {saving ? <><span className="spin" /> Saving...</> : 'Save Name'}
          </button>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-title">
            Change Password
          </div>

          <div className="fg">
            <label className="fl">Current Password</label>
            <input
              className="fi"
              type="password"
              placeholder="Current password"
              value={currPwd}
              onChange={e => setCurrPwd(e.target.value)}
            />
          </div>

          <div className="fg">
            <label className="fl">New Password</label>
            <input
              className="fi"
              type="password"
              placeholder="Min. 6 characters"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && changePassword()}
            />
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={changePassword}
            disabled={pwdSaving}
          >
            {pwdSaving
              ? <><span className="spin" /> Changing...</>
              : 'Change Password'}
          </button>
        </div>

        {/* Rate Limit */}
        {rateLimit && (
          <div className="card">
            <div className="card-title">
              AI Query Usage
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                marginBottom: 8
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Used this hour
                </span>
                <span style={{ fontWeight: 600 }}>
                  {rateLimit.used} / {rateLimit.limit}
                </span>
              </div>

              <div style={{
                height: 6,
                background: 'var(--border)',
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: rateLimit.remaining <= 5
                    ? 'var(--error)'
                    : 'var(--accent)',
                  width: `${Math.min(
                    100,
                    (rateLimit.used / rateLimit.limit) * 100
                  )}%`,
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            <p style={{
              fontSize: 12,
              color: 'var(--text-muted)'
            }}>
              {rateLimit.remaining} queries remaining.
              Resets every hour. Cached answers don't count.
            </p>
          </div>
        )}

        {/* Theme */}
        <div className="card">
          <div className="card-title">
            Appearance
          </div>

          <p style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginBottom: 14
          }}>
            Currently using <strong>
              {isDark ? 'dark' : 'light'}
            </strong> mode
          </p>

          <button
            className="btn btn-secondary btn-sm"
            onClick={toggleTheme}
          >
            Switch to {isDark ? 'Light' : 'Dark'} Mode
          </button>
        </div>

      </div>
    </>
  )
}