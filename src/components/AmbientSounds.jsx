import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, CloudRain, Coffee, Wind, Headphones } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';

const soundOptions = [
    { id: 'rain', name: 'Rain', icon: CloudRain, src: 'https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' },
    { id: 'cafe', name: 'Cafe', icon: Coffee, src: 'https://actions.google.com/sounds/v1/crowds/restaurant_ambience.ogg' },
    { id: 'waves', name: 'Ocean Waves', icon: Wind, src: 'https://actions.google.com/sounds/v1/water/crashing_waves.ogg' },
    { id: 'lofi', name: 'Relaxing', icon: Headphones, src: 'https://actions.google.com/sounds/v1/ambiences/ambient_hum_and_drone.ogg' },
];

export default function AmbientSounds() {
    const {
        activeSound, isPlaying, customUrl, volume, setVolume,
        toggleSound, submitCustomUrl, setIsPlaying
    } = useMusic();
    const [localUrlInput, setLocalUrlInput] = useState('');
    const audioRef = useRef(null);
    const iframeRef = useRef(null);

    // Sync context customUrl to local input if it changes remotely
    useEffect(() => {
        if (customUrl) setLocalUrlInput(customUrl);
    }, [customUrl]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    // YouTube URL detection regex
    const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const ytId = customUrl ? getYouTubeId(customUrl) : null;
    const isCustom = activeSound === 'custom';

    useEffect(() => {
        if (!audioRef.current || isCustom) return;

        if (isPlaying && activeSound && !isCustom) {
            const sound = soundOptions.find(s => s.id === activeSound);
            if (sound && audioRef.current.src !== sound.src) {
                audioRef.current.src = sound.src;
                audioRef.current.load();
            }
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.error("Audio play failed:", e));
            }
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, activeSound, isCustom]);

    useEffect(() => {
        // Control Custom Player (YouTube iframe or Native audio)
        if (iframeRef.current && isCustom) {
            if (ytId) {
                // Wait a tiny bit for iframe to initialize on first load
                setTimeout(() => {
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                        const action = isPlaying ? 'playVideo' : 'pauseVideo';
                        iframeRef.current.contentWindow.postMessage(JSON.stringify({
                            event: 'command',
                            func: action,
                            args: []
                        }), '*');
                    }
                }, 100);
            } else {
                if (isPlaying) {
                    iframeRef.current.play().catch(e => console.error(e));
                } else {
                    iframeRef.current.pause();
                }
            }
        }
    }, [isPlaying, isCustom, ytId]);

    useEffect(() => {
        // Control volume for Custom Player
        if (iframeRef.current && isCustom) {
            if (ytId) {
                setTimeout(() => {
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                        iframeRef.current.contentWindow.postMessage(JSON.stringify({
                            event: 'command',
                            func: 'setVolume',
                            args: [volume]
                        }), '*');
                    }
                }, 100);
            } else {
                iframeRef.current.volume = volume / 100;
            }
        }
    }, [volume, isCustom, ytId]);

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        const inputUrl = localUrlInput.trim();
        if (!inputUrl) return;

        if (isCustom && inputUrl === customUrl) {
            // If they just hit play again without changing URL, toggle play/pause
            setIsPlaying(!isPlaying);
        } else {
            // Otherwise, set new custom URL
            submitCustomUrl(inputUrl);
            if (audioRef.current) audioRef.current.pause();
        }
    };

    const currentSoundObj = soundOptions.find(s => s.id === activeSound);

    return (
        <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Headphones size={24} color="var(--accent-secondary)" />
                Ambient Sounds
            </h2>

            {/* Hidden Audio Element for preset sounds */}
            {!isCustom && <audio ref={audioRef} loop />}



            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {soundOptions.map((sound) => {
                    const Icon = sound.icon;
                    const isActive = activeSound === sound.id;
                    return (
                        <button
                            key={sound.id}
                            className={`glass-button ${isActive && isPlaying ? 'active' : ''}`}
                            onClick={() => toggleSound(sound.id)}
                            style={{ flexDirection: 'column', padding: '1.5rem', gap: '0.75rem' }}
                        >
                            <Icon size={32} color={isActive && isPlaying ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                            <span style={{ fontSize: '1rem' }}>{sound.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Custom URL Input */}
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <input
                    type="url"
                    className="glass-input"
                    placeholder="Paste YouTube or Audio URL..."
                    value={localUrlInput}
                    onChange={(e) => setLocalUrlInput(e.target.value)}
                    style={{ flex: 1, fontSize: '0.9rem' }}
                />
                <button
                    type="submit"
                    className={`glass-button ${isCustom && isPlaying ? 'active' : ''}`}
                    style={{ padding: '0.5rem 1rem' }}
                >
                    {isCustom && isPlaying ? 'Playing' : 'Play'}
                </button>
            </form>

            {/* Dynamic YouTube / Audio Embed */}
            {isCustom && customUrl && (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginTop: '0.5rem', height: ytId ? '150px' : '50px', opacity: isPlaying ? 1 : 0.6, transition: 'var(--transition)' }}>
                    {ytId ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            {/* Invisible overlay to intercept clicks and toggle state if we strictly want app control, 
                                but letting users click the YT iframe directly is better for UX. */}
                            <iframe
                                ref={iframeRef}
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&autoplay=1&controls=1&loop=1&playlist=${ytId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ background: '#000' }}
                            ></iframe>
                        </div>
                    ) : (
                        <audio ref={iframeRef} src={customUrl} loop controls style={{ width: '100%' }} />
                    )}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)' }}>
                {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    style={{
                        flex: 1,
                        accentColor: 'var(--accent-primary)',
                        background: 'var(--glass-border)',
                        height: '4px',
                        borderRadius: '2px',
                        WebkitAppearance: 'none'
                    }}
                />
                <span style={{ minWidth: '3ch', textAlign: 'right' }}>{volume}%</span>
            </div>
        </div>
    );
}
