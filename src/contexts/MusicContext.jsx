import React, { createContext, useContext, useState } from 'react';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
    const [activeSound, setActiveSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [customUrl, setCustomUrl] = useState('');
    const [volume, setVolume] = useState(50);

    // Increment this state when local changes occur to inform RoomManager to broadcast
    const [broadcastTrigger, setBroadcastTrigger] = useState(0);

    const toggleSound = (id) => {
        if (activeSound === id) {
            setIsPlaying(!isPlaying);
        } else {
            setActiveSound(id);
            setIsPlaying(true);
        }
        setBroadcastTrigger(prev => prev + 1);
    };

    const submitCustomUrl = (url) => {
        if (url.trim()) {
            setCustomUrl(url);
            setActiveSound('custom');
            setIsPlaying(true);
            setBroadcastTrigger(prev => prev + 1);
        }
    };

    const applyRemoteSync = (data) => {
        if (!data) return;
        // Only update if it's different to avoid re-rendering loops
        if (data.activeSound !== undefined) setActiveSound(data.activeSound);
        if (data.isPlaying !== undefined) setIsPlaying(data.isPlaying);
        if (data.customUrl !== undefined) setCustomUrl(data.customUrl);
    };

    return (
        <MusicContext.Provider value={{
            activeSound, isPlaying, customUrl, volume, setVolume,
            toggleSound, submitCustomUrl, applyRemoteSync,
            broadcastTrigger, setIsPlaying
        }}>
            {children}
        </MusicContext.Provider>
    );
};
