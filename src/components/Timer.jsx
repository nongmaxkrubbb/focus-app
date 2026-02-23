import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Edit2, Check } from 'lucide-react';
import { useLevel } from '../contexts/LevelContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const MODES = {
  POMODORO: { id: 'POMODORO', name: 'Pomodoro', duration: 25 * 60 },
  SHORT_BREAK: { id: 'SHORT_BREAK', name: 'Short Break', duration: 5 * 60 },
  LONG_BREAK: { id: 'LONG_BREAK', name: 'Long Break', duration: 15 * 60 },
};

export default function Timer() {
  const { achievements, unlockAchievement, addExp, addCoins, setIsFocusing } = useLevel();
  const { currentUser } = useAuth();
  const [mode, setMode] = useState(MODES.POMODORO.id);
  const [timeLeft, setTimeLeft] = useState(MODES.POMODORO.duration);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState('');

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Handle timer completion
      setIsActive(false);
      setIsFocusing(false);

      // Award EXP based on time (1 exp per minute)
      const minutesFocused = Math.floor(MODES[mode] ? MODES[mode].duration / 60 : 25);

      // Only award EXP/Coins and save stats if it was an actual focus/pomodoro session, not a break
      if (mode === 'POMODORO') {
        addExp(minutesFocused);
        addCoins(minutesFocused);
        saveSessionToDb(minutesFocused);
        checkAchievements(minutesFocused);
      }

      // Play a sound here (optional)
      const audio = new Audio('/bell.mp3'); // Assuming we have a bell sound
      audio.play().catch(e => console.log('Audio play locked by browser'));
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, addExp, addCoins, setIsFocusing]);

  const saveSessionToDb = async (minutes) => {
    const sessionData = {
      minutes,
      timestamp: new Date().toISOString()
    };

    if (currentUser && db) {
      try {
        await addDoc(collection(db, 'users', currentUser.uid, 'focus_sessions'), {
          minutes,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Error saving session to DB:", error);
        saveToLocal(sessionData);
      }
    } else {
      saveToLocal(sessionData);
    }
  };

  const saveToLocal = (sessionData) => {
    const existing = JSON.parse(localStorage.getItem('focus_sessions_local') || '[]');
    existing.push(sessionData);
    localStorage.setItem('focus_sessions_local', JSON.stringify(existing));
  };

  const checkAchievements = async (newMinutes) => {
    // 1. First session
    if (!achievements?.includes('focus_beginner')) {
      unlockAchievement('focus_beginner');
    }

    // Calculate total time (roughly from local storage for instant feedback, though Firestore is better for cross-device)
    let totalMinutes = newMinutes;
    const existing = JSON.parse(localStorage.getItem('focus_sessions_local') || '[]');
    totalMinutes += existing.reduce((sum, session) => sum + (session.minutes || 0), 0);

    // Convert to hours
    const totalHours = totalMinutes / 60;

    // 2. Time milestones (Requires these IDs to exist in Firestore via Admin Panel)
    if (totalHours >= 10 && !achievements?.includes('focus_10h')) unlockAchievement('focus_10h');
    if (totalHours >= 50 && !achievements?.includes('focus_50h')) unlockAchievement('focus_50h');
  };

  const toggleTimer = () => {
    if (isEditing) handleEditSubmit();
    setIsActive(!isActive);
    setIsFocusing(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsFocusing(false);
    setIsEditing(false);
    setTimeLeft(MODES[mode] ? MODES[mode].duration : 25 * 60);
  };

  const changeMode = (newModeId) => {
    setIsActive(false);
    setIsFocusing(false);
    setIsEditing(false);
    setMode(newModeId);
    setTimeLeft(MODES[newModeId].duration);
  };

  const startEditing = () => {
    if (!isActive) {
      setIsEditing(true);
      setEditMinutes(Math.floor(timeLeft / 60).toString());
    }
  };

  const handleEditSubmit = () => {
    let min = parseInt(editMinutes);
    if (isNaN(min) || min < 1) min = 1;
    setTimeLeft(min * 60);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        {Object.values(MODES).map((m) => (
          <button
            key={m.id}
            className={`glass-button ${mode === m.id && !isEditing ? 'active' : ''}`}
            onClick={() => changeMode(m.id)}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '2rem 0',
        gap: '1rem'
      }}>
        {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="number"
              min="1"
              max="120"
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="glass-input"
              style={{
                fontSize: '5rem',
                fontWeight: '700',
                fontFamily: 'var(--font-display)',
                width: '180px',
                textAlign: 'center',
                padding: '0'
              }}
            />
            <span style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
              min
            </span>
            <button className="glass-button" onClick={handleEditSubmit} style={{ padding: '1rem' }}>
              <Check size={24} color="var(--accent-success)" />
            </button>
          </div>
        ) : (
          <div
            style={{
              fontSize: '6rem',
              fontWeight: '700',
              fontFamily: 'var(--font-display)',
              letterSpacing: '2px',
              textShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: isActive ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'var(--transition)'
            }}
            onClick={startEditing}
            title={isActive ? '' : 'Click to edit time'}
            onMouseOver={(e) => !isActive && (e.currentTarget.style.opacity = '0.8')}
            onMouseOut={(e) => !isActive && (e.currentTarget.style.opacity = '1')}
          >
            {formatTime(timeLeft)}
            {!isActive && <Edit2 size={24} color="var(--text-secondary)" style={{ opacity: 0.5 }} />}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="glass-button" onClick={toggleTimer} style={{ width: '120px' }}>
          {isActive ? (
            <>
              <Pause size={20} /> Pause
            </>
          ) : (
            <>
              <Play size={20} /> Start
            </>
          )}
        </button>
        <button className="glass-button" onClick={resetTimer} title="Reset Timer">
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}
