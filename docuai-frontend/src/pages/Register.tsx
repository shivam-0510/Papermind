import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/api'
import Logo from '../Logo'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async () => {
    if (!name || !email || !password)
      return toast.error('Please fill all fields')

    if (password.length < 6)
      return toast.error('Password must be at least 6 characters')

    setLoading(true)

    try {
      const res = await api.register({ name, email, password })
      login(res.data)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed')
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
        <h1 className="auth-h">Create account</h1>
        <p className="auth-s">
          Get started with AI-powered document intelligence
        </p>

        <div className="fg">
          <label className="fl">Full name</label>
          <input
            className="fi"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

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
            placeholder="Min. 6 characters"
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
          {loading ? (
            <>
              <span className="spin" /> Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>

        {/* ✅ Fixed footer */}
        <div className="auth-foot">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  )
}