import React, { useState, useEffect } from 'react';

function OnboardingMsg({ genres, onComplete }) {
    const [selected, setSelected] = useState([]);

    const toggleGenre = (genre) => {
        if (selected.includes(genre)) {
            setSelected(selected.filter(g => g !== genre));
        } else {
            setSelected([...selected, genre]);
        }
    };

    const handleSubmit = () => {
        if (selected.length > 0) {
            onComplete(selected);
        }
    };

    if (!genres || genres.length === 0) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ textAlign: 'center', maxWidth: '500px' }}>
                <h2>Welcome to AI Movie Recommender! 🎬</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    To get started, tell us what you like. We'll solve the "Cold Start" problem for you!
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
                    {genres.map(genre => (
                        <button
                            key={genre}
                            onClick={() => toggleGenre(genre)}
                            style={{
                                background: selected.includes(genre) ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                                border: '1px solid var(--glass-border)',
                                padding: '0.5rem 1rem',
                                borderRadius: '2rem',
                                color: 'white',
                                cursor: 'pointer',
                                transition: '0.2s'
                            }}
                        >
                            {genre}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={selected.length === 0}
                    style={{
                        background: 'linear-gradient(to right, #c084fc, #67e8f9)',
                        border: 'none',
                        padding: '0.8rem 2rem',
                        borderRadius: '0.5rem',
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: selected.length === 0 ? 0.5 : 1
                    }}
                >
                    Get Recommendations
                </button>
            </div>
        </div>
    );
}

export default OnboardingMsg;
