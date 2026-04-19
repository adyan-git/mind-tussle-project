import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "../utils/axios";
import config from "../config/config";
import "./RealTimeQuizRestored.css";

const RealTimeQuizRestored = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    const isAdmin = user?.role === "admin";

    const [socket, setSocket] = useState(null);
    const [roomId, setRoomId] = useState("");
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState(null);
    const [gameState, setGameState] = useState("waiting"); // waiting | playing | result
    const [questionState, setQuestionState] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [liveLeaderboard, setLiveLeaderboard] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState("");
    const [quizzes, setQuizzes] = useState([]);

    const currentUserId = useMemo(() => user?._id || user?.id, [user]);
    const isHost = room?.hostId && currentUserId && room.hostId === currentUserId;

    useEffect(() => {
        if (!token) return undefined;
        const s = io(config.BACKEND_URL, { auth: { token }, forceNew: true });
        s.on("room_created", (data) => {
            setRoom(data.room);
            setRoomId(data.roomId);
            setGameState(data.room.status === "in_progress" ? "playing" : "waiting");
        });
        s.on("room_joined", (data) => {
            setRoom(data.room);
            setGameState(data.room.status === "in_progress" ? "playing" : "waiting");
        });
        s.on("player_joined", (data) => setRoom((prev) => (prev ? { ...prev, players: data.players, playerCount: data.playerCount } : prev)));
        s.on("player_left", (data) => setRoom((prev) => (prev ? { ...prev, players: data.players, playerCount: data.playerCount } : prev)));
        s.on("host_changed", (data) => setRoom((prev) => (prev ? { ...prev, hostId: data.newHostId } : prev)));
        s.on("new_question", (payload) => {
            setQuestionState(payload);
            setTimeLeft(payload.timeLimit || 30);
            setGameState("playing");
        });
        s.on("leaderboard_update", (payload) => setLiveLeaderboard(payload.leaderboard || []));
        s.on("question_results", (payload) => setLeaderboard(payload.leaderboard || []));
        s.on("quiz_finished", (payload) => {
            setLeaderboard(payload.leaderboard || []);
            setGameState("result");
        });
        setSocket(s);
        return () => s.disconnect();
    }, [token]);

    useEffect(() => {
        axios.get("/api/real-time-quiz/active-rooms").then(({ data }) => setRooms(data.rooms || [])).catch(() => setRooms([]));
        if (isAdmin) {
            axios.get("/api/quizzes").then(({ data }) => setQuizzes(data || [])).catch(() => setQuizzes([]));
        }
    }, [isAdmin]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const timerId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [gameState, questionState]);

    const createRoom = () => {
        if (!socket || !selectedQuizId) return;
        socket.emit("create_room", { quizId: selectedQuizId, settings: { maxPlayers: 6, timePerQuestion: 30 } });
    };

    const joinRoom = () => {
        if (!socket || !roomId.trim()) return;
        socket.emit("join_room", { roomId: roomId.trim().toUpperCase() });
    };

    const submitAnswer = (index) => {
        if (!socket || !questionState) return;
        const timeLimit = questionState.timeLimit || 30;
        const timeSpent = timeLimit - timeLeft;
        socket.emit("submit_answer", { answer: index, timeSpent });
    };

    return (
        <div className="rt-restored-page">
            <h1>{isAdmin ? "Admin Suite - Host Battles" : "Real-Time Battles"}</h1>

            {!room && (
                <>
                    <div className="rt-card">
                        <h2>Join Room ID</h2>
                        <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID (e.g. ABC123)" />
                        <button type="button" onClick={joinRoom}>Join Room</button>
                    </div>

                    {isAdmin && (
                        <div className="rt-card">
                            <h2>Create Room</h2>
                            <select value={selectedQuizId} onChange={(e) => setSelectedQuizId(e.target.value)}>
                                <option value="">Select quiz</option>
                                {quizzes.map((q) => <option key={q._id} value={q._id}>{q.title}</option>)}
                            </select>
                            <button type="button" onClick={createRoom}>Create Room</button>
                        </div>
                    )}

                    <div className="rt-card">
                        <h2>Active Rooms</h2>
                        {rooms.map((r) => (
                            <button key={r.id} type="button" onClick={() => setRoomId(r.id)}>
                                {r.id} - {r.quizTitle} ({r.playerCount}/{r.maxPlayers})
                            </button>
                        ))}
                    </div>
                </>
            )}

            {room && gameState === "waiting" && (
                <div className="rt-card">
                    <h2>Lobby - Room {room.id}</h2>
                    <p>{room.playerCount} players</p>
                    <ul>{room.players?.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
                    {isHost && <button type="button" onClick={() => socket?.emit("start_quiz")}>Start Quiz</button>}
                </div>
            )}

            {gameState === "playing" && questionState && (
                <div className="playing-container" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div className="rt-card" style={{ flex: '2 1 300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>Question {questionState.question?.questionNumber} of {questionState.question?.totalQuestions}</h2>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: timeLeft <= 3 ? '#ff4d4d' : 'white' }}>
                                ⏱️ {timeLeft}s
                            </div>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', margin: '10px 0 20px 0' }}>
                            <div style={{
                                height: '100%',
                                width: `${(timeLeft / (questionState.timeLimit || 30)) * 100}%`,
                                backgroundColor: timeLeft <= 3 ? '#ff4d4d' : '#4CAF50',
                                transition: 'width 1s linear, background-color 0.3s ease'
                            }}></div>
                        </div>
                        <h3>{questionState.question?.question}</h3>
                        <div className="options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                            {questionState.question?.options?.map((option, i) => (
                                <button key={`${option}-${i}`} type="button" onClick={() => submitAnswer(i)}>
                                    {String.fromCharCode(65 + i)}. {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rt-card live-leaderboard" style={{ flex: '1 1 200px', maxHeight: '400px', overflowY: 'auto' }}>
                        <h3>Live Rankings</h3>
                        {liveLeaderboard.length === 0 && <p style={{ fontSize: '0.9rem', color: '#888' }}>No scores this round...</p>}
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {liveLeaderboard.map((p, index) => (
                                <li key={p.playerId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span><strong style={{ opacity: 0.7 }}>#{index + 1}</strong> {p.playerName}</span>
                                    <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>{p.score} pts</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {gameState === "result" && leaderboard.length > 0 && (
                <>
                    <style>
                        {`
                        @keyframes slideUpFade {
                            0% { opacity: 0; transform: translateY(30px) scale(0.95); }
                            100% { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        `}
                    </style>
                    <div
                        className="rt-card"
                        style={{
                            background: 'rgba(20, 20, 30, 0.8)',
                            backdropFilter: 'blur(15px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            maxWidth: '800px',
                            margin: '0 auto',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                    >
                        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            🏆 Final Leaderboard 🏆
                        </h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {leaderboard.map((p, index) => {
                                let icon = '';
                                if (index === 0) icon = '🥇';
                                else if (index === 1) icon = '🥈';
                                else if (index === 2) icon = '🥉';
                                else icon = `#${index + 1}`;

                                const isMe = p.playerId === currentUserId;

                                return (
                                    <li
                                        key={p.playerId}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '15px 25px',
                                            background: isMe ? 'rgba(57, 255, 20, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                                            border: isMe ? '1px solid #39ff14' : '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '16px',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                            animation: `slideUpFade 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
                            animationDelay: `${index * 0.15}s`,
                            opacity: 0,
                                        }}
                                    >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                                <span style={{ fontSize: '2rem', width: '45px', textAlign: 'center' }}>{icon}</span>
                                <span style={{ fontSize: '1.3rem', fontWeight: isMe ? 'bold' : 'normal', color: isMe ? '#39ff14' : '#fff' }}>
                                    {p.playerName} {isMe && '(You)'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Accuracy</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{p.accuracy ?? 0}%</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '100px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Points</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffd700', textShadow: '0 0 10px rgba(255,215,0,0.3)' }}>{p.score}</span>
                                </div>
                            </div>
                        </li>
                        );
                            })}
                    </ul>
                </div>
        </>
    )
}
        </div >
    );
};

export default RealTimeQuizRestored;
