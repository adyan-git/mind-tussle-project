// frontend/src/pages/Results.jsx
import React, { useEffect, useState } from 'react';

export default function Results({ setCurrentPage }) {
  const rawApiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const apiBase = rawApiBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  const sessionId = localStorage.getItem('mt_sessionId');

  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session found. Join a session first.');
      setLoading(false);
      return;
    }
    const fetchResults = async () => {
      try {
        const res = await fetch(`${apiBase}/api/sessions/${sessionId}/results`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const body = await res.json();
        if (Array.isArray(body.leaderboard)) {
          setLeaderboard(body.leaderboard);
        } else if (body.session && Array.isArray(body.session.participants)) {
          const arr = body.session.participants.map(p => ({ name: p.name, score: p.score }));
          setLeaderboard(arr.sort((a,b) => b.score - a.score));
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        console.error('Results fetch error', err);
        setError('Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [sessionId, apiBase]);

  if (!sessionId) {
    return (
      <div>
        <h2 className="text-2xl font-bold">Results</h2>
        <p className="text-red-600">No session found. Join a quiz first.</p>
        <button onClick={() => setCurrentPage('join')} className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg">Join</button>
      </div>
    );
  }

  if (loading) return <div>Loading results...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      {leaderboard.length === 0 ? (
        <div>No results yet.</div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <ol className="divide-y">
            {leaderboard.map((p, idx) => (
              <li key={idx} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{idx+1}. {p.name}</div>
                  <div className="text-sm text-gray-500">Quizzes: {p.quizzes ?? '—'}</div>
                </div>
                <div className="text-lg font-bold text-indigo-600">{p.score ?? 0} pts</div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button onClick={() => setCurrentPage('dashboard')} className="bg-gray-200 py-2 px-4 rounded">Back to Dashboard</button>
        <button onClick={() => { localStorage.clear(); setCurrentPage('join'); }} className="bg-indigo-600 text-white py-2 px-4 rounded">Start New Session</button>
      </div>
    </div>
  );
}
