import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios'; // Import axios
import './index.css';
import App from './App';

// Set the base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);