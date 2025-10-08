import React, { useState } from 'react'
import { useLogin } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [alert, setAlert] = useState({ type: '', message: '' })
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    loginMutation.mutate(form, {
      onSuccess: (data) => {
        setAlert({ type: 'success', message: 'Login successful!' })
        setTimeout(() => navigate('/feed'), 1000)
      },
      onError: (error) => {
        const msg = error?.response?.data?.error || error?.message || 'Login failed!';
        setAlert({ type: 'danger', message: msg })
      }
    })
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '420px', borderRadius: '1rem' }}>
        <h3 className="text-center mb-4 text-primary fw-bold">Welcome Back 👋</h3>

        {alert.message && (
          <div className={`alert alert-${alert.type} text-center`} role="alert">
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 btn-lg mt-2"
            disabled={loginMutation.isLoading}
          >
            {loginMutation.isLoading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            Login
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Don’t have an account?
          <Link to="/register" className="text-decoration-none fw-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login


















// import React, { useState } from 'react'
// import { useLogin } from '../hooks/useAuth'
// import { useNavigate, Link } from 'react-router-dom'

// function Login() {
//   const [form, setForm] = useState({ email: '', password: '' })
//   const [alert, setAlert] = useState({ type: '', message: '' })
//   const navigate = useNavigate()
//   const loginMutation = useLogin()

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     loginMutation.mutate(form, {
//       onSuccess: (data) => {
//         setAlert({ type: 'success', message: 'Login successful!' })
//         setTimeout(() => navigate('/feed'), 1000)
//       },
//       onError: (error) => {
//         const msg = error?.response?.data?.error || error?.message || 'Login failed!';
//         setAlert({ type: 'danger', message: msg })
//       }
//     })
//   }

//   return (
//     <div className="row justify-content-center">
//       <div className="col-md-4">
//         <h2>Login</h2>
//         {alert.message && (
//           <div className={`alert alert-${alert.type} mt-2`} role="alert">
//             {alert.message}
//           </div>
//         )}
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label className="form-label">Email</label>
//             <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
//           </div>
//           <div className="mb-3">
//             <label className="form-label">Password</label>
//             <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
//           </div>
//           <button type="submit" className="btn btn-primary" disabled={loginMutation.isLoading}>Login</button>
//         </form>
//         <p className="mt-3">
//           Don't have an account? <Link to="/register">Register here</Link>
//         </p>
//       </div>
//     </div>
//   )
// }

// export default Login
