/**
 * TMDBService - Enrichissement des métadonnées avec TMDB (The Movie Database)
 * API gratuite avec 1000 requêtes/jour
 * Documentation: https://developers.themoviedb.org/3
 */

import { EnrichedMovie, EnrichedSeries } from './CategoryService';

// Clé API TMDB gratuite (à remplacer par votre propre clé)
// Créez un compte sur https://www.themoviedb.org/settings/api
const TMDB_API_KEY = ''; // Laissez vide pour désactiver TMDB

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export interface TMDBMovieDetails {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  genres: { id: number; name: string }[];
  voteAverage: number;
  voteCount: number;
  runtime: number;
  popularity: number;
  originalLanguage: string;
  adult: boolean;
}

export interface TMDBSeriesDetails {
  id: number;
  name: string;
  originalName: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: string;
  genres: { id: number; name: string }[];
  voteAverage: number;
  voteCount: number;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  popularity: number;
  status: string;
  originalLanguage: string;
}

class TMDBService {
  private cache = new Map<string, any>();
  private requestQueue: Promise<any>[] = [];
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 250; // 4 requêtes/seconde max

  /**
   * Vérifie si TMDB est activé
   */
  isEnabled(): boolean {
    return TMDB_API_KEY !== '';
  }

  /**
   * Rate limiting - Respect TMDB API limits
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise<void>(resolve => 
        setTimeout(() => resolve(), this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Recherche un film sur TMDB
   */
  async searchMovie(title: string, year?: string): Promise<TMDBMovieDetails | null> {
    if (!this.isEnabled()) return null;

    const cacheKey = `movie:${title}:${year || ''}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      await this.rateLimit();

      const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        query: title,
        language: 'fr-FR',
        include_adult: 'false',
      });

      if (year) {
        params.append('year', year);
      }

      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?${params.toString()}`
      );

      if (!response.ok) {
        console.warn(`TMDB search failed for "${title}": ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const movie = data.results[0];
        const details: TMDBMovieDetails = {
          id: movie.id,
          title: movie.title,
          originalTitle: movie.original_title,
          overview: movie.overview,
          posterPath: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
          backdropPath: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : null,
          releaseDate: movie.release_date,
          genres: movie.genre_ids?.map((id: number) => ({ id, name: this.getGenreName(id, 'movie') })) || [],
          voteAverage: movie.vote_average,
          voteCount: movie.vote_count,
          runtime: 0, // Nécessite un appel séparé
          popularity: movie.popularity,
          originalLanguage: movie.original_language,
          adult: movie.adult,
        };

        this.cache.set(cacheKey, details);
        return details;
      }

      return null;
    } catch (error) {
      console.error(`TMDB search error for "${title}":`, error);
      return null;
    }
  }

  /**
   * Recherche une série sur TMDB
   */
  async searchSeries(title: string, year?: string): Promise<TMDBSeriesDetails | null> {
    if (!this.isEnabled()) return null;

    const cacheKey = `series:${title}:${year || ''}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      await this.rateLimit();

      const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        query: title,
        language: 'fr-FR',
        include_adult: 'false',
      });

      if (year) {
        params.append('first_air_date_year', year);
      }

      const response = await fetch(
        `${TMDB_BASE_URL}/search/tv?${params.toString()}`
      );

      if (!response.ok) {
        console.warn(`TMDB search failed for "${title}": ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const series = data.results[0];
        const details: TMDBSeriesDetails = {
          id: series.id,
          name: series.name,
          originalName: series.original_name,
          overview: series.overview,
          posterPath: series.poster_path ? `${TMDB_IMAGE_BASE}${series.poster_path}` : null,
          backdropPath: series.backdrop_path ? `${TMDB_IMAGE_BASE}${series.backdrop_path}` : null,
          firstAirDate: series.first_air_date,
          genres: series.genre_ids?.map((id: number) => ({ id, name: this.getGenreName(id, 'tv') })) || [],
          voteAverage: series.vote_average,
          voteCount: series.vote_count,
          numberOfSeasons: 0, // Nécessite un appel séparé
          numberOfEpisodes: 0,
          popularity: series.popularity,
          status: '',
          originalLanguage: series.original_language,
        };

        this.cache.set(cacheKey, details);
        return details;
      }

      return null;
    } catch (error) {
      console.error(`TMDB search error for "${title}":`, error);
      return null;
    }
  }

  /**
   * Enrichit un film avec les données TMDB
   */
  async enrichMovie(movie: EnrichedMovie): Promise<EnrichedMovie> {
    if (!this.isEnabled()) return movie;

    try {
      const year = movie.year ? movie.year.substring(0, 4) : undefined;
      const tmdbData = await this.searchMovie(movie.cleanName, year);

      if (tmdbData) {
        return {
          ...movie,
          plot: movie.plot || tmdbData.overview,
          cover: movie.cover || tmdbData.posterPath || undefined,
          rating: tmdbData.voteAverage.toString(),
          imdbRating: tmdbData.voteAverage,
          genres: tmdbData.genres.map(g => g.name),
          popularity: tmdbData.popularity,
        };
      }

      return movie;
    } catch (error) {
      console.error('Error enriching movie:', error);
      return movie;
    }
  }

  /**
   * Enrichit une série avec les données TMDB
   */
  async enrichSeries(series: EnrichedSeries): Promise<EnrichedSeries> {
    if (!this.isEnabled()) return series;

    try {
      const year = series.year ? series.year.substring(0, 4) : undefined;
      const tmdbData = await this.searchSeries(series.cleanName, year);

      if (tmdbData) {
        return {
          ...series,
          plot: series.plot || tmdbData.overview,
          cover: series.cover || tmdbData.posterPath || undefined,
          rating: tmdbData.voteAverage.toString(),
          imdbRating: tmdbData.voteAverage,
          genres: tmdbData.genres.map(g => g.name),
          popularity: tmdbData.popularity,
          status: tmdbData.status === 'Ended' ? 'Terminée' : 'En cours',
        };
      }

      return series;
    } catch (error) {
      console.error('Error enriching series:', error);
      return series;
    }
  }

  /**
   * Enrichit un lot de films (par petits lots pour éviter le rate limiting)
   */
  async enrichMovies(movies: EnrichedMovie[], batchSize: number = 10): Promise<EnrichedMovie[]> {
    if (!this.isEnabled()) return movies;

    const enriched: EnrichedMovie[] = [];
    
    for (let i = 0; i < movies.length; i += batchSize) {
      const batch = movies.slice(i, i + batchSize);
      const enrichedBatch = await Promise.all(
        batch.map(movie => this.enrichMovie(movie))
      );
      enriched.push(...enrichedBatch);
      
      console.log(`📊 Enriched ${enriched.length}/${movies.length} movies`);
    }

    return enriched;
  }

  /**
   * Enrichit un lot de séries
   */
  async enrichSeriesList(series: EnrichedSeries[], batchSize: number = 10): Promise<EnrichedSeries[]> {
    if (!this.isEnabled()) return series;

    const enriched: EnrichedSeries[] = [];
    
    for (let i = 0; i < series.length; i += batchSize) {
      const batch = series.slice(i, i + batchSize);
      const enrichedBatch = await Promise.all(
        batch.map(s => this.enrichSeries(s))
      );
      enriched.push(...enrichedBatch);
      
      console.log(`📊 Enriched ${enriched.length}/${series.length} series`);
    }

    return enriched;
  }

  /**
   * Convertit un ID de genre TMDB en nom
   */
  private getGenreName(id: number, type: 'movie' | 'tv'): string {
    const movieGenres: { [key: number]: string } = {
      28: 'Action', 12: 'Aventure', 16: 'Animation', 35: 'Comédie',
      80: 'Policier', 99: 'Documentaire', 18: 'Drame', 10751: 'Famille',
      14: 'Fantastique', 36: 'Histoire', 27: 'Horreur', 10402: 'Musique',
      9648: 'Mystère', 10749: 'Romance', 878: 'Science-Fiction',
      10770: 'Téléfilm', 53: 'Thriller', 10752: 'Guerre', 37: 'Western',
    };

    const tvGenres: { [key: number]: string } = {
      10759: 'Action & Aventure', 16: 'Animation', 35: 'Comédie',
      80: 'Policier', 99: 'Documentaire', 18: 'Drame', 10751: 'Famille',
      10762: 'Jeunesse', 9648: 'Mystère', 10763: 'Actualités',
      10764: 'Télé-réalité', 10765: 'Science-Fiction & Fantastique',
      10766: 'Feuilleton', 10767: 'Talk', 10768: 'Guerre & Politique',
      37: 'Western',
    };

    const genres = type === 'movie' ? movieGenres : tvGenres;
    return genres[id] || 'Autre';
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const tmdbService = new TMDBService();
