
// import React from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useQueryClient } from '@tanstack/react-query'

// function getUserIdFromToken() {
//   const token = localStorage.getItem('token');
//   if (!token) return '';
//   try {
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     return payload.id || payload.userId || '';
//   } catch {
//     return '';
//   }
// }

// function Navbar() {
//   const navigate = useNavigate()
//   const queryClient = useQueryClient()
//   const userId = getUserIdFromToken();

//   const handleLogout = () => {
//     localStorage.removeItem('token')
//     queryClient.clear()
//     navigate('/login')
//   }

//   return (
//     <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
//       <div className="container">
//         <Link className="navbar-brand" to="/feed">Mini Social</Link>
//         <div className="navbar-nav ms-auto">
//           <Link className="nav-link" to="/feed">Feed</Link>
//           <Link className="nav-link" to={`/profile/${userId}`}>Profile</Link>
//           <Link className="nav-link" to="/chat">Chat</Link>
//           <button className="btn btn-outline-light ms-2" onClick={handleLogout}>Logout</button>
//         </div>
//       </div>
//     </nav>
//   )
// }

// export default Navbar







import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

function getUserIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload.userId || '';
  } catch {
    return '';
  }
}

function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = getUserIdFromToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    queryClient.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/feed">
          <i className="bi bi-people-fill me-2"></i> Mini Social
        </Link>

        {/* Toggler for Mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link className="nav-link px-3" to="/feed">
                <i className="bi bi-house-door-fill me-1"></i> Feed
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to={`/profile/${userId}`}>
                <i className="bi bi-person-circle me-1"></i> Profile
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/chat">
                <i className="bi bi-chat-dots-fill me-1"></i>Message
              </Link>
            </li>
            <li className="nav-item ms-lg-3">
              <button
                className="btn btn-light btn-sm px-3 rounded-pill fw-semibold"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;

