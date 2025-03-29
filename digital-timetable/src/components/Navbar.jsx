import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">

        <Link to="/">MyLogo</Link>
      </div>
      <div className="navbar-menu">
        {user ? (
          <>
            <span className="navbar-username">Hello, {user.username}</span>
            <button onClick={handleLogout} className="navbar-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-btn">Login</Link>
            <Link to="/signup" className="navbar-btn">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
