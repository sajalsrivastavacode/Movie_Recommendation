import React from 'react';
import MovieCard from './MovieCard';

function RecommendationModal({ sourceMovie, recommendations, loading, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>Close</button>

                <h2>Because you liked <span style={{ color: 'var(--accent)' }}>{sourceMovie.title}</span></h2>

                {loading ? (
                    <p>Analyzing viewing patterns...</p>
                ) : (
                    <div className="recommendation-section">
                        <h3>We Recommend:</h3>
                        {recommendations.length > 0 ? (
                            <div className="grid" style={{ marginTop: '1rem' }}>
                                {recommendations.map(rec => (
                                    <div key={rec.movieId} className="card" style={{ borderColor: 'var(--accent)' }}>
                                        <div className="card-title">{rec.title}</div>
                                        <div className="card-genres">
                                            <span className="genre-tag" style={{ background: 'var(--accent)' }}>
                                                {(rec.similarity * 100).toFixed(0)}% Match
                                            </span>
                                            {rec.genres.split('|').map(g => (
                                                <span key={g} className="genre-tag">{g}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No sufficiently similar movies found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecommendationModal;
