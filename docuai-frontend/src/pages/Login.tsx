import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/api'
import Logo from '../Logo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async () => {
    if (!email || !password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const res = await api.login({ email, password })
      login(res.data)
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-box">

        <div className="auth-brand">
          <Logo size={30} />
          <span className="brand-name">PaperMind</span>
        </div>

        {/* ✅ Fixed classes */}
        <h1 className="auth-h">Welcome back</h1>
        <p className="auth-s">Sign in to your account to continue</p>

        <div className="fg">
          <label className="fl">Email</label>
          <input
            className="fi"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        <div className="fg">
          <label className="fl">Password</label>
          <input
            className="fi"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={submit}
          disabled={loading}
        >
          {loading ? <><span className="spin" /> Signing in...</> : 'Sign in'}
        </button>

        {/* ✅ Fixed footer class */}
        <div className="auth-foot">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Create one
          </Link>
        </div>

      </div>
    </div>
  )
}