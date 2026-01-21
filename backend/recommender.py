import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import mean_squared_error
from math import sqrt
import os
import random

class RecommenderSystem:
    def __init__(self, movies_path="data/movies.csv", ratings_path="data/ratings.csv"):
        self.movies_path = movies_path
        self.ratings_path = ratings_path
        self.movies = None
        self.ratings = None
        self.user_item_matrix = None
        self.item_similarity_df = None
        
        self.handle_paths()
        self.ensure_large_data() # Logic to generate data if only small exists
        self.load_data()
        self.train_model()
        self.calculate_metrics()

    def handle_paths(self):
        if not os.path.exists(self.movies_path):
             # Try prepending 'backend/' if running from root
            if os.path.exists(os.path.join("backend", self.movies_path)):
                self.movies_path = os.path.join("backend", self.movies_path)
                self.ratings_path = os.path.join("backend", self.ratings_path)
    
    def ensure_large_data(self):
        """Generate synthetic large dataset if it doesn't exist"""
        if os.path.exists(self.movies_path) and os.path.getsize(self.movies_path) > 1024 * 10: # If > 10KB, assumes already large or sufficient
            return

        print("Generating Large Synthetic Dataset (2k movies, 50k ratings)...")
        # Generate Movies
        genres_list = ["Action", "Adventure", "Animation", "Children", "Comedy", "Crime", "Documentary", "Drama", "Fantasy", "Film-Noir", "Horror", "Musical", "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"]
        
        movies_data = []
        for i in range(1, 2001):
            n_genres = random.randint(1, 4)
            movie_genres = "|".join(random.sample(genres_list, n_genres))
            title = f"Movie {i} ({random.randint(1980, 2025)})"
            movies_data.append([i, title, movie_genres])
        
        self.movies = pd.DataFrame(movies_data, columns=["movieId", "title", "genres"])
        
        # Generate Ratings
        ratings_data = []
        user_ids = range(1, 501) # 500 users
        movie_ids = self.movies['movieId'].tolist()
        
        for _ in range(50000): # 50k ratings
            u = random.choice(user_ids)
            m = random.choice(movie_ids)
            r = round(random.uniform(0.5, 5.0) * 2) / 2 # 0.5 step
            ratings_data.append([u, m, r, 964982703])
            
        self.ratings = pd.DataFrame(ratings_data, columns=["userId", "movieId", "rating", "timestamp"])
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.movies_path), exist_ok=True)
        
        self.movies.to_csv(self.movies_path, index=False)
        self.ratings.to_csv(self.ratings_path, index=False)
        print("Large Dataset Generated.")

    def load_data(self):
        # Already loaded in ensure_large_data if generated, else read
        if self.movies is None:
            self.movies = pd.read_csv(self.movies_path)
        if self.ratings is None:
            self.ratings = pd.read_csv(self.ratings_path)

    def train_model(self):
        print("Training Model on Large Data...")
        self.user_item_matrix = self.ratings.pivot_table(
            index='userId', 
            columns='movieId', 
            values='rating'
        ).fillna(0)

        # Optimize: For very large data, use TruncatedSVD or sparse matrices.
        # For 2k movies, cosine_similarity is still fast enough (<10MB matrix)
        item_similarity = cosine_similarity(self.user_item_matrix.T)
        self.item_similarity_df = pd.DataFrame(
            item_similarity, 
            index=self.user_item_matrix.columns, 
            columns=self.user_item_matrix.columns
        )
        print("Model Trained.")

    def calculate_metrics(self):
        # Simplified RMSE on training set for demo
        # (Same implementation as before)
        pred_ratings = self.user_item_matrix.dot(self.item_similarity_df) / self.item_similarity_df.sum(axis=0)
        actual = self.user_item_matrix.values.flatten()
        predicted = pred_ratings.values.flatten()
        mask = actual > 0
        if len(actual[mask]) == 0: return 0
        mse = mean_squared_error(actual[mask], predicted[mask])
        rmse = sqrt(mse)
        print(f"[Model Evaluation] RMSE: {rmse:.4f}")
        return rmse

    def recommend(self, movie_id, n_recommendations=5):
        if movie_id not in self.item_similarity_df.index:
            return []
        sim_scores = self.item_similarity_df[movie_id]
        sorted_scores = sim_scores.sort_values(ascending=False)
        top_similar_ids = sorted_scores.iloc[1:n_recommendations+1].index
        recommendations = self.movies[self.movies['movieId'].isin(top_similar_ids)].copy()
        recommendations['similarity'] = recommendations['movieId'].map(sim_scores)
        return recommendations.sort_values('similarity', ascending=False).to_dict(orient='records')

    def get_popular_movies(self, n=50): # Increased default for pagination needs
        movie_stats = self.ratings.groupby('movieId').agg({'rating': ['mean', 'count']})
        movie_stats.columns = ['avg_rating', 'count']
        # Filter for significant popularity
        popular_ids = movie_stats[movie_stats['count'] >= 5].sort_values('avg_rating', ascending=False).head(n).index
        popular_movies = self.movies[self.movies['movieId'].isin(popular_ids)].copy()
        popular_movies = popular_movies.assign(
            rating=popular_movies['movieId'].map(movie_stats['avg_rating']),
            count=popular_movies['movieId'].map(movie_stats['count'])
        )
        return popular_movies.to_dict(orient='records')

    def split_genres(self):
        genres = set()
        for g_str in self.movies['genres']:
            for g in str(g_str).split('|'):
                genres.add(g)
        return sorted(list(genres))

    def recommend_by_genres(self, selected_genres, n=20):
        # Logic same as before
        mask = self.movies['genres'].apply(lambda x: any(g in str(x).split('|') for g in selected_genres))
        filtered_movies = self.movies[mask]
        movie_stats = self.ratings.groupby('movieId').agg({'rating': 'mean'}).reset_index()
        merged = pd.merge(filtered_movies, movie_stats, on='movieId', how='left').fillna(0)
        return merged.sort_values('rating', ascending=False).head(n).to_dict(orient='records')

    def add_user_rating(self, user_id, movie_id, rating):
        new_row = pd.DataFrame([[user_id, movie_id, rating, 0]], columns=['userId', 'movieId', 'rating', 'timestamp'])
        self.ratings = pd.concat([self.ratings, new_row], ignore_index=True)
        # Avoid full retrain for speed in demo, or limit retrain frequency
        # self.train_model() 
        return True

    def get_all_movies(self, skip=0, limit=50):
        """Paginated Access"""
        return self.movies.iloc[skip : skip + limit].to_dict(orient='records')
