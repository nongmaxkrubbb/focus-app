import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        // Check for redirect errors (optional, but good for debugging)
        getRedirectResult(auth).catch((error) => {
            console.error("Redirect login error:", error);
        });

        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);

            // Sync local storage user ID so RoomManager uses real ID
            if (user) {
                localStorage.setItem('focus-user-id', user.uid);
                if (user.displayName) {
                    localStorage.setItem('focus-username', user.displayName.split(' ')[0]);
                }
            }
        });
        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        if (!auth) {
            alert("Firebase Auth is missing.");
            return;
        }
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Popup login failed:", error);
            // Fallback to redirect if popup is blocked or not supported
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/unauthorized-domain' || error.message.toLowerCase().includes('popup')) {
                try {
                    await signInWithRedirect(auth, googleProvider);
                } catch (redirectError) {
                    console.error("Redirect login also failed:", redirectError);
                    alert("Failed to sign in: " + redirectError.message);
                }
            } else {
                alert("Login Error: " + error.message);
            }
        }
    };

    const logout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const value = {
        currentUser,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
