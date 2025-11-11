// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import api from '../utils/api';

export default function Login({ setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      // go back to dashboard view
      if (typeof setCurrentPage === 'function') {
        setCurrentPage('dashboard');
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow-sm bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input
            type="email"
            className="mt-1 block w-full p-2 border rounded bg-gray-50 dark:bg-gray-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input
            type="password"
            className="mt-1 block w-full p-2 border rounded bg-gray-50 dark:bg-gray-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          className="w-full p-2 rounded bg-indigo-600 text-white disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
