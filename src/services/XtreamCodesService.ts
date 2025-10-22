import { logoService } from './LogoService';
import CacheService from './CacheService';

export interface XtreamCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface Channel {
  id: string;
  name: string;
  url: string;
  category: string;
  logo?: string;
  emoji: string;
  quality: string;
}

export interface Movie {
  id: string;
  name: string;
  streamUrl: string;
  category: string;
  cover?: string;
  plot?: string;
  rating?: string;
  year?: string;
  duration?: string;
  genre?: string;
}

export interface Series {
  id: string;
  name: string;
  category: string;
  cover?: string;
  plot?: string;
  rating?: string;
  year?: string;
  genre?: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  episodeNum: number;
  title: string;
  streamUrl: string;
  duration?: string;
  plot?: string;
}

class XtreamCodesService {
  private baseUrl: string = '';
  private username: string = '';
  private password: string = '';
  private initialized: boolean = false;

  /**
   * Initialize service from stored credentials
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized && this.baseUrl && this.username && this.password) {
      return; // Already initialized
    }

    try {
      const StorageService = require('./StorageService').StorageService;
      const credentials = await StorageService.getCredentials();
      
      if (credentials) {
        let serverUrl = credentials.serverUrl || credentials.m3uUrl || '';
        if (serverUrl) {
          if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
            serverUrl = 'http://' + serverUrl;
          }
          this.baseUrl = serverUrl.replace(/\/$/, '');
          this.username = credentials.username || '';
          this.password = credentials.password || '';
          this.initialized = true;
          console.log('✅ Service initialized from stored credentials');
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize from stored credentials:', error);
    }
  }

  async authenticate(credentials: XtreamCredentials): Promise<boolean> {
    try {
      let serverUrl = credentials.serverUrl.trim();
      
      if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
        serverUrl = 'http://' + serverUrl;
      }

      this.baseUrl = serverUrl.replace(/\/$/, '');
      this.username = credentials.username;
      this.password = credentials.password;

      console.log('🔐 Authentification Xtream Codes...');
      console.log('📡 Input serverUrl:', credentials.serverUrl);
      console.log('📡 Processed baseUrl:', this.baseUrl);
      console.log('👤 Username:', this.username);

      const authUrl = `${this.baseUrl}/player_api.php?username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}`;
      
      console.log('🌐 Tentative de connexion...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 Réponse:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📄 Data reçue:', JSON.stringify(data).substring(0, 200));
      
      if (data.user_info && data.user_info.auth === 1) {
        console.log('✅ Auth OK');
        return true;
      } else if (data.user_info) {
        throw new Error('Authentification refusée - Vérifiez vos identifiants');
      } else {
        throw new Error('Réponse invalide du serveur');
      }

    } catch (error: any) {
      console.error('❌ Auth error:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Le serveur ne répond pas');
      }
      
      if (error.message.includes('Network request failed')) {
        throw new Error('Impossible de contacter le serveur.\nVérifiez:\n1. L\'URL du serveur\n2. Votre connexion Internet\n3. Que le serveur est en ligne');
      }
      
      throw error;
    }
  }

  async getChannels(credentials: XtreamCredentials): Promise<Channel[]> {
    try {
      // Try to get from cache first
      console.log('🔍 Checking cache for live channels...');
      const cachedChannels = await CacheService.getLiveChannels();
      
      if (cachedChannels && cachedChannels.length > 0) {
        console.log(`✅ Loaded ${cachedChannels.length} channels from cache`);
        return cachedChannels;
      }

      // Cache miss - fetch from API
      await this.authenticate(credentials);

      console.log('📺 Chargement des chaînes depuis l\'API...');
      const url = `${this.baseUrl}/player_api.php?username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}&action=get_live_streams`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const streams = await response.json();
      console.log('✅ Streams:', streams.length);

      // Map channels WITHOUT fetching logos (to avoid memory issues)
      const channels: Channel[] = streams.map((stream: any, index: number) => ({
        id: stream.stream_id?.toString() || index.toString(),
        name: stream.name || `Channel ${index}`,
        url: `${this.baseUrl}/live/${this.username}/${this.password}/${stream.stream_id}.m3u8`,
        category: stream.category_name || 'General',
        logo: stream.stream_icon || '', // Use provider logo if available
        emoji: '📺',
        quality: 'HD',
      }));

      // Save to cache
      await CacheService.saveLiveChannels(channels);
      console.log(`💾 Saved ${channels.length} channels to cache`);

      return channels;

      console.log(`✅ Loaded ${channels.length} channels`);
      return channels;

    } catch (error) {
      console.error('❌ getChannels error:', error);
      throw error;
    }
  }

  async getLiveChannels(): Promise<Channel[]> {
    try {
      if (!this.baseUrl || !this.username || !this.password) {
        throw new Error('Non authentifié - Veuillez vous connecter');
      }

      console.log('📺 Chargement des chaînes live...');
      const url = `${this.baseUrl}/player_api.php?username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}&action=get_live_streams`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const streams = await response.json();
      console.log('✅ Streams reçus:', streams.length);

      const channels: Channel[] = streams.map((stream: any, index: number) => ({
        id: stream.stream_id?.toString() || index.toString(),
        name: stream.name || `Channel ${index}`,
        url: `${this.baseUrl}/live/${this.username}/${this.password}/${stream.stream_id}.m3u8`,
        category: stream.category_name || 'General',
        logo: stream.stream_icon,
        emoji: '📺',
        quality: 'HD',
      }));

      return channels;

    } catch (error) {
      console.error('❌ getLiveChannels error:', error);
      throw error;
    }
  }

  async getVODMovies(): Promise<Movie[]> {
    try {
      // Ensure service is initialized with stored credentials
      await this.ensureInitialized();
      
      if (!this.baseUrl || !this.username || !this.password) {
        throw new Error('Non authentifié - Veuillez vous connecter');
      }

      // Try to get from cache first
      console.log('🔍 Checking cache for VOD movies...');
      const cachedMovies = await CacheService.getVODMovies();
      
      if (cachedMovies && cachedMovies.length > 0) {
        console.log(`✅ Loaded ${cachedMovies.length} movies from cache`);
        return cachedMovies;
      }

      // Cache miss - fetch from API
      console.log('🎬 Chargement des films VOD depuis l\'API...');
      const url = `${this.baseUrl}/player_api.php?username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}&action=get_vod_streams`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const streams = await response.json();
      console.log('✅ Films VOD reçus:', streams.length);

      const movies: Movie[] = streams.map((stream: any) => ({
        id: stream.stream_id?.toString() || stream.num?.toString(),
        name: stream.name || 'Film sans titre',
        streamUrl: `${this.baseUrl}/movie/${this.username}/${this.password}/${stream.stream_id}.${stream.container_extension || 'mp4'}`,
        category: stream.category_name || 'Films',
        cover: stream.stream_icon || stream.cover_big,
        plot: stream.plot || '',
        rating: stream.rating || '',
        year: stream.releasedate || stream.year || '',
        duration: stream.duration || '',
        genre: stream.genre || '',
      }));

      // Save to cache
      await CacheService.saveVODMovies(movies);
      console.log(`💾 Saved ${movies.length} movies to cache`);

      return movies;

    } catch (error) {
      console.error('❌ getVODMovies error:', error);
      throw error;
    }
  }

  async getVODSeries(): Promise<Series[]> {
    try {
      // Ensure service is initialized with stored credentials
      await this.ensureInitialized();
      
      if (!this.baseUrl || !this.username || !this.password) {
        throw new Error('Non authentifié - Veuillez vous connecter');
      }

      // Try to get from cache first
      console.log('🔍 Checking cache for VOD series...');
      const cachedSeries = await CacheService.getVODSeries();
      
      if (cachedSeries && cachedSeries.length > 0) {
        console.log(`✅ Loaded ${cachedSeries.length} series from cache`);
        return cachedSeries;
      }

      // Cache miss - fetch from API
      console.log('🎭 Chargement des séries VOD depuis l\'API...');
      const url = `${this.baseUrl}/player_api.php?username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}&action=get_series`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const streams = await response.json();
      console.log('✅ Séries VOD reçues:', streams.length);

      const series: Series[] = streams.map((stream: any) => ({
        id: stream.series_id?.toString() || stream.num?.toString(),
        name: stream.name || 'Série sans titre',
        category: stream.category_name || 'Séries',
        cover: stream.cover || stream.cover_big,
        plot: stream.plot || '',
        rating: stream.rating || '',
        year: stream.releaseDate || stream.year || '',
        genre: stream.genre || '',
      }));

      // Save to cache
      await CacheService.saveVODSeries(series);
      console.log(`💾 Saved ${series.length} series to cache`);

      return series;

    } catch (error) {
      console.error('❌ getVODSeries error:', error);
      throw error;
    }
  }

  async getSeriesInfo(seriesId: string): Promise<any> {
    try {
      // Ensure service is initialized with stored credentials
      await this.ensureInitialized();
      
      if (!this.baseUrl || !this.username || !this.password) {
        throw new Error('Non authentifié - Veuillez vous connecter');
      }

      // Try to get from cache first
      console.log(`🔍 Checking cache for series info: ${seriesId}`);
      const cachedInfo = await CacheService.getSeriesInfo(seriesId);
      
      if (cachedInfo) {
        console.log(`✅ Loaded series info from cache: ${seriesId}`);
        return cachedInfo;
      }

      // Cache miss - fetch from API
      console.log('📋 Chargement info série depuis l\'API:', seriesId);
      const url = `${this.baseUrl}/player_api.php?username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}&action=get_series_info&series_id=${seriesId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Info série reçue');

      // Save to cache
      await CacheService.saveSeriesInfo(seriesId, data);
      console.log(`💾 Saved series info to cache: ${seriesId}`);

      return data;

    } catch (error) {
      console.error('❌ getSeriesInfo error:', error);
      throw error;
    }
  }

  getEpisodeStreamUrl(episodeId: string, containerExtension: string = 'mp4'): string {
    return `${this.baseUrl}/series/${this.username}/${this.password}/${episodeId}.${containerExtension}`;
  }
}

export const xtreamService = new XtreamCodesService();
