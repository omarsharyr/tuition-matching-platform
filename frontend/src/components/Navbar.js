import "../styles/Navbar.css";import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          TuitionMatch
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="nav-link btn-link">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login/student" className="nav-link">
                Student Login
              </Link>
              <Link to="/login/tutor" className="nav-link">
                Tutor Login
              </Link>
              <Link to="/register/student" className="nav-link">
                Student Register
              </Link>
              <Link to="/register/tutor" className="nav-link">
                Tutor Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;