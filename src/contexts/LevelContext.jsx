import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const LevelContext = createContext();

export const useLevel = () => useContext(LevelContext);

export const LevelProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [levelState, setLevelState] = useState(() => {
        const saved = localStorage.getItem('focus-level-state');
        return saved ? JSON.parse(saved) : {
            level: 1,
            exp: 0,
            coins: 0,
            unlockedPets: ['tree'],
            selectedPet: 'tree',
            achievements: []
        };
    });
    const [isFocusing, setIsFocusing] = useState(false);
    const [activeTask, setActiveTask] = useState('');
    const [isLoadedFromDb, setIsLoadedFromDb] = useState(false);

    // Calculate EXP needed for next level (simple curve)
    const expNeeded = Math.floor(100 * Math.pow(1.5, levelState.level - 1));

    // Load from Firestore when user logs in and listen to changes
    useEffect(() => {
        let unsubscribe;

        if (currentUser) {
            const docRef = doc(db, 'users', currentUser.uid);
            // Use onSnapshot to get real-time updates (e.g., from Admin Panel)
            unsubscribe = onSnapshot(docRef, (snap) => {
                if (snap.exists() && snap.data().level) {
                    const data = snap.data();
                    setLevelState(prevState => {
                        // Only update if something actually changed to avoid infinite write loops
                        if (prevState.level === data.level &&
                            prevState.exp === data.exp &&
                            prevState.coins === data.coins &&
                            JSON.stringify(prevState.unlockedPets) === JSON.stringify(data.unlockedPets) &&
                            prevState.selectedPet === data.selectedPet &&
                            JSON.stringify(prevState.achievements) === JSON.stringify(data.achievements)) {
                            return prevState;
                        }

                        return {
                            level: data.level,
                            exp: data.exp || 0,
                            coins: data.coins || 0,
                            unlockedPets: data.unlockedPets || ['tree'],
                            selectedPet: data.selectedPet || 'tree',
                            achievements: data.achievements || []
                        };
                    });
                }
                setIsLoadedFromDb(true);
            }, (err) => {
                console.error("Error listening to level from DB:", err);
                setIsLoadedFromDb(true);
            });
        } else {
            setIsLoadedFromDb(true);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [currentUser]);

    // Save to local storage and Firestore on update
    useEffect(() => {
        localStorage.setItem('focus-level-state', JSON.stringify(levelState));
        if (currentUser && isLoadedFromDb && db) {
            setDoc(doc(db, 'users', currentUser.uid), levelState, { merge: true })
                .catch(e => console.error("Error saving level:", e));
        }
    }, [levelState, currentUser, isLoadedFromDb]);

    const addExp = (amount) => {
        setLevelState((prev) => {
            let newExp = prev.exp + amount;
            let newLevel = prev.level;
            let currentExpNeeded = Math.floor(100 * Math.pow(1.5, newLevel - 1));

            // Handle multiple level ups
            while (newExp >= currentExpNeeded) {
                newExp -= currentExpNeeded;
                newLevel += 1;
                currentExpNeeded = Math.floor(100 * Math.pow(1.5, newLevel - 1));
            }

            return { ...prev, level: newLevel, exp: newExp };
        });
    };

    const addCoins = (amount) => {
        setLevelState(prev => ({ ...prev, coins: (prev.coins || 0) + amount }));
    };

    const unlockPet = (petId) => {
        setLevelState(prev => {
            if (prev.unlockedPets?.includes(petId)) return prev;
            return {
                ...prev,
                unlockedPets: [...(prev.unlockedPets || []), petId]
            };
        });
    };

    const equipPet = (petId) => {
        setLevelState(prev => {
            if (prev.unlockedPets?.includes(petId)) {
                return { ...prev, selectedPet: petId };
            }
            return prev;
        });
    };

    const unlockAchievement = (achievementId) => {
        setLevelState(prev => {
            if (prev.achievements?.includes(achievementId)) return prev;
            return {
                ...prev,
                achievements: [...(prev.achievements || []), achievementId]
            };
        });
    };

    const value = {
        level: levelState.level,
        exp: levelState.exp,
        coins: levelState.coins || 0,
        unlockedPets: levelState.unlockedPets || ['tree'],
        selectedPet: levelState.selectedPet || 'tree',
        achievements: levelState.achievements || [],
        expNeeded,
        addExp,
        addCoins,
        unlockPet,
        equipPet,
        unlockAchievement,
        progressPercentage: Math.min(100, Math.max(0, (levelState.exp / expNeeded) * 100)),
        isFocusing,
        setIsFocusing,
        activeTask,
        setActiveTask
    };

    return (
        <LevelContext.Provider value={value}>
            {children}
        </LevelContext.Provider>
    );
};
