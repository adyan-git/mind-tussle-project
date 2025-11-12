// frontend/src/pages/Play.jsx
import React, { useEffect, useState, useRef } from 'react';

export default function Play({ setCurrentPage }) {
  const rawApiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const apiBase = rawApiBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');

  const sessionId = localStorage.getItem('mt_sessionId');
  const participantId = localStorage.getItem('mt_participantId');
  const playerName = localStorage.getItem('mt_playerName') || 'You';

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const timerRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!sessionId || !participantId) {
      setError('Missing session or participant information. Please join first.');
      setLoading(false);
      return;
    }

    const fetchCurrent = async () => {
      try {
        const res = await fetch(`${apiBase}/api/sessions/${sessionId}/current`);
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(txt || `Status ${res.status}`);
        }
        const body = await res.json();
        setIsActive(Boolean(body.isActive));
        setQuestion(body.question || null);
        setActiveIndex(body.activeQuestionIndex ?? null);

        setHasAnswered(false);
        setSelectedIndex(null);
        setIsCorrect(null);

        if (body.participants) {
          const me = body.participants.find(p => p.participantId === participantId);
          if (me) setScore(me.score ?? 0);
        } else if (body.currentScore !== undefined) {
          setScore(body.currentScore);
        }

        if (body.question && typeof body.question.timeLimit === 'number') {
          setTimeLeft(body.question.timeLimit);
        } else {
          setTimeLeft(null);
        }
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Play fetch current error', err);
        setError('Failed to fetch session. Try reloading.');
        setLoading(false);
      }
    };

    fetchCurrent();
    pollRef.current = setInterval(fetchCurrent, 1000);
    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, [sessionId, participantId, apiBase]);

  useEffect(() => {
    if (timeLeft == null) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev == null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question, timeLeft]);

  const submitAnswer = async (index) => {
    if (hasAnswered) return;
    setSelectedIndex(index);
    setHasAnswered(true);

    try {
      const res = await fetch(`${apiBase}/api/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, selectedIndex: index })
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Status ${res.status}`);
      }
      const body = await res.json();
      setIsCorrect(Boolean(body.isCorrect));
      if (typeof body.currentScore === 'number') setScore(body.currentScore);
    } catch (err) {
      console.error('Submit answer error', err);
      setError('Failed to submit answer. Please try again.');
    }
  };

  if (!sessionId || !participantId) {
    return (
      <div>
        <h2 className="text-2xl font-bold">Play</h2>
        <p className="text-red-600">Missing session/participant. Please join first.</p>
        <button onClick={() => setCurrentPage('join')} className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg">Go to Join</button>
      </div>
    );
  }

  if (loading) return <div>Loading session...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!isActive) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Session finished</h2>
        <p>Your final score: <strong>{score}</strong></p>
        <div className="mt-4">
          <button onClick={() => setCurrentPage('results')} className="bg-indigo-600 text-white py-2 px-4 rounded-lg">View Results</button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div>
        <h2 className="text-2xl font-bold">Waiting for host...</h2>
        <p>Keep this page open — the host will start the quiz shortly.</p>
        <p className="mt-2">Your score: <strong>{score}</strong></p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Question</h2>
        <div>
          <div className="text-sm text-gray-500">Player: {playerName}</div>
          <div className="text-lg font-semibold">Score: {score}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">Q #{activeIndex != null ? activeIndex + 1 : '?'}</div>
          {timeLeft != null && <div className="text-sm font-mono">{timeLeft}s</div>}
        </div>

        <h3 className="text-xl font-semibold mb-4">{question.text}</h3>

        <div className="grid gap-3">
          {question.options && question.options.map((opt, idx) => {
            const disabled = hasAnswered;
            const selected = selectedIndex === idx;
            const correctClass = hasAnswered && isCorrect && selected ? 'border-green-500 bg-green-50' : '';
            const wrongClass = hasAnswered && !isCorrect && selected ? 'border-red-500 bg-red-50' : '';
            return (
              <button
                key={idx}
                onClick={() => !disabled && submitAnswer(idx)}
                disabled={disabled}
                className={`text-left p-4 rounded-lg border transition ${selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'} ${correctClass} ${wrongClass}`}
              >
                <div className="font-medium">{String.fromCharCode(65 + idx)}. {opt}</div>
                {hasAnswered && selected && (
                  <div className="mt-2 text-sm">{isCorrect ? 'Correct' : 'Incorrect'}</div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">Status: {hasAnswered ? (isCorrect ? 'Answered — correct' : 'Answered') : 'Not answered'}</div>
          <div>
            <button onClick={() => { localStorage.clear(); setCurrentPage('dashboard'); }} className="text-sm text-gray-500 hover:underline mr-4">Leave</button>
            <button onClick={() => setCurrentPage('join')} className="text-sm text-gray-500 hover:underline">Join another</button>
          </div>
        </div>
      </div>
    </div>
  );
}
