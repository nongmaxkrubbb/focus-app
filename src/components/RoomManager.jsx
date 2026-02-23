import React, { useState, useEffect, useRef } from 'react';
import { useLevel } from '../contexts/LevelContext';
import { useAuth } from '../contexts/AuthContext';
import { useMusic } from '../contexts/MusicContext';
import { Users, LogIn, PlusCircle, LogOut } from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, setDoc, onSnapshot, serverTimestamp, deleteField, updateDoc } from 'firebase/firestore';

export default function RoomManager() {
    const { currentUser } = useAuth();
    const { level, exp, isFocusing, activeTask } = useLevel();
    const { activeSound, isPlaying, customUrl, broadcastTrigger, applyRemoteSync } = useMusic();
    const [roomId, setRoomId] = useState('');
    const [inRoom, setInRoom] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [localUserId] = useState(() => {
        let id = localStorage.getItem('focus-user-id');
        if (!id || id.startsWith('user_') === false && id.length < 20) {
            // Force reset local id if it was temporarily corrupted or imported wrong
            id = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('focus-user-id', id);
        }
        return id;
    });
    const [localUsername, setLocalUsername] = useState(() => localStorage.getItem('focus-username') || 'Student');
    const presenceUpdateTimeout = useRef(null);

    const myUserId = currentUser ? currentUser.uid : localUserId;
    const username = currentUser && currentUser.displayName ? currentUser.displayName.split(' ')[0] : localUsername;

    useEffect(() => {
        if (!currentUser) localStorage.setItem('focus-username', localUsername);
    }, [localUsername, currentUser]);

    const handleUsernameChange = (e) => {
        if (!currentUser) setLocalUsername(e.target.value);
    };

    useEffect(() => {
        if (!inRoom || !roomId || !db || broadcastTrigger === 0) return;

        const roomRef = doc(db, 'rooms', roomId);
        setDoc(roomRef, {
            sharedMusic: {
                activeSound,
                isPlaying,
                customUrl,
                updatedBy: myUserId
            }
        }, { merge: true }).catch(err => console.error("Error syncing music:", err));

    }, [broadcastTrigger, inRoom, roomId]); // only trigger when broadcastTrigger changes

    useEffect(() => {
        if (!inRoom || !roomId || !db) return;

        // Listen to room updates
        const roomRef = doc(db, 'rooms', roomId);

        const updateMyPresence = async () => {
            try {
                await setDoc(roomRef, {
                    users: {
                        [myUserId]: {
                            username,
                            level,
                            exp,
                            isFocusing,
                            activeTask,
                            lastActive: serverTimestamp()
                        }
                    }
                }, { merge: true });
            } catch (err) {
                console.error("Error updating presence:", err);
            }
        };

        // Debounce updates slightly to prevent spam if many states change at once
        if (presenceUpdateTimeout.current) clearTimeout(presenceUpdateTimeout.current);
        presenceUpdateTimeout.current = setTimeout(() => {
            updateMyPresence();
        }, 500);

        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setRoomData(data);

                // Sync shared music if updated by someone else
                if (data.sharedMusic && data.sharedMusic.updatedBy !== myUserId) {
                    applyRemoteSync(data.sharedMusic);
                }
            } else {
                // Room was closed/deleted
                setInRoom(false);
                setRoomData(null);
            }
        });

        // Clean up presence on unmount/leave
        return () => {
            if (presenceUpdateTimeout.current) clearTimeout(presenceUpdateTimeout.current);
            unsubscribe();
            // Try to remove self, but if the room is gone, it's fine
            setDoc(roomRef, {
                users: {
                    [myUserId]: deleteField()
                }
            }, { merge: true }).catch(e => {
                console.log("Room might have been deleted already:", e.message);
            });
        };
    }, [inRoom, roomId, level, exp, username, myUserId, isFocusing, activeTask]);

    const joinRoom = (e) => {
        e.preventDefault();
        if (!roomId.trim() || !db) {
            if (!db) alert("Please configure Firebase in src/firebase.js first!");
            return;
        }
        setInRoom(true);
    };

    const createRoom = () => {
        if (!db) {
            alert("Please configure Firebase in src/firebase.js first!");
            return;
        }
        const newId = Math.random().toString(36).substr(2, 6).toUpperCase();
        setRoomId(newId);
        setInRoom(true);
    };

    const leaveRoom = () => {
        setInRoom(false);
        setRoomData(null);
        setRoomId('');
    };

    if (!db) {
        return (
            <div className="glass-panel animate-fade-in" style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
                    <Users size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Multiplayer Rooms
                </h2>
                <p style={{ color: 'var(--accent-warning)', fontSize: '0.9rem' }}>
                    Waiting for Firebase configuration.<br />
                    (Check `src/firebase.js`)
                </p>
            </div>
        )
    }

    if (inRoom) {
        const users = roomData?.users ? Object.entries(roomData.users) : [];

        return (
            <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} color="var(--accent-primary)" />
                        Room: {roomId}
                    </h2>
                    <button onClick={leaveRoom} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
                        <LogOut size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {users.map(([id, data]) => (
                        <div key={id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            background: id === myUserId ? 'rgba(129, 140, 248, 0.1)' : 'var(--glass-bg)',
                            borderRadius: 'var(--radius-md)',
                            border: id === myUserId ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <span style={{ fontWeight: id === myUserId ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {data.username} {id === myUserId && '(You)'}
                                    {data.isFocusing && (
                                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'rgba(52, 211, 153, 0.2)', color: 'var(--accent-success)', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
                                            FOCUSING
                                        </span>
                                    )}
                                </span>
                                {data.activeTask && (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                        {data.activeTask}
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-color)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', height: 'fit-content' }}>
                                Lv.{data.level}
                            </span>
                        </div>
                    ))}
                    {users.length === 0 && <span style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>Waiting for room data...</span>}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} color="var(--accent-primary)" />
                Study Rooms
            </h2>

            <input
                type="text"
                className="glass-input"
                placeholder={currentUser ? "Using Google Name" : "Your Nickname"}
                value={username}
                onChange={handleUsernameChange}
                disabled={!!currentUser}
                style={{ marginBottom: '0.5rem', opacity: currentUser ? 0.7 : 1 }}
            />

            <form onSubmit={joinRoom} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    className="glass-input"
                    placeholder="Room Code"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                />
                <button type="submit" className="glass-button" style={{ padding: '0.75rem' }}>
                    <LogIn size={20} />
                </button>
            </form>

            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>OR</div>

            <button className="glass-button" onClick={createRoom} style={{ width: '100%' }}>
                <PlusCircle size={20} /> Create New Room
            </button>
        </div>
    );
}
