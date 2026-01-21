import React from 'react';

function MovieCard({ movie, onClick, onRate }) {
    const genres = movie.genres.split('|');

    return (
        <div className="card">
            <div onClick={onClick} style={{ cursor: 'pointer' }}>
                <div className="card-title">{movie.title}</div>
                <div className="card-genres">
                    {genres.map(g => (
                        <span key={g} className="genre-tag">{g}</span>
                    ))}
                </div>
            </div>

            {/* Star Rating Section */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rate:</span>
                <div>
                    {[1, 2, 3, 4, 5].map(star => (
                        <span
                            key={star}
                            onClick={(e) => { e.stopPropagation(); onRate(movie.movieId, star); }}
                            style={{
                                cursor: 'pointer',
                                color: (movie.userRating && movie.userRating >= star) ? '#fbbf24' : '#475569',
                                fontSize: '1.2rem',
                                marginRight: '2px'
                            }}
                        >
                            ★
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MovieCard;
