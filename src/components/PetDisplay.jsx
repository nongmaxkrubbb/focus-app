import React, { useState, useEffect } from 'react';
import { useLevel } from '../contexts/LevelContext';
import { Sprout, TreePine, Trees, Crown } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function PetDisplay() {
    const { level, exp, expNeeded, progressPercentage, selectedPet } = useLevel();
    const [petData, setPetData] = useState([]);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const snap = await getDocs(collection(db, 'pets'));
                setPetData(snap.docs.map(d => ({ ...d.data(), id: d.id })));
            } catch (err) {
                console.error("Error loading pets for display:", err);
            }
        };
        fetchPets();
    }, []);

    const getStageIcon = () => {
        if (selectedPet === 'tree' || !selectedPet) {
            if (level < 5) return <Sprout size={80} color="var(--accent-success)" strokeWidth={1.5} />;
            if (level < 15) return <TreePine size={80} color="var(--accent-success)" strokeWidth={1.5} />;
            if (level < 30) return <Trees size={80} color="var(--accent-primary)" strokeWidth={1.5} />;
            return <Crown size={80} color="var(--accent-warning)" strokeWidth={1.5} />;
        }

        const petInfo = petData.find(p => p.id === selectedPet);
        if (petInfo && petInfo.icon) {
            if (petInfo.icon.startsWith('http')) {
                return <img src={petInfo.icon} alt={petInfo.name} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />;
            }
            return <span style={{ fontSize: '5rem' }}>{petInfo.icon}</span>;
        }

        return <span style={{ fontSize: '5rem' }}>❓</span>;
    };

    const stageName = () => {
        if (selectedPet === 'tree' || !selectedPet) {
            if (level < 5) return "Tiny Seedling";
            if (level < 15) return "Young Pine";
            if (level < 30) return "Mystic Forest";
            return "Focus Master";
        }

        const petInfo = petData.find(p => p.id === selectedPet);
        return petInfo ? petInfo.name : "Loading...";
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '2rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-full)', border: '2px dashed var(--glass-border)', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '150px', height: '150px', animation: 'float 4s ease-in-out infinite' }}>
                {getStageIcon()}
            </div>

            <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '0.2rem' }}>{stageName()}</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Level {level}</span>
            </div>

            <div style={{ width: '100%', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    <span>EXP</span>
                    <span>{exp} / {expNeeded}</span>
                </div>
                <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--glass-border)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progressPercentage}%`,
                        background: 'linear-gradient(90deg, var(--accent-success), var(--accent-primary))',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.5s ease-out'
                    }} />
                </div>
            </div>

            {/* Add keyframes directly for this component's specific animation */}
            <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
        </div>
    );
}
