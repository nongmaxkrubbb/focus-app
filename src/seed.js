import { db } from './firebase.js';
import { collection, doc, setDoc } from 'firebase/firestore';

export const PET_DATA = [
    { id: 'tree', name: 'Focus Tree', cost: 0, type: 'plant', description: 'Your faithful starter plant.', icon: '🌱' },
    { id: 'cat', name: 'Sleepy Cat', cost: 50, type: 'animal', description: 'A cute cat that sleeps while you study.', icon: '🐱' },
    { id: 'dog', name: 'Good Boy', cost: 100, type: 'animal', description: 'A loyal companion.', icon: '🐶' },
    { id: 'ghost', name: 'Friendly Ghost', cost: 200, type: 'paranormal', description: 'Spooky but supportive.', icon: '👻' },
];

export const THEME_DATA = [
    { id: 'default', name: 'Aurora Glass', cost: 0, description: 'The clean default aesthetic.' },
    { id: 'starry', name: 'Starry Night', cost: 150, description: 'A relaxing night sky with shooting stars.' },
    { id: 'library', name: 'Cozy Library', cost: 150, description: 'Warm and quiet study environment.' },
    { id: 'cyberpunk', name: 'Cyberpunk Rain', cost: 300, description: 'Futuristic neon rain vibe.' },
];

export const ACHIEVEMENT_DATA = [
    { id: 'focus_beginner', name: 'Focus Beginner', description: 'Complete your first Pomodoro session.', icon: '🌱' },
    { id: 'focus_10h', name: 'Dedicated Scholar', description: 'Reach 10 hours of total focus time.', icon: '🥉' },
    { id: 'focus_50h', name: 'Master of Time', description: 'Reach 50 hours of total focus time.', icon: '🥇' },
    { id: 'streak_3d', name: 'Consistent', description: 'Achieve a 3-day focus streak.', icon: '🔥' },
    { id: 'streak_7d', name: 'Unstoppable', description: 'Achieve a 7-day focus streak.', icon: '🌟' },
    { id: 'wealthy', name: 'Coin Collector', description: 'Accumulate 500 Focus Coins.', icon: '💰' },
    { id: 'pet_lover', name: 'Pet Lover', description: 'Unlock 3 different pets.', icon: '🐾' }
];

export async function seedDatabase() {
    console.log("Seeding database...");

    for (const pet of PET_DATA) {
        await setDoc(doc(db, 'pets', pet.id), pet);
    }
    console.log("Pets seeded");

    for (const theme of THEME_DATA) {
        await setDoc(doc(db, 'themes', theme.id), theme);
    }
    console.log("Themes seeded");

    for (const achievement of ACHIEVEMENT_DATA) {
        await setDoc(doc(db, 'achievements', achievement.id), achievement);
    }
    console.log("Achievements seeded");

    console.log("Seeding complete!");
}
