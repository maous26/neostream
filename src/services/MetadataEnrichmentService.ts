/**
 * MetadataEnrichmentService
 * 
 * Service pour enrichir les métadonnées des films et séries avec des informations
 * provenant de TMDB (The Movie Database) ou d'autres sources.
 * 
 * Fonctionnalités:
 * - Recherche de films/séries par nom
 * - Récupération d'affiches haute qualité
 * - Genres détaillés
 * - Synopsis complets
 * - Notes IMDb/TMDB
 * - Casting et équipe
 * - Bandes-annonces
 * 
 * Basé sur les meilleures pratiques IPTV pour enrichir le contenu VOD
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EnrichedMetadata {
  // Métadonnées de base
  title: string;
  originalTitle?: string;
  overview?: string;
  tagline?: string;
  
  // Visuels
  posterPath?: string;
  backdropPath?: string;
  posterUrl?: string;
  backdropUrl?: string;
  
  // Informations
  genres?: string[];
  releaseDate?: string;
  runtime?: number;
  voteAverage?: number;
  voteCount?: number;
  popularity?: number;
  
  // Casting
  cast?: Array<{
    name: string;
    character: string;
    profilePath?: string;
  }>;
  
  director?: string;
  
  // Vidéos (bandes-annonces)
  trailerUrl?: string;
  
  // Métadonnées supplémentaires
  imdbId?: string;
  tmdbId?: number;
  status?: string;
  originalLanguage?: string;
  
  // Pour les séries
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  episodeRunTime?: number[];
  firstAirDate?: string;
  lastAirDate?: string;
  inProduction?: boolean;
}

interface TMDBConfig {
  images: {
    base_url: string;
    poster_sizes: string[];
    backdrop_sizes: string[];
  };
}

class MetadataEnrichmentService {
  private static readonly TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // À remplacer par une vraie clé
  private static readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  private static readonly CACHE_PREFIX = '@metadata_cache:';
  private static readonly CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 jours
  
  private static config: TMDBConfig | null = null;
  private static readonly IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
  
  /**
   * Initialise la configuration TMDB
   */
  private static async getConfig(): Promise<TMDBConfig> {
    if (this.config) return this.config;
    
    try {
      const response = await fetch(
        `${this.TMDB_BASE_URL}/configuration?api_key=${this.TMDB_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get TMDB configuration');
      }
      
      this.config = await response.json();
      return this.config!;
    } catch (error) {
      console.error('❌ Failed to get TMDB config:', error);
      // Configuration par défaut
      return {
        images: {
          base_url: this.IMAGE_BASE_URL,
          poster_sizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
          backdrop_sizes: ['w300', 'w780', 'w1280', 'original'],
        },
      };
    }
  }
  
  /**
   * Construit l'URL complète d'une image
   */
  private static getImageUrl(path: string | undefined, size: 'poster' | 'backdrop' = 'poster'): string | undefined {
    if (!path) return undefined;
    
    const sizeMap = {
      poster: 'w500',
      backdrop: 'w1280',
    };
    
    return `${this.IMAGE_BASE_URL}${sizeMap[size]}${path}`;
  }
  
  /**
   * Nettoie le nom d'un film/série pour la recherche
   * Retire les préfixes, suffixes et informations parasites
   */
  private static cleanTitle(title: string): string {
    return title
      // Retirer les préfixes de pays
      .replace(/^(FR|US|UK|ES|IT|DE|AR|BR|MX|CA)[\s:|-]/gi, '')
      // Retirer les marqueurs de qualité
      .replace(/\b(HD|4K|UHD|HEVC|H\.?264|H\.?265|x264|x265|BluRay|WEB-?DL|DVDRip)\b/gi, '')
      // Retirer les années entre parenthèses ou crochets
      .replace(/[\[\(]\d{4}[\]\)]/g, '')
      // Retirer les informations de saison/épisode
      .replace(/S\d{1,2}E\d{1,2}/gi, '')
      // Retirer les caractères spéciaux multiples
      .replace(/[._-]+/g, ' ')
      // Nettoyer les espaces
      .trim()
      .replace(/\s+/g, ' ');
  }
  
  /**
   * Extrait l'année d'un titre si présente
   */
  private static extractYear(title: string): number | undefined {
    const yearMatch = title.match(/[\[\(]?(\d{4})[\]\)]?/);
    return yearMatch ? parseInt(yearMatch[1], 10) : undefined;
  }
  
  /**
   * Recherche un film sur TMDB
   */
  static async searchMovie(title: string, year?: number): Promise<EnrichedMetadata | null> {
    try {
      // Vérifier le cache d'abord
      const cacheKey = `${this.CACHE_PREFIX}movie:${title}:${year || 'any'}`;
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        console.log(`📦 Loaded movie metadata from cache: ${title}`);
        return cached;
      }
      
      const cleanedTitle = this.cleanTitle(title);
      const extractedYear = year || this.extractYear(title);
      
      console.log(`🔍 Searching TMDB for movie: "${cleanedTitle}" (${extractedYear || 'any year'})`);
      
      let url = `${this.TMDB_BASE_URL}/search/movie?api_key=${this.TMDB_API_KEY}&query=${encodeURIComponent(cleanedTitle)}&language=fr-FR`;
      if (extractedYear) {
        url += `&year=${extractedYear}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log(`⚠️ No results found for: ${cleanedTitle}`);
        return null;
      }
      
      // Prendre le premier résultat (le plus pertinent)
      const movie = data.results[0];
      
      // Récupérer les détails complets
      const details = await this.getMovieDetails(movie.id);
      
      // Sauvegarder dans le cache
      await this.saveToCache(cacheKey, details);
      
      return details;
      
    } catch (error) {
      console.error(`❌ Error searching movie "${title}":`, error);
      return null;
    }
  }
  
  /**
   * Récupère les détails complets d'un film
   */
  private static async getMovieDetails(movieId: number): Promise<EnrichedMetadata> {
    try {
      const url = `${this.TMDB_BASE_URL}/movie/${movieId}?api_key=${this.TMDB_API_KEY}&language=fr-FR&append_to_response=credits,videos`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const movie = await response.json();
      
      // Trouver le réalisateur
      const director = movie.credits?.crew?.find((person: any) => person.job === 'Director')?.name;
      
      // Extraire le trailer YouTube
      const trailerVideo = movie.videos?.results?.find(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      const trailerUrl = trailerVideo ? `https://www.youtube.com/watch?v=${trailerVideo.key}` : undefined;
      
      const metadata: EnrichedMetadata = {
        title: movie.title,
        originalTitle: movie.original_title,
        overview: movie.overview,
        tagline: movie.tagline,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        posterUrl: this.getImageUrl(movie.poster_path, 'poster'),
        backdropUrl: this.getImageUrl(movie.backdrop_path, 'backdrop'),
        genres: movie.genres?.map((g: any) => g.name) || [],
        releaseDate: movie.release_date,
        runtime: movie.runtime,
        voteAverage: movie.vote_average,
        voteCount: movie.vote_count,
        popularity: movie.popularity,
        cast: movie.credits?.cast?.slice(0, 10).map((person: any) => ({
          name: person.name,
          character: person.character,
          profilePath: person.profile_path,
        })) || [],
        director,
        trailerUrl,
        imdbId: movie.imdb_id,
        tmdbId: movie.id,
        status: movie.status,
        originalLanguage: movie.original_language,
      };
      
      console.log(`✅ Fetched details for: ${movie.title}`);
      
      return metadata;
      
    } catch (error) {
      console.error(`❌ Error getting movie details for ID ${movieId}:`, error);
      throw error;
    }
  }
  
  /**
   * Recherche une série sur TMDB
   */
  static async searchSeries(title: string, year?: number): Promise<EnrichedMetadata | null> {
    try {
      // Vérifier le cache d'abord
      const cacheKey = `${this.CACHE_PREFIX}series:${title}:${year || 'any'}`;
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        console.log(`📦 Loaded series metadata from cache: ${title}`);
        return cached;
      }
      
      const cleanedTitle = this.cleanTitle(title);
      const extractedYear = year || this.extractYear(title);
      
      console.log(`🔍 Searching TMDB for series: "${cleanedTitle}" (${extractedYear || 'any year'})`);
      
      let url = `${this.TMDB_BASE_URL}/search/tv?api_key=${this.TMDB_API_KEY}&query=${encodeURIComponent(cleanedTitle)}&language=fr-FR`;
      if (extractedYear) {
        url += `&first_air_date_year=${extractedYear}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log(`⚠️ No results found for: ${cleanedTitle}`);
        return null;
      }
      
      // Prendre le premier résultat (le plus pertinent)
      const series = data.results[0];
      
      // Récupérer les détails complets
      const details = await this.getSeriesDetails(series.id);
      
      // Sauvegarder dans le cache
      await this.saveToCache(cacheKey, details);
      
      return details;
      
    } catch (error) {
      console.error(`❌ Error searching series "${title}":`, error);
      return null;
    }
  }
  
  /**
   * Récupère les détails complets d'une série
   */
  private static async getSeriesDetails(seriesId: number): Promise<EnrichedMetadata> {
    try {
      const url = `${this.TMDB_BASE_URL}/tv/${seriesId}?api_key=${this.TMDB_API_KEY}&language=fr-FR&append_to_response=credits,videos`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const series = await response.json();
      
      // Trouver le créateur
      const director = series.created_by?.[0]?.name;
      
      // Extraire le trailer YouTube
      const trailerVideo = series.videos?.results?.find(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      const trailerUrl = trailerVideo ? `https://www.youtube.com/watch?v=${trailerVideo.key}` : undefined;
      
      const metadata: EnrichedMetadata = {
        title: series.name,
        originalTitle: series.original_name,
        overview: series.overview,
        tagline: series.tagline,
        posterPath: series.poster_path,
        backdropPath: series.backdrop_path,
        posterUrl: this.getImageUrl(series.poster_path, 'poster'),
        backdropUrl: this.getImageUrl(series.backdrop_path, 'backdrop'),
        genres: series.genres?.map((g: any) => g.name) || [],
        releaseDate: series.first_air_date,
        voteAverage: series.vote_average,
        voteCount: series.vote_count,
        popularity: series.popularity,
        cast: series.credits?.cast?.slice(0, 10).map((person: any) => ({
          name: person.name,
          character: person.character,
          profilePath: person.profile_path,
        })) || [],
        director,
        trailerUrl,
        tmdbId: series.id,
        status: series.status,
        originalLanguage: series.original_language,
        numberOfSeasons: series.number_of_seasons,
        numberOfEpisodes: series.number_of_episodes,
        episodeRunTime: series.episode_run_time,
        firstAirDate: series.first_air_date,
        lastAirDate: series.last_air_date,
        inProduction: series.in_production,
      };
      
      console.log(`✅ Fetched details for: ${series.name}`);
      
      return metadata;
      
    } catch (error) {
      console.error(`❌ Error getting series details for ID ${seriesId}:`, error);
      throw error;
    }
  }
  
  /**
   * Récupère depuis le cache
   */
  private static async getFromCache(key: string): Promise<EnrichedMetadata | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;
      
      const parsed = JSON.parse(cached);
      
      // Vérifier si le cache est expiré
      if (parsed.timestamp && Date.now() - parsed.timestamp > this.CACHE_TTL) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.error('❌ Cache read error:', error);
      return null;
    }
  }
  
  /**
   * Sauvegarde dans le cache
   */
  private static async saveToCache(key: string, data: EnrichedMetadata): Promise<void> {
    try {
      const cacheData = {
        timestamp: Date.now(),
        data,
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('❌ Cache write error:', error);
      // Ne pas bloquer si le cache échoue
    }
  }
  
  /**
   * Efface tout le cache de métadonnées
   */
  static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const metadataKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (metadataKeys.length > 0) {
        await AsyncStorage.multiRemove(metadataKeys);
        console.log(`🗑️ Cleared ${metadataKeys.length} metadata cache entries`);
      }
    } catch (error) {
      console.error('❌ Error clearing metadata cache:', error);
    }
  }
  
  /**
   * Récupère les statistiques du cache
   */
  static async getCacheStats(): Promise<{ count: number; size: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const metadataKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let totalSize = 0;
      for (const key of metadataKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return {
        count: metadataKeys.length,
        size: totalSize,
      };
    } catch (error) {
      console.error('❌ Error getting cache stats:', error);
      return { count: 0, size: 0 };
    }
  }
}

export default MetadataEnrichmentService;
