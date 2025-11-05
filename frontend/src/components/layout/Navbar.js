import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, pendingRequestsCount } = useContext(AuthContext); // Get pendingRequestsCount
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const authLinks = (
    <ul>
      <li>Welcome, {user && user.name}</li>
      <li>
        <Link to="/dashboard">Dashboard</Link>
      </li>
      <li>
        <Link to="/marketplace">Marketplace</Link>
      </li>
      <li>
        <Link to="/requests">
          Requests{' '}
          {pendingRequestsCount > 0 && (
            <span className="notification-icon">{pendingRequestsCount}</span>
          )}
        </Link>
      </li>
      <li>
        <a onClick={onLogout} href="#!">
          Logout
        </a>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <Link to="/login">Login</Link>
      </li>
      <li>
        <Link to="/signup">Sign Up</Link>
      </li>
    </ul>
  );

  return <nav>{user ? authLinks : guestLinks}</nav>;
};

export default Navbar;