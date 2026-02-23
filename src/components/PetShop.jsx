import React, { useState, useEffect } from 'react';
import { useLevel } from '../contexts/LevelContext';
import { useTheme } from '../contexts/ThemeContext';
import { ShoppingBag, Coins, Check, Lock, Sparkles, Image as ImageIcon } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function PetShop({ onClose }) {
    const { coins, unlockedPets, selectedPet, unlockPet, equipPet, addCoins } = useLevel();
    const { theme, setTheme, unlockedThemes, unlockTheme } = useTheme();
    const [shopPets, setShopPets] = useState([]);
    const [shopThemes, setShopThemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShopData = async () => {
            setLoading(true);
            try {
                const petsSnap = await getDocs(collection(db, 'pets'));
                setShopPets(petsSnap.docs.map(d => ({ ...d.data(), id: d.id })));

                const THEMES = [
                    { id: 'default', name: 'Default Dark', description: 'Clean and minimal dark mode.', cost: 0 },
                    { id: 'starry', name: 'Starry Night', description: 'A calm, starry sky for deep focus.', cost: 100 },
                    { id: 'library', name: 'Cozy Library', description: 'Warm wooden tones of an old library.', cost: 150 },
                    { id: 'cyberpunk', name: 'Cyberpunk Rain', description: 'Neon lights and rainy city streets.', cost: 200 },
                    { id: 'songkran', name: 'Songkran Splash', description: 'Refreshing water vibes for the Thai New Year.', cost: 250 },
                    { id: 'loykrathong', name: 'Loy Krathong', description: 'Glowing lanterns floating on a peaceful river.', cost: 300 },
                    { id: 'phitakhon', name: 'Phi Ta Khon', description: 'Vibrant colors of the ghost festival.', cost: 350 }
                ];
                setShopThemes(THEMES);
            } catch (err) {
                console.error("Error loading shop data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchShopData();
    }, []);

    const handleAction = (pet) => {
        if (unlockedPets.includes(pet.id)) {
            equipPet(pet.id);
        } else if (coins >= pet.cost) {
            unlockPet(pet.id);
            addCoins(-pet.cost); // Deduct coins
        }
    };

    const handleThemeAction = (t) => {
        if (unlockedThemes.includes(t.id)) {
            setTheme(t.id);
        } else if (coins >= t.cost) {
            unlockTheme(t.id);
            addCoins(-t.cost); // Deduct coins
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingBag size={24} color="var(--accent-primary)" />
                    Pet Shop
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(250, 204, 21, 0.2)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', color: 'var(--accent-warning)', fontWeight: 'bold' }}>
                        <Coins size={18} />
                        {coins}
                    </div>
                    <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem 1rem' }}>
                        Close
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Loading shop items...</div>
            ) : (
                <div style={{ overflowY: 'auto', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Pets Section */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={20} color="var(--accent-secondary)" /> Companions
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {shopPets.map(pet => {
                                const isUnlocked = unlockedPets.includes(pet.id);
                                const isEquipped = selectedPet === pet.id;
                                const canAfford = coins >= pet.cost;

                                return (
                                    <div key={pet.id} className="glass-panel" style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem',
                                        border: isEquipped ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                        position: 'relative'
                                    }}>
                                        {!isUnlocked && (
                                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-secondary)' }}>
                                                <Lock size={16} />
                                            </div>
                                        )}

                                        <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', fontSize: '3rem' }}>
                                            {pet.icon?.startsWith('http') ? (
                                                <img src={pet.icon} alt={pet.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                pet.icon || '🐾'
                                            )}
                                        </div>

                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.2rem 0' }}>{pet.name}</h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, minHeight: '40px' }}>
                                                {pet.description}
                                            </p>
                                        </div>

                                        <button
                                            className={`glass-button ${isEquipped ? 'active' : ''}`}
                                            onClick={() => handleAction(pet)}
                                            disabled={!isUnlocked && !canAfford}
                                            style={{
                                                marginTop: 'auto',
                                                background: isUnlocked ? (isEquipped ? 'rgba(99, 102, 241, 0.2)' : 'var(--glass-bg)') : (canAfford ? 'rgba(52, 211, 153, 0.2)' : 'var(--bg-color)'),
                                                color: !isUnlocked && !canAfford ? 'var(--text-secondary)' : 'var(--text-primary)'
                                            }}
                                        >
                                            {isEquipped ? (
                                                <><Check size={16} /> Equipped</>
                                            ) : isUnlocked ? (
                                                'Equip'
                                            ) : (
                                                <><Coins size={16} color={canAfford ? "var(--accent-warning)" : "currentColor"} /> {pet.cost}</>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Themes Section */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ImageIcon size={20} color="var(--accent-primary)" /> Background Themes
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {shopThemes.map(t => {
                                const isUnlocked = unlockedThemes.includes(t.id);
                                const isEquipped = theme === t.id;
                                const canAfford = coins >= t.cost;

                                return (
                                    <div key={t.id} className="glass-panel" style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem',
                                        border: isEquipped ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                        position: 'relative',
                                        background: t.id === 'starry' ? 'linear-gradient(135deg, #0b0f19, #1e1b4b)' :
                                            t.id === 'library' ? 'linear-gradient(135deg, #2c1e16, #432818)' :
                                                t.id === 'cyberpunk' ? 'linear-gradient(135deg, #09090b, #4c1d95)' :
                                                    t.id === 'songkran' ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' :
                                                        t.id === 'loykrathong' ? 'linear-gradient(135deg, #1e1b4b, #b45309)' :
                                                            t.id === 'phitakhon' ? 'linear-gradient(135deg, #dc2626, #fbbf24)' :
                                                                'var(--glass-bg)'
                                    }}>
                                        {!isUnlocked && (
                                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-secondary)' }}>
                                                <Lock size={16} />
                                            </div>
                                        )}

                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.2rem 0' }}>{t.name}</h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, minHeight: '40px' }}>
                                                {t.description}
                                            </p>
                                        </div>

                                        <button
                                            className={`glass-button ${isEquipped ? 'active' : ''}`}
                                            onClick={() => handleThemeAction(t)}
                                            disabled={!isUnlocked && !canAfford}
                                            style={{
                                                marginTop: 'auto',
                                                background: isUnlocked ? (isEquipped ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)') : (canAfford ? 'rgba(52, 211, 153, 0.2)' : 'rgba(0,0,0,0.2)'),
                                                color: !isUnlocked && !canAfford ? 'var(--text-secondary)' : 'var(--text-primary)'
                                            }}
                                        >
                                            {isEquipped ? (
                                                <><Check size={16} /> Equipped</>
                                            ) : isUnlocked ? (
                                                'Equip'
                                            ) : (
                                                <><Coins size={16} color={canAfford ? "var(--accent-warning)" : "currentColor"} /> {t.cost}</>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            )
            }
        </div >
    );
}
