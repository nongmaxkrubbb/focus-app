import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, BarChart as ChartIcon, Trophy } from 'lucide-react';

export default function FocusStats({ onClose }) {
    const { currentUser } = useAuth();
    const [data, setData] = useState([]);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);

            // Initialize last 7 days structure
            const last7Days = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                last7Days.push({
                    date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    dateObj: d,
                    minutes: 0
                });
            }

            let loadedMinutes = 0;

            if (currentUser && db) {
                try {
                    // Get data from 7 days ago onwards
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

                    const q = query(
                        collection(db, 'users', currentUser.uid, 'focus_sessions'),
                        where('timestamp', '>=', sevenDaysAgo)
                    );

                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach((doc) => {
                        const session = doc.data();
                        const sessionDate = session.timestamp?.toDate() || new Date();
                        sessionDate.setHours(0, 0, 0, 0);

                        // Find corresponding day in last7Days
                        const dayRecord = last7Days.find(d => d.dateObj.getTime() === sessionDate.getTime());
                        if (dayRecord) {
                            dayRecord.minutes += session.minutes;
                            loadedMinutes += session.minutes;
                        }
                    });
                } catch (error) {
                    console.error("Error fetching stats from Firestore:", error);
                }
            } else {
                // Fallback to local storage
                const localSessions = JSON.parse(localStorage.getItem('focus_sessions_local') || '[]');
                localSessions.forEach(session => {
                    const sessionDate = new Date(session.timestamp);
                    sessionDate.setHours(0, 0, 0, 0);
                    const dayRecord = last7Days.find(d => d.dateObj.getTime() === sessionDate.getTime());
                    if (dayRecord) {
                        dayRecord.minutes += session.minutes;
                        loadedMinutes += session.minutes;
                    }
                });
            }

            setTotalMinutes(loadedMinutes);
            setData(last7Days);
            setLoading(false);
        };

        fetchStats();
    }, [currentUser]);

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ChartIcon size={24} color="var(--accent-primary)" />
                    Focus Statistics
                </h2>
                <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem 1rem' }}>
                    Close
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Focus Time (7 Days)</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy size={20} color="var(--accent-warning)" />
                        {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                    </p>
                </div>
            </div>

            <div style={{ flex: 1, minHeight: '300px', width: '100%' }}>
                {loading ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading stats...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}m`} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                            />
                            <Bar dataKey="minutes" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
