import { useState, useEffect } from 'react'
import MovieCard from '../components/MovieCard'

function ExplorePage() {
    const [movies, setMovies] = useState([])
    const [page, setPage] = useState(0)
    const LIMIT = 50

    const loadMore = () => {
        const skip = page * LIMIT
        fetch(`http://localhost:8000/items?skip=${skip}&limit=${LIMIT}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    setMovies(prev => [...prev, ...data])
                    setPage(prev => prev + 1)
                }
            })
    }

    useEffect(() => {
        loadMore() // Initial load
    }, [])

    return (
        <div>
            <h1 className="title" style={{ fontSize: '2rem', marginTop: '2rem' }}>Explore Movies</h1>
            <div className="grid">
                {movies.map(movie => (
                    <MovieCard
                        key={movie.movieId}
                        movie={movie}
                        onClick={() => { }} // No detail view needed for pure explore in this demo
                        onRate={() => { }} // Read only for speed
                    />
                ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                    onClick={loadMore}
                    style={{
                        padding: '1rem 2rem',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--accent)',
                        color: 'white',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    Load More
                </button>
            </div>
        </div>
    )
}

export default ExplorePage
