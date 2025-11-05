import React, { createContext, useState, useEffect, useCallback } from 'react'; // Add useCallback
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0); // New state for count

  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  };

  const loadUser = useCallback(async () => { // Wrap in useCallback
    const localToken = localStorage.getItem('token');
    if (localToken) {
      setAuthToken(localToken);
      try {
        const res = await axios.get('/api/auth/user');
        setUser(res.data);
      } catch (err) {
        setToken(null);
        localStorage.removeItem('token');
        setUser(null); // Ensure user is null on error
        console.error('Error loading user', err.response?.data?.msg || err.message);
      }
    } else {
        setUser(null); // Ensure user is null if no token
    }
    setLoading(false);
  }, []); // Empty dependency array means it only gets created once


  const fetchPendingRequestsCount = useCallback(async () => { // New function
    if (!user) {
      setPendingRequestsCount(0);
      return;
    }
    try {
      const res = await axios.get('/api/swap/my-requests');
      const incoming = res.data.filter(
        (req) => req.responder._id === user._id && req.status === 'PENDING'
      );
      setPendingRequestsCount(incoming.length);
    } catch (err) {
      console.error('Error fetching pending requests count', err.response?.data?.msg || err.message);
      setPendingRequestsCount(0); // Reset on error
    }
  }, [user]); // Re-run if user changes


  useEffect(() => {
    loadUser();
  }, [loadUser]); // Dependency array includes loadUser (from useCallback)

  useEffect(() => { // New useEffect for fetching count
    if (user) {
      fetchPendingRequestsCount();
      // Optional: Polling for real-time notifications (every 30 seconds)
      const interval = setInterval(fetchPendingRequestsCount, 30000); 
      return () => clearInterval(interval); // Cleanup on unmount/user change
    } else {
        setPendingRequestsCount(0);
    }
  }, [user, fetchPendingRequestsCount]);


  const login = async (email, password) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    const body = JSON.stringify({ email, password });

    try {
      const res = await axios.post('/api/auth/login', body, config);
      setToken(res.data.token);
      setAuthToken(res.data.token);
      await loadUser();
      return { success: true };
    } catch (err) {
      console.error('Login failed', err.response?.data?.errors || err.response?.data?.msg || err.message);
      setToken(null);
      localStorage.removeItem('token');
      setUser(null);
      return { success: false, errors: err.response?.data?.errors || [{msg: 'Login failed'}] };
    }
  };

  const signup = async (name, email, password) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    const body = JSON.stringify({ name, email, password });

    try {
      const res = await axios.post('/api/auth/signup', body, config);
      setToken(res.data.token);
      setAuthToken(res.data.token);
      await loadUser();
      return { success: true };
    } catch (err) {
      console.error('Signup failed', err.response?.data?.errors || err.response?.data?.msg || err.message);
      setToken(null);
      localStorage.removeItem('token');
      setUser(null);
      return { success: false, errors: err.response?.data?.errors || [{msg: 'Signup failed'}] };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    setPendingRequestsCount(0); // Reset count on logout
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        signup,
        logout,
        loadUser,
        pendingRequestsCount, // Provide the count
        fetchPendingRequestsCount // Provide the function to refresh it manually
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};