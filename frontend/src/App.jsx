import { useState, useEffect } from 'react'
import MovieCard from './components/MovieCard'
import RecommendationModal from './components/RecommendationModal'
import OnboardingMsg from './components/OnboardingMsg'

function App() {
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('http://localhost:8000/genres')
      .then(res => res.json())
      .then(data => setGenres(data))
      .catch(err => console.error("Error fetching genres:", err))

    fetch('http://localhost:8000/popular?limit=50')
      .then(res => res.json())
      .then(data => setMovies(data))
      .catch(err => console.error("Error fetching movies:", err))
  }, [])

  const handleOnboardingComplete = (selectedGenres) => {
    setLoading(true)
    fetch('http://localhost:8000/recommend/genres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genres: selectedGenres })
    })
      .then(res => res.json())
      .then(data => {
        setMovies(data)
        setShowOnboarding(false)
      })
      .catch(err => console.error("Error on onboarding:", err))
      .finally(() => setLoading(false))
  }

  const handleRate = (movieId, rating) => {
    setMovies(prev => prev.map(m =>
      m.movieId === movieId ? { ...m, userRating: rating } : m
    ))
    fetch('http://localhost:8000/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId, rating })
    })
  }

  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie)
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8000/recommend/${movie.movieId}`)
      if (res.ok) {
        const data = await res.json()
        setRecommendations(data)
      } else {
        setRecommendations([])
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err)
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setSelectedMovie(null)
    setRecommendations([])
  }

  return (
    <>
      <h1 className="title">AI Movie Recommender</h1>

      {showOnboarding && genres.length > 0 && (
        <OnboardingMsg genres={genres} onComplete={handleOnboardingComplete} />
      )}

      <div className="grid">
        {movies.map(movie => (
          <MovieCard
            key={movie.movieId}
            movie={movie}
            onClick={() => handleMovieClick(movie)}
            onRate={handleRate}
          />
        ))}
      </div>

      {selectedMovie && (
        <RecommendationModal
          sourceMovie={selectedMovie}
          recommendations={recommendations}
          loading={loading}
          onClose={closeModal}
        />
      )}
    </>
  )
}

export default App
