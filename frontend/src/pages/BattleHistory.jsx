import React, { useEffect, useState } from "react";
import axios from "../utils/axios";

const BattleHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get("/api/activity?type=real_time_battle");
                const responseData = response.data;
                const rawActivities = responseData.activities || (responseData.data && responseData.data.activities);

                if (rawActivities) {
                    const rawData = rawActivities;
                    let flatHistory = [];
                    // Flatten date grouped activities
                    Object.values(rawData).forEach(acts => {
                        flatHistory = [...flatHistory, ...acts];
                    });
                    
                    // Sort descending by createdAt
                    flatHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setHistory(flatHistory);
                } else {
                    setHistory([]);
                }
            } catch (err) {
                console.error("Error fetching battle history:", err);
                setError("Failed to load battle history.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>Loading Battle History...</div>;
    if (error) return <div style={{ padding: '20px', textAlign: 'center', color: '#ff4d4d' }}>{error}</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                ⚔️ Real-Time Battle History ⚔️
            </h1>
            
            {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '1.2rem', color: '#aaa' }}>You haven't participated in any Real-Time Battles yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {history.map((record) => {
                        const { roomId, quizName, rank, totalPlayers, score, accuracy } = record.data || {};
                        const date = new Date(record.createdAt).toLocaleString();
                        
                        let rankColor = '#fff';
                        if (rank === 1) rankColor = '#ffd700'; // Gold
                        else if (rank === 2) rankColor = '#c0c0c0'; // Silver
                        else if (rank === 3) rankColor = '#cd7f32'; // Bronze

                        return (
                            <div key={record._id} style={{
                                background: 'rgba(20, 20, 30, 0.8)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                padding: '20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                flexWrap: 'wrap',
                                gap: '20px'
                            }}>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: '#4CAF50' }}>{quizName || "Unknown Quiz"}</h3>
                                    <p style={{ margin: '5px 0', color: '#ccc', fontSize: '0.9rem' }}>Room ID: <strong style={{ color: 'white' }}>{roomId || "N/A"}</strong></p>
                                    <p style={{ margin: '5px 0', color: '#888', fontSize: '0.85rem' }}>{date}</p>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase' }}>Accuracy</span>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{accuracy ?? 0}%</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase' }}>Score</span>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{score ?? 0} pts</span>
                                    </div>
                                    <div style={{ 
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', 
                                        justifyContent: 'center', minWidth: '80px',
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '10px', borderRadius: '12px'
                                    }}>
                                        <span style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase' }}>Rank</span>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: rankColor }}>
                                            {rank ? "#" + rank : '-'} <span style={{ fontSize: '1rem', color: '#888' }}>/ {totalPlayers || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default BattleHistory;
