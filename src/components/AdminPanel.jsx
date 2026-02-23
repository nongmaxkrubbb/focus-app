import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Settings, Plus, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import AdminRoute from './AdminRoute';

export default function AdminPanel({ onClose }) {
    const [activeTab, setActiveTab] = useState('pets');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state for creating/editing
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        cost: 0,
        type: 'animal', // For pets
        icon: '', // Emoji or Image URL
        coins: 0, // For users
        exp: 0,   // For users
        level: 1  // For users
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchItems(activeTab);
    }, [activeTab]);

    const fetchItems = async (collectionName) => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            const fetchedItems = [];
            querySnapshot.forEach((doc) => {
                fetchedItems.push({ ...doc.data(), id: doc.id });
            });
            setItems(fetchedItems);
        } catch (error) {
            console.error(`Error fetching ${collectionName}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        resetForm();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'cost' || name === 'coins' || name === 'exp' || name === 'level') ? parseInt(value) || 0 : value
        }));
    };

    const handleEdit = (item) => {
        setFormData(item);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Are you sure you want to delete ${id}?`)) {
            try {
                await deleteDoc(doc(db, activeTab, id));
                setItems(items.filter(item => item.id !== id));
            } catch (error) {
                console.error("Error deleting document: ", error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.id) return alert("ID is required");
        if (activeTab !== 'users' && !formData.name) return alert("Name is required");

        try {
            // Clean up unwanted fields based on tab
            const dataToSave = { ...formData };
            if (activeTab === 'achievements') {
                delete dataToSave.type;
                delete dataToSave.cost;
                delete dataToSave.coins;
                delete dataToSave.exp;
                delete dataToSave.level;
            } else if (activeTab === 'pets') {
                delete dataToSave.coins;
                delete dataToSave.exp;
                delete dataToSave.level;
            } else if (activeTab === 'users') {
                // For users, we only want to update specific fields, not overwrite the whole doc
                // But setDoc with merge: true handles this.
                delete dataToSave.cost;
                delete dataToSave.type;
                delete dataToSave.icon;
                delete dataToSave.name;
                delete dataToSave.description;
            }

            // Save to Firestore (replaces if exists, merge for users)
            await setDoc(doc(db, activeTab, formData.id), dataToSave, { merge: activeTab === 'users' });

            alert(`Saved ${formData.id} successfully!`);
            fetchItems(activeTab); // Refresh list
            resetForm();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error saving. See console.");
        }
    };

    const resetForm = () => {
        setFormData({
            id: '', name: '', description: '', cost: 0, type: 'animal', icon: '', coins: 0, exp: 0, level: 1
        });
        setIsEditing(false);
    };

    return (
        <AdminRoute>
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                        <Settings size={24} color="var(--accent-primary)" />
                        Admin Panel
                    </h2>
                    <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem 1rem' }}>
                        Close
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    {['pets', 'achievements', 'users'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                fontSize: '1.1rem',
                                fontWeight: activeTab === tab ? 'bold' : 'normal',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                padding: '0.5rem 1rem',
                                borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flex: 1, overflow: 'hidden' }}>

                    {/* List/Table View */}
                    <div style={{ background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', padding: '1rem', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>Existing {activeTab}</h3>

                        {loading ? (
                            <p style={{ color: 'var(--text-secondary)' }}>Loading data...</p>
                        ) : items.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>No items found in this collection.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {items.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                                {activeTab === 'users' ? `User: ${item.id}` : `${item.name} `}
                                                {activeTab !== 'users' && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({item.id})</span>}
                                            </div>
                                            {activeTab === 'pets' && <div style={{ fontSize: '0.8rem', color: 'var(--accent-warning)' }}>Cost: {item.cost}</div>}
                                            {activeTab === 'users' && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Level: {item.level || 1} | Coins: {item.coins || 0}</div>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleEdit(item)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent-secondary)' }} title="Edit">
                                                <Settings size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent-error)' }} title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Editor Form */}
                    <div style={{ background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', padding: '1.5rem', overflowY: 'auto', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            {isEditing ? <><Settings size={20} /> Edit Item</> : <><Plus size={20} /> Add New Item</>}
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {activeTab === 'users' ? 'User ID (UID)' : 'ID (Unique identifier, no spaces)'}
                                </label>
                                <input
                                    className="glass-input"
                                    name="id"
                                    value={formData.id}
                                    onChange={handleInputChange}
                                    disabled={activeTab === 'users'} // Prevent editing user ID, only edit existing
                                    required
                                    style={{ color: 'var(--text-primary)', opacity: (activeTab === 'users') ? 0.7 : 1 }}
                                />
                            </div>

                            {activeTab !== 'users' && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Display Name</label>
                                        <input className="glass-input" name="name" value={formData.name || ''} onChange={handleInputChange} required={activeTab !== 'users'} style={{ color: 'var(--text-primary)' }} />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description</label>
                                        <textarea className="glass-input" name="description" value={formData.description || ''} onChange={handleInputChange} rows="3" style={{ color: 'var(--text-primary)' }} />
                                    </div>
                                </>
                            )}

                            {activeTab === 'pets' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cost (Coins/EXP)</label>
                                    <input className="glass-input" type="number" name="cost" value={formData.cost} onChange={handleInputChange} min="0" style={{ color: 'var(--text-primary)' }} />
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Coins</label>
                                        <input className="glass-input" type="number" name="coins" value={formData.coins} onChange={handleInputChange} min="0" style={{ color: 'var(--text-primary)' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Level</label>
                                        <input className="glass-input" type="number" name="level" value={formData.level} onChange={handleInputChange} min="1" style={{ color: 'var(--text-primary)' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>EXP</label>
                                        <input className="glass-input" type="number" name="exp" value={formData.exp} onChange={handleInputChange} min="0" style={{ color: 'var(--text-primary)' }} />
                                    </div>
                                </>
                            )}

                            {(activeTab === 'pets' || activeTab === 'achievements') && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        Icon / Image URL (Emojis or HTTP link)
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input className="glass-input" name="icon" value={formData.icon} onChange={handleInputChange} placeholder="e.g. 🐶 or https://imgur.com/...png" style={{ flex: 1, color: 'var(--text-primary)' }} />
                                        {formData.icon && formData.icon.startsWith('http') && (
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img src={formData.icon} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '🚫'; }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="glass-button" style={{ flex: 1, background: 'rgba(52, 211, 153, 0.2)', color: 'var(--text-primary)', border: '1px solid var(--accent-success)' }}>
                                    <Save size={18} /> {isEditing ? 'Update Item' : 'Create Item'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={resetForm} className="glass-button" style={{ width: '50px' }} title="Cancel Edit">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </AdminRoute>
    );
}
