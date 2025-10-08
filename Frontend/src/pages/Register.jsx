

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
        const msg = error?.response?.data?.error || error?.message || 'Registration failed!'
        setAlert({ type: 'danger', message: msg })
      },
    })
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '420px', borderRadius: '1rem' }}>
        <h3 className="text-center mb-4 text-primary fw-bold">Create Your Account 🚀</h3>

        {alert.message && (
          <div className={`alert alert-${alert.type} text-center`} role="alert">
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input
              type="text"
              name="username"
              className="form-control form-control-lg"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control form-control-lg"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              name="password"
              className="form-control form-control-lg"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 btn-lg mt-2"
            disabled={registerMutation.isLoading}
          >
            {registerMutation.isLoading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            Register
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Already have an account?{' '}
          <Link to="/login" className="text-decoration-none fw-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register


















// import React, { useState } from 'react'
// import { useRegister } from '../hooks/useAuth'
// import { useNavigate, Link } from 'react-router-dom'

// function Register() {
//   const [form, setForm] = useState({ username: '', email: '', password: '' })
//   const [alert, setAlert] = useState({ type: '', message: '' })
//   const navigate = useNavigate()
//   const registerMutation = useRegister()

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     registerMutation.mutate(form, {
//       onSuccess: (data) => {
//         setAlert({ type: 'success', message: 'Registration successful!' })
//         setTimeout(() => navigate('/feed'), 1000)
//       },
//       onError: (error) => {
//         const msg = error?.response?.data?.error || error?.message || 'Registration failed!';
//         setAlert({ type: 'danger', message: msg })
//       }
//     })
//   }

//   return (
//     <div className="row justify-content-center">
//       <div className="col-md-4">
//         <h2>Register</h2>
//         {alert.message && (
//           <div className={`alert alert-${alert.type} mt-2`} role="alert">
//             {alert.message}
//           </div>
//         )}
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label className="form-label">Username</label>
//             <input type="text" name="username" className="form-control" value={form.username} onChange={handleChange} required />
//           </div>
//           <div className="mb-3">
//             <label className="form-label">Email</label>
//             <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
//           </div>
//           <div className="mb-3">
//             <label className="form-label">Password</label>
//             <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
//           </div>
//           <button type="submit" className="btn btn-primary" disabled={registerMutation.isLoading}>Register</button>
//         </form>
//         <p className="mt-3">
//           Already have an account? <Link to="/login">Login here</Link>
//         </p>
//       </div>
//     </div>
//   )
// }

// export default Register
