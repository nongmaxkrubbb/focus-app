import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';

export default function AuthManager() {
    const { currentUser, loginWithGoogle, logout } = useAuth();

    return (
        <div className="auth-manager-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {currentUser.photoURL ? (
                        <img
                            src={currentUser.photoURL}
                            alt="Profile"
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <User size={20} color="var(--text-secondary)" />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{currentUser.displayName || 'Focus User'}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="glass-button"
                        style={{ padding: '0.5rem', background: 'var(--glass-bg)', color: 'var(--text-secondary)' }}
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            ) : (
                <button
                    onClick={loginWithGoogle}
                    className="glass-button"
                    style={{ padding: '0.5rem 1rem', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--accent-success)', borderColor: 'rgba(52, 211, 153, 0.3)' }}
                >
                    <LogIn size={16} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Sign In</span>
                </button>
            )}
        </div>
    );
}
