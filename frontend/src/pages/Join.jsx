// frontend/src/pages/Join.jsx
import React, { useState } from 'react';

/**
 * Lightweight Join page that:
 * 1. Accepts a human join code (e.g. "96FFB2")
 * 2. Looks up sessionId via GET /api/sessions/lookup/:joinCode
 * 3. Calls POST /api/sessions/:sessionId/join with { name }
 * 4. Stores participantId & sessionId in localStorage and navigates to the "quiz" page
 *
 * This uses fetch (no axios dependency required). It expects a parent component to
 * call <Join setCurrentPage={setCurrentPage} /> so after joining we call setCurrentPage('quiz').
 */

export default function Join({ setCurrentPage }) {
  const [joinCode, setJoinCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  // Normalize API base so we never double “/api”
const rawApiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const apiBase = rawApiBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');

  // ...later in lookupSession and joinSession we build full URLs as:
  // const url = `${apiBase}/api/sessions/lookup/${encodeURIComponent(code)}`;
  // const url = `${apiBase}/api/sessions/${sessionId}/join`;

  const lookupSession = async (code) => {
    const res = await fetch(`${apiBase}/api/sessions/lookup/${encodeURIComponent(code)}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Lookup failed (${res.status})`);
    }
    return res.json();
  };

  const joinSession = async (sessionId, playerName) => {
    const res = await fetch(`${apiBase}/api/sessions/${sessionId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: playerName })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Join failed (${res.status})`);
    }
    return res.json();
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!joinCode || joinCode.trim().length < 3) {
      setError('Enter a valid join code.');
      return;
    }
    if (!name || name.trim().length < 1) {
      setError('Enter your display name.');
      return;
    }

    setLoading(true);
    try {
      // Lookup the session by code
      const lookup = await lookupSession(joinCode.trim().toUpperCase());
      // join the session
      const joinResp = await joinSession(lookup.sessionId, name.trim());
      // Persist minimal info for the play page
      localStorage.setItem('mt_sessionId', lookup.sessionId);
      localStorage.setItem('mt_joinCode', lookup.joinCode);
      localStorage.setItem('mt_participantId', joinResp.participantId);
      localStorage.setItem('mt_playerName', joinResp.name);

      setMessage(`Joined as ${joinResp.name}. Redirecting to quiz...`);
      setTimeout(() => {
        if (typeof setCurrentPage === 'function') setCurrentPage('quiz');
        // Fallback: navigate to / (if your App later uses routes, you can update this)
      }, 600);
    } catch (err) {
      console.error('Join error:', err);
      setError(err.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Join a Quiz</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Join Code</label>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter join code (e.g. 96FFB2)"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How should others see you?"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
              maxLength={30}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-60"
            >
              {loading ? 'Joining...' : 'Join Quiz'}
            </button>
            <button
              type="button"
              onClick={() => {
                setJoinCode('');
                setName('');
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-gray-500 hover:underline"
            >
              Clear
            </button>
          </div>

          {message && <div className="text-green-600 mt-2">{message}</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>Tip: Ask the host for the join code (6 characters). For demo, you can use the code returned by <code>/api/demo</code>.</p>
      </div>
    </div>
  );
}
