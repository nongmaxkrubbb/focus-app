import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('focus-theme') || 'default';
    });
    const [unlockedThemes, setUnlockedThemes] = useState(() => {
        const saved = localStorage.getItem('focus-unlocked-themes');
        return saved ? JSON.parse(saved) : ['default'];
    });

    // Apply theme to body
    useEffect(() => {
        document.body.dataset.theme = theme;
        localStorage.setItem('focus-theme', theme);
    }, [theme]);

    // Load from Firestore
    useEffect(() => {
        let isMounted = true;
        if (currentUser) {
            const loadThemeData = async () => {
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const snap = await getDoc(docRef);
                    if (snap.exists() && isMounted) {
                        const data = snap.data();
                        if (data.theme) setTheme(data.theme);
                        if (data.unlockedThemes) setUnlockedThemes(data.unlockedThemes);
                    }
                } catch (err) {
                    console.error("Error loading theme from DB:", err);
                }
            };
            loadThemeData();
        }
        return () => { isMounted = false; };
    }, [currentUser]);

    // Save to Firestore when unlocked themes change
    useEffect(() => {
        localStorage.setItem('focus-unlocked-themes', JSON.stringify(unlockedThemes));
        if (currentUser && db) {
            setDoc(doc(db, 'users', currentUser.uid), {
                theme,
                unlockedThemes
            }, { merge: true }).catch(err => console.error(err));
        }
    }, [unlockedThemes, theme, currentUser]);

    const unlockTheme = (themeId) => {
        setUnlockedThemes(prev => {
            if (prev.includes(themeId)) return prev;
            return [...prev, themeId];
        });
    };

    const value = {
        theme,
        setTheme,
        unlockedThemes,
        unlockTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
