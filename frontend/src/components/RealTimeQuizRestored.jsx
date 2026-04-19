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
    const [questionState, setQuestionState] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState("");
    const [quizzes, setQuizzes] = useState([]);

    const currentUserId = useMemo(() => user?._id || user?.id, [user]);
    const isHost = room?.hostId && currentUserId && room.hostId === currentUserId;

    useEffect(() => {
        if (!token || !isAdmin) return undefined;
        const s = io(config.BACKEND_URL, { auth: { token }, forceNew: true });
        s.on("room_created", (data) => {
            setRoom(data.room);
            setRoomId(data.roomId);
        });
        s.on("room_joined", (data) => setRoom(data.room));
        s.on("player_joined", (data) => setRoom((prev) => (prev ? { ...prev, players: data.players, playerCount: data.playerCount } : prev)));
        s.on("player_left", (data) => setRoom((prev) => (prev ? { ...prev, players: data.players, playerCount: data.playerCount } : prev)));
        s.on("host_changed", (data) => setRoom((prev) => (prev ? { ...prev, hostId: data.newHostId } : prev)));
        s.on("new_question", (payload) => setQuestionState(payload));
        s.on("question_results", (payload) => setLeaderboard(payload.leaderboard || []));
        s.on("quiz_finished", (payload) => setLeaderboard(payload.leaderboard || []));
        setSocket(s);
        return () => s.disconnect();
    }, [token, isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;
        axios.get("/api/real-time-quiz/active-rooms").then(({ data }) => setRooms(data.rooms || [])).catch(() => setRooms([]));
        axios.get("/api/quizzes").then(({ data }) => setQuizzes(data || [])).catch(() => setQuizzes([]));
    }, [isAdmin]);

    if (!isAdmin) return <Navigate to="/" replace />;

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
        socket.emit("submit_answer", { answer: index, timeSpent: 0 });
    };

    return (
        <div className="rt-restored-page">
            <h1>Admin Suite - Real-Time Battles</h1>

            <div className="rt-card">
                <h2>Join Room ID</h2>
                <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID (e.g. ABC123)" />
                <button type="button" onClick={joinRoom}>Join Room</button>
            </div>

            <div className="rt-card">
                <h2>Create Room</h2>
                <select value={selectedQuizId} onChange={(e) => setSelectedQuizId(e.target.value)}>
                    <option value="">Select quiz</option>
                    {quizzes.map((q) => <option key={q._id} value={q._id}>{q.title}</option>)}
                </select>
                <button type="button" onClick={createRoom}>Create Room</button>
            </div>

            <div className="rt-card">
                <h2>Active Rooms</h2>
                {rooms.map((r) => (
                    <button key={r.id} type="button" onClick={() => setRoomId(r.id)}>
                        {r.id} - {r.quizTitle} ({r.playerCount}/{r.maxPlayers})
                    </button>
                ))}
            </div>

            {room && (
                <div className="rt-card">
                    <h2>Room {room.id}</h2>
                    <p>{room.playerCount} players</p>
                    <ul>{room.players?.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
                    {isHost && <button type="button" onClick={() => socket?.emit("start_quiz")}>Start Quiz</button>}
                </div>
            )}

            {questionState && (
                <div className="rt-card">
                    <h2>{questionState.question?.question}</h2>
                    {questionState.question?.options?.map((option, i) => (
                        <button key={`${option}-${i}`} type="button" onClick={() => submitAnswer(i)}>
                            {String.fromCharCode(65 + i)}. {option}
                        </button>
                    ))}
                </div>
            )}

            {leaderboard.length > 0 && (
                <div className="rt-card">
                    <h2>Leaderboard</h2>
                    <ol>{leaderboard.map((p) => <li key={p.playerId}>{p.playerName} - {p.score}</li>)}</ol>
                </div>
            )}
        </div>
    );
};

export default RealTimeQuizRestored;
