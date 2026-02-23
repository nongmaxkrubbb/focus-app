import React, { useState, useEffect } from 'react';
import { useLevel } from '../contexts/LevelContext';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Achievements({ onClose }) {
    const { achievements } = useLevel();
    const [achievementData, setAchievementData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            setLoading(true);
            try {
                const snap = await getDocs(collection(db, 'achievements'));
                setAchievementData(snap.docs.map(d => ({ ...d.data(), id: d.id })));
            } catch (err) {
                console.error("Error loading achievements:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    // Calculate progress for UI metrics
    const unlockedCount = achievements?.length || 0;
    const totalCount = achievementData.length;
    const progressPerc = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={24} color="var(--accent-warning)" />
                    Achievements
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {unlockedCount} / {totalCount} Unlocked ({progressPerc}%)
                    </div>
                    <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem 1rem' }}>
                        Close
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', overflowY: 'auto', paddingBottom: '1rem' }}>
                {loading ? (
                    <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Loading achievements...</div>
                ) : achievementData.map(badge => {
                    const isUnlocked = achievements?.includes(badge.id);

                    return (
                        <div key={badge.id} className="glass-panel" style={{
                            padding: '1.2rem',
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'center',
                            opacity: isUnlocked ? 1 : 0.6,
                            border: isUnlocked ? '1px solid var(--accent-warning)' : '1px solid var(--glass-border)',
                            background: isUnlocked ? 'rgba(251, 191, 36, 0.05)' : 'var(--glass-bg)',
                            position: 'relative',
                            transition: 'var(--transition)'
                        }}>
                            {!isUnlocked && (
                                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: 'var(--text-secondary)' }}>
                                    <Lock size={14} />
                                </div>
                            )}

                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                background: isUnlocked ? 'var(--bg-color)' : 'rgba(0,0,0,0.2)',
                                filter: isUnlocked ? 'none' : 'grayscale(100%)',
                                flexShrink: 0
                            }}>
                                {badge.icon?.startsWith('http') ? (
                                    <img src={badge.icon} alt={badge.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                ) : (
                                    badge.icon || '🏆'
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '1rem',
                                    margin: '0 0 0.2rem 0',
                                    color: isUnlocked ? 'var(--accent-warning)' : 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem'
                                }}>
                                    {badge.name}
                                    {isUnlocked && <CheckCircle2 size={14} />}
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    {badge.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
