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
    const [hasAnswered, setHasAnswered] = useState(false);
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
            setHasAnswered(false);
            setGameState("playing");
        });
        s.on("leaderboard_update", (payload) => setLiveLeaderboard(payload.leaderboard || []));
        s.on("question_results", (payload) => setLeaderboard(payload.leaderboard || []));
        s.on("quiz_finished", (payload) => {
            setLeaderboard(payload.leaderboard || []);
            setHasAnswered(false);
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
        if (!socket || !questionState || hasAnswered) return;
        const timeLimit = questionState.timeLimit || 30;
        const timeSpent = timeLimit - timeLeft;
        setHasAnswered(true);
        socket.emit("submit_answer", { answer: index, timeSpent });
    };

    return (
        <div className="rt-restored-page">
            <h1>{isAdmin ? "Admin - Host Battles" : "Real-Time Battles"}</h1>

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
                <div className="playing-container">
                    <div className="rt-card battle-main-card">
                        <div className="battle-header">
                            <h2>Question {questionState.question?.questionNumber} of {questionState.question?.totalQuestions}</h2>
                            <div className={`battle-timer ${timeLeft <= 3 ? "critical" : ""}`}>
                                ⏱️ {timeLeft}s
                            </div>
                        </div>
                        <div className="battle-progress-track">
                            <div
                                className={`battle-progress-fill ${timeLeft <= 3 ? "critical" : ""}`}
                                style={{ width: `${(timeLeft / (questionState.timeLimit || 30)) * 100}%` }}
                            />
                        </div>
                        <h3>{questionState.question?.question}</h3>
                        <div className="options-grid">
                            {questionState.question?.options?.map((option, i) => (
                                <button
                                    key={`${option}-${i}`}
                                    type="button"
                                    onClick={() => submitAnswer(i)}
                                    disabled={hasAnswered}
                                >
                                    {String.fromCharCode(65 + i)}. {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rt-card live-leaderboard">
                        <h3>Live Rankings</h3>
                        {liveLeaderboard.length === 0 && <p className="empty-live-board">No scores this round...</p>}
                        <ul className="live-rank-list">
                            {liveLeaderboard.map((p, index) => (
                                <li key={p.playerId} className={`live-rank-item ${p.playerId === currentUserId ? "self" : "opponent"}`}>
                                    <span><strong className="rank-num">#{index + 1}</strong> {p.playerName}</span>
                                    <span className="rank-score">{p.score} pts</span>
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
                    <div className="rt-card final-board-card">
                        <h2 className="final-board-title">
                            🏆 Final Leaderboard 🏆
                        </h2>
                        <ul className="final-rank-list">
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
                                        className={`final-rank-item ${isMe ? "self" : "opponent"}`}
                                        style={{ animationDelay: `${index * 0.15}s` }}
                                    >
                            <div className="final-rank-left">
                                <span className="final-rank-icon">{icon}</span>
                                <span className="final-rank-name">
                                    {p.playerName} {isMe && '(You)'}
                                </span>
                            </div>
                            <div className="final-rank-right">
                                <div className="metric-block">
                                    <span className="metric-label">Accuracy</span>
                                    <span className="metric-value">{p.accuracy ?? 0}%</span>
                                </div>
                                <div className="metric-block points">
                                    <span className="metric-label">Points</span>
                                    <span className="metric-value">{p.score}</span>
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
