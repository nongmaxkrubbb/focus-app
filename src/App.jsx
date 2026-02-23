import Timer from './components/Timer';
import TaskList from './components/TaskList';
import AmbientSounds from './components/AmbientSounds';
import PetDisplay from './components/PetDisplay';
import RoomManager from './components/RoomManager';
import AuthManager from './components/AuthManager';
import FocusStats from './components/FocusStats';
import PetShop from './components/PetShop';
import Achievements from './components/Achievements';
import AdminPanel from './components/AdminPanel';
import { BarChart as ChartIcon, ShoppingBag, Award, Settings as SettingsIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LevelProvider } from './contexts/LevelContext';
import { seedDatabase } from './seed.js';
import './index.css';

function App() {
  const [showStats, setShowStats] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // seedDatabase(); // Uncomment to run once, then re-comment
  }, []);

  return (
    <LevelProvider>
      <div className="app-container" style={{ padding: '2rem', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        <header className="app-header animate-fade-in">
          <div className="app-header-title">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '700', margin: '0', background: 'linear-gradient(135deg, var(--text-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Study Focus
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '300', margin: '0' }}>
              Master your time, achieve your goals.
            </p>
          </div>
          <div className="app-header-actions">
            <button
              className={`glass-button ${showAdmin ? 'active' : ''}`}
              onClick={() => { setShowAdmin(!showAdmin); setShowAchievements(false); setShowShop(false); setShowStats(false); }}
              title="Admin Panel"
            >
              <SettingsIcon size={20} />
            </button>
            <button
              className={`glass-button ${showAchievements ? 'active' : ''}`}
              onClick={() => { setShowAchievements(!showAchievements); setShowAdmin(false); setShowShop(false); setShowStats(false); }}
              title="Achievements"
            >
              <Award size={20} />
            </button>
            <button
              className={`glass-button ${showShop ? 'active' : ''}`}
              onClick={() => { setShowShop(!showShop); setShowAdmin(false); setShowAchievements(false); setShowStats(false); }}
              title="Pet Shop"
            >
              <ShoppingBag size={20} />
            </button>
            <button
              className={`glass-button ${showStats ? 'active' : ''}`}
              onClick={() => { setShowStats(!showStats); setShowAdmin(false); setShowShop(false); setShowAchievements(false); }}
              title="View Statistics"
            >
              <ChartIcon size={20} />
            </button>
            <AuthManager />
          </div>
        </header>

        {showStats ? (
          <div style={{ height: '600px' }}>
            <FocusStats onClose={() => setShowStats(false)} />
          </div>
        ) : showShop ? (
          <div style={{ height: '600px' }}>
            <PetShop onClose={() => setShowShop(false)} />
          </div>
        ) : showAchievements ? (
          <div style={{ height: '600px' }}>
            <Achievements onClose={() => setShowAchievements(false)} />
          </div>
        ) : showAdmin ? (
          <div style={{ height: '600px' }}>
            <AdminPanel onClose={() => setShowAdmin(false)} />
          </div>
        ) : (
          <main className="main-grid">
            {/* Column 1: Pet & Timer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <PetDisplay />
              <Timer />
            </div>

            {/* Column 2: Tasks */}
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
              <TaskList />
            </div>

            {/* Column 3: Ambient Sounds & Multiplayer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <AmbientSounds />
              <RoomManager />
            </div>
          </main>
        )}
      </div>
    </LevelProvider>
  );
}

export default App;
