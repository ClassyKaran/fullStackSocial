import React, { useState } from 'react'
import { useLogin } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    loginMutation.mutate(form, {
      onSuccess: () => {
        navigate('/feed')
      },
    })
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-4">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loginMutation.isLoading}>Login</button>
        </form>
        <p className="mt-3">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
