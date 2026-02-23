import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { useLevel } from '../contexts/LevelContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function TaskList() {
    const { addExp, setActiveTask } = useLevel();
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('focus-tasks');
        return saved ? JSON.parse(saved) : [];
    });
    const { currentUser } = useAuth();
    const [isLoadedFromDb, setIsLoadedFromDb] = useState(false);
    const [newTask, setNewTask] = useState('');

    // Load tasks from Firestore when user logs in
    useEffect(() => {
        if (currentUser) {
            const loadData = async () => {
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const snap = await getDoc(docRef);
                    if (snap.exists() && snap.data().tasks) {
                        setTasks(snap.data().tasks);
                    }
                } catch (err) {
                    console.error("Error loading tasks:", err);
                } finally {
                    setIsLoadedFromDb(true);
                }
            };
            loadData();
        } else {
            setIsLoadedFromDb(true);
        }
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('focus-tasks', JSON.stringify(tasks));

        // Find the first uncompleted task and set it as active
        const firstActive = tasks.find(t => !t.completed);
        setActiveTask(firstActive ? firstActive.text : '');

        if (currentUser && isLoadedFromDb && db) {
            setDoc(doc(db, 'users', currentUser.uid), { tasks }, { merge: true })
                .catch(e => console.error("Error saving tasks:", e));
        }
    }, [tasks, setActiveTask, currentUser, isLoadedFromDb]);

    const addTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
        setNewTask('');
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => {
            if (t.id === id) {
                if (!t.completed) addExp(5); // Award 5 EXP for checking off a task
                return { ...t, completed: !t.completed };
            }
            return t;
        }));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={24} color="var(--accent-success)" />
                Tasks for Today
            </h2>

            <form onSubmit={addTask} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    className="glass-input"
                    placeholder="What are you working on?"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                />
                <button type="submit" className="glass-button" style={{ padding: '0.75rem' }}>
                    <Plus size={20} />
                </button>
            </form>

            <ul style={{ listStyle: 'none', overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tasks.map(task => (
                    <li
                        key={task.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'var(--glass-bg)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--glass-border)',
                            transition: 'var(--transition)'
                        }}
                    >
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1, opacity: task.completed ? 0.6 : 1 }}
                            onClick={() => toggleTask(task.id)}
                        >
                            {task.completed ? <CheckCircle size={20} color="var(--accent-success)" /> : <Circle size={20} color="var(--text-secondary)" />}
                            <span style={{ textDecoration: task.completed ? 'line-through' : 'none', fontSize: '1.1rem' }}>
                                {task.text}
                            </span>
                        </div>
                        <button
                            onClick={() => deleteTask(task.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', opacity: 0.6, transition: 'var(--transition)' }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                            onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
                        >
                            <Trash2 size={18} />
                        </button>
                    </li>
                ))}
                {tasks.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', fontStyle: 'italic' }}>
                        No tasks yet. Add one above!
                    </div>
                )}
            </ul>
        </div>
    );
}
