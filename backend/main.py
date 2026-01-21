from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

try:
    from backend.recommender import RecommenderSystem
except ImportError:
    from recommender import RecommenderSystem

app = FastAPI(title="AI Recommendation System")

# Initialize Recommender System
rec_system = RecommenderSystem()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RatingRequest(BaseModel):
    movieId: int
    rating: float

class OnboardingRequest(BaseModel):
    genres: List[str]

@app.get("/")
def read_root():
    return {"message": "AI Recommendation System API is running"}

@app.get("/items")
def get_items(skip: int = 0, limit: int = 50):
    return rec_system.get_all_movies(skip, limit)

@app.get("/popular")
def get_popular(limit: int = 20):
    """Cold Start: Get popular movies"""
    # Simply slice the popular list or update method to accept limit
    # The recommender's get_popular_movies returns top N, we can return subset
    pop = rec_system.get_popular_movies(n=limit) # Update recommender to maybe accept n
    return pop

@app.get("/genres")
def get_genres():
    """Get list of available genres"""
    return rec_system.split_genres()

@app.post("/recommend/genres")
def recommend_by_genres(request: OnboardingRequest):
    """Cold Start: Recommend by selected interests"""
    return rec_system.recommend_by_genres(request.genres)

@app.post("/rate")
def rate_movie(request: RatingRequest):
    """User rates a movie"""
    # Using a Mock User ID (999) for the demo session
    success = rec_system.add_user_rating(user_id=999, movie_id=request.movieId, rating=request.rating)
    return {"success": success}

@app.get("/recommend/{item_id}")
def get_recommendations(item_id: int):
    """Item-Based Collaborative Filtering"""
    recommendations = rec_system.recommend(item_id)
    # Return even if empty list, client handles it.
    return recommendations

@app.get("/health")
def health_check():
    return {"status": "ok"}
