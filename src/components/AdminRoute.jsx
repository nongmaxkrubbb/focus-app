import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';

export default function AdminRoute({ children }) {
    const { currentUser } = useAuth();

    // ⬇️ ADD NEW ADMIN EMAILS TO THIS LIST ⬇️
    const ADMIN_EMAILS = [
        'thiphythiwaxinthchoti@gmail.com',       // Default placeholder
        'maekhmay09@gmail.com',     // Your email
        // 'another_admin@gmail.com' // Example of adding a 3rd admin
    ];

    // Check if user is logged in AND their email is in the admin list
    const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);

    if (!isAdmin) {
        return (
            <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px', margin: '10vh auto' }}>
                <Lock size={48} color="var(--accent-warning)" style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Access Denied</h2>
                <p style={{ color: 'var(--text-secondary)' }}>You do not have permission to view the Admin Panel.</p>
                <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Current User: {currentUser?.email || 'Not logged in'}
                </div>
            </div>
        );
    }

    return children;
}
