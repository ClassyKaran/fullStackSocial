import React, { useState } from 'react'
import { useRegister } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [alert, setAlert] = useState({ type: '', message: '' })
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    registerMutation.mutate(form, {
      onSuccess: (data) => {
        setAlert({ type: 'success', message: 'Registration successful!' })
        setTimeout(() => navigate('/feed'), 1000)
      },
      onError: (error) => {
        const msg = error?.response?.data?.error || error?.message || 'Registration failed!';
        setAlert({ type: 'danger', message: msg })
      }
    })
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-4">
        <h2>Register</h2>
        {alert.message && (
          <div className={`alert alert-${alert.type} mt-2`} role="alert">
            {alert.message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input type="text" name="username" className="form-control" value={form.username} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={registerMutation.isLoading}>Register</button>
        </form>
        <p className="mt-3">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
