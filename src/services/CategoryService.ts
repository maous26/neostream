/**
 * CategoryService - Classification intelligente des contenus IPTV
 * Basé sur les meilleures pratiques des providers IPTV professionnels
 * (SmartiFlix, Marinios, Velvado) et GitHub iptv-org
 */

import { Channel, Movie, Series } from './XtreamCodesService';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  priority: number; // Pour l'ordre d'affichage
}

export interface EnrichedChannel extends Omit<Channel, 'quality'> {
  cleanName: string;
  country?: string;
  language?: string;
  quality: 'SD' | 'HD' | 'FHD' | '4K' | 'UHD';
}

export interface EnrichedMovie extends Omit<Movie, 'quality'> {
  cleanName: string;
  genres: string[];
  quality: 'SD' | 'HD' | 'FHD' | '4K' | 'UHD';
  imdbRating?: number;
  popularity?: number;
}

export interface EnrichedSeries extends Omit<Series, 'quality'> {
  cleanName: string;
  genres: string[];
  quality: 'SD' | 'HD' | 'FHD' | '4K' | 'UHD';
  imdbRating?: number;
  status?: 'En cours' | 'Terminée';
  popularity?: number;
}

class CategoryService {
  /**
   * LIVE TV CATEGORIES - Basées sur iptv-org/iptv
   * Source: https://github.com/iptv-org/iptv/tree/master/streams
   */
  private readonly LIVE_CATEGORIES: Category[] = [
    // Catégories principales
    { id: 'news', name: 'Actualités', emoji: '📰', priority: 1 },
    { id: 'entertainment', name: 'Divertissement', emoji: '🎭', priority: 2 },
    { id: 'movies', name: 'Cinéma', emoji: '🎬', priority: 3 },
    { id: 'series', name: 'Séries TV', emoji: '📺', priority: 4 },
    { id: 'sports', name: 'Sports', emoji: '⚽', priority: 5 },
    { id: 'kids', name: 'Enfants', emoji: '👶', priority: 6 },
    { id: 'music', name: 'Musique', emoji: '🎵', priority: 7 },
    { id: 'documentary', name: 'Documentaires', emoji: '🌍', priority: 8 },
    { id: 'lifestyle', name: 'Style de vie', emoji: '💄', priority: 9 },
    { id: 'religious', name: 'Religion', emoji: '🙏', priority: 10 },
    { id: 'education', name: 'Éducation', emoji: '📚', priority: 11 },
    { id: 'general', name: 'Général', emoji: '📡', priority: 99 },
  ];

  /**
   * VOD MOVIE GENRES - Standard de l'industrie (TMDB, IMDb)
   */
  private readonly MOVIE_GENRES: Category[] = [
    { id: 'action', name: 'Action', emoji: '💥', priority: 1 },
    { id: 'adventure', name: 'Aventure', emoji: '🗺️', priority: 2 },
    { id: 'animation', name: 'Animation', emoji: '🎨', priority: 3 },
    { id: 'comedy', name: 'Comédie', emoji: '😂', priority: 4 },
    { id: 'crime', name: 'Policier', emoji: '🔫', priority: 5 },
    { id: 'documentary', name: 'Documentaire', emoji: '🎥', priority: 6 },
    { id: 'drama', name: 'Drame', emoji: '🎭', priority: 7 },
    { id: 'family', name: 'Famille', emoji: '👨‍👩‍👧‍👦', priority: 8 },
    { id: 'fantasy', name: 'Fantastique', emoji: '🧙', priority: 9 },
    { id: 'horror', name: 'Horreur', emoji: '👻', priority: 10 },
    { id: 'romance', name: 'Romance', emoji: '💕', priority: 11 },
    { id: 'sci-fi', name: 'Science-Fiction', emoji: '🚀', priority: 12 },
    { id: 'thriller', name: 'Thriller', emoji: '😱', priority: 13 },
    { id: 'war', name: 'Guerre', emoji: '⚔️', priority: 14 },
    { id: 'western', name: 'Western', emoji: '🤠', priority: 15 },
  ];

  /**
   * VOD SERIES GENRES
   */
  private readonly SERIES_GENRES: Category[] = [
    { id: 'action', name: 'Action', emoji: '💥', priority: 1 },
    { id: 'comedy', name: 'Comédie', emoji: '😂', priority: 2 },
    { id: 'crime', name: 'Policier', emoji: '🔫', priority: 3 },
    { id: 'drama', name: 'Drame', emoji: '🎭', priority: 4 },
    { id: 'fantasy', name: 'Fantastique', emoji: '🧙', priority: 5 },
    { id: 'horror', name: 'Horreur', emoji: '👻', priority: 6 },
    { id: 'mystery', name: 'Mystère', emoji: '🔍', priority: 7 },
    { id: 'romance', name: 'Romance', emoji: '💕', priority: 8 },
    { id: 'sci-fi', name: 'Science-Fiction', emoji: '🚀', priority: 9 },
    { id: 'thriller', name: 'Thriller', emoji: '😱', priority: 10 },
    { id: 'reality', name: 'Télé-réalité', emoji: '📹', priority: 11 },
    { id: 'kids', name: 'Jeunesse', emoji: '👶', priority: 12 },
  ];

  /**
   * Nettoie le nom d'une chaîne TV
   * Supprime: FR:, |FR|, UK:, US:, [HD], [4K], etc.
   */
  cleanChannelName(name: string): string {
    return name
      .replace(/^(FR|UK|US|CA|DE|ES|IT|PT|AR|BE|CH|NL|PL|RO|TR)[:|\s]/gi, '')
      .replace(/\|[A-Z]{2}\|/g, '')
      .replace(/\[(HD|FHD|4K|UHD|SD)\]/gi, '')
      .replace(/\s*-\s*(HD|FHD|4K|UHD|SD)\s*$/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Détecte la qualité à partir du nom
   */
  detectQuality(name: string): 'SD' | 'HD' | 'FHD' | '4K' | 'UHD' {
    const upperName = name.toUpperCase();
    if (upperName.includes('4K') || upperName.includes('UHD')) return '4K';
    if (upperName.includes('FHD') || upperName.includes('1080')) return 'FHD';
    if (upperName.includes('HD') || upperName.includes('720')) return 'HD';
    return 'SD';
  }

  /**
   * Détecte le pays/langue à partir du préfixe
   */
  detectCountry(name: string): string | undefined {
    const match = name.match(/^(FR|UK|US|CA|DE|ES|IT|PT|AR|BE|CH|NL|PL|RO|TR)[:|\s]/i);
    if (match) {
      const countryMap: { [key: string]: string } = {
        FR: 'France', UK: 'Royaume-Uni', US: 'États-Unis', CA: 'Canada',
        DE: 'Allemagne', ES: 'Espagne', IT: 'Italie', PT: 'Portugal',
        AR: 'Argentine', BE: 'Belgique', CH: 'Suisse', NL: 'Pays-Bas',
        PL: 'Pologne', RO: 'Roumanie', TR: 'Turquie',
      };
      return countryMap[match[1].toUpperCase()];
    }
    return undefined;
  }

  /**
   * Catégorise une chaîne TV de manière intelligente
   */
  categorizeChannel(channel: Channel): EnrichedChannel {
    const cleanName = this.cleanChannelName(channel.name);
    const nameLower = cleanName.toLowerCase();
    const originalLower = channel.name.toLowerCase();

    // Détection de catégorie basée sur les mots-clés
    let detectedCategory = channel.category || 'Général';

    // News
    if (/(news|info|actualité|24|bfm|cnews|lci|france ?info)/i.test(nameLower)) {
      detectedCategory = 'Actualités';
    }
    // Sports
    else if (/(sport|foot|rugby|tennis|basket|golf|racing|eurosport|bein)/i.test(nameLower)) {
      detectedCategory = 'Sports';
    }
    // Kids
    else if (/(kids|enfant|junior|disney|cartoon|nickelodeon|gulli|tiji)/i.test(nameLower)) {
      detectedCategory = 'Enfants';
    }
    // Movies
    else if (/(ciné|cinéma|cinema|movie|film)/i.test(nameLower)) {
      detectedCategory = 'Cinéma';
    }
    // Series
    else if (/(série|series|drama)/i.test(nameLower)) {
      detectedCategory = 'Séries TV';
    }
    // Music
    else if (/(music|mtv|mcm|trace|nrj|radio)/i.test(nameLower)) {
      detectedCategory = 'Musique';
    }
    // Documentary
    else if (/(doc|discovery|national ?geo|arte|planète|ushuaia)/i.test(nameLower)) {
      detectedCategory = 'Documentaires';
    }
    // Entertainment
    else if (/(tf1|france ?[2345]|m6|w9|tmc|c8|divertissement)/i.test(nameLower)) {
      detectedCategory = 'Divertissement';
    }

    return {
      ...channel,
      cleanName,
      category: detectedCategory,
      country: this.detectCountry(channel.name),
      quality: this.detectQuality(channel.name),
    };
  }

  /**
   * Nettoie le nom d'un film/série
   * Supprime: (2023), [FR], VF, VOSTFR, etc.
   */
  cleanMovieName(name: string): string {
    return name
      .replace(/\([12]\d{3}\)/g, '') // (2023)
      .replace(/\[[A-Z]{2}\]/g, '') // [FR]
      .replace(/\b(VF|VOSTFR|VO|TRUEFRENCH|FRENCH)\b/gi, '')
      .replace(/\[(HD|FHD|4K|UHD|SD)\]/gi, '')
      .replace(/\s*-\s*(HD|FHD|4K|UHD|SD)\s*$/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extrait les genres à partir d'une string
   */
  parseGenres(genreString?: string): string[] {
    if (!genreString) return [];
    
    return genreString
      .split(/[,;|\/]/)
      .map(g => g.trim())
      .filter(g => g.length > 0)
      .slice(0, 3); // Max 3 genres
  }

  /**
   * Catégorise un film
   */
  categorizeMovie(movie: Movie): EnrichedMovie {
    const cleanName = this.cleanMovieName(movie.name);
    const genres = this.parseGenres(movie.genre);

    return {
      ...movie,
      cleanName,
      genres,
      quality: this.detectQuality(movie.name),
      imdbRating: movie.rating ? parseFloat(movie.rating) : undefined,
    };
  }

  /**
   * Catégorise une série
   */
  categorizeSeries(series: Series): EnrichedSeries {
    const cleanName = this.cleanMovieName(series.name);
    const genres = this.parseGenres(series.genre);

    return {
      ...series,
      cleanName,
      genres,
      quality: this.detectQuality(series.name),
      imdbRating: series.rating ? parseFloat(series.rating) : undefined,
    };
  }

  /**
   * Organise les chaînes par catégorie
   */
  organizeChannelsByCategory(channels: Channel[]): Map<string, EnrichedChannel[]> {
    const organized = new Map<string, EnrichedChannel[]>();
    
    channels.forEach(channel => {
      const enriched = this.categorizeChannel(channel);
      const category = enriched.category;
      
      if (!organized.has(category)) {
        organized.set(category, []);
      }
      organized.get(category)!.push(enriched);
    });

    // Trier chaque catégorie par nom
    organized.forEach((channels, category) => {
      organized.set(category, channels.sort((a, b) => 
        a.cleanName.localeCompare(b.cleanName)
      ));
    });

    return organized;
  }

  /**
   * Organise les films par genre
   */
  organizeMoviesByGenre(movies: Movie[]): Map<string, EnrichedMovie[]> {
    const organized = new Map<string, EnrichedMovie[]>();
    
    movies.forEach(movie => {
      const enriched = this.categorizeMovie(movie);
      
      // Un film peut avoir plusieurs genres
      if (enriched.genres.length === 0) {
        enriched.genres = ['Autre'];
      }

      enriched.genres.forEach(genre => {
        if (!organized.has(genre)) {
          organized.set(genre, []);
        }
        organized.get(genre)!.push(enriched);
      });
    });

    // Trier par note IMDb décroissante
    organized.forEach((movies, genre) => {
      organized.set(genre, movies.sort((a, b) => {
        const ratingA = a.imdbRating || 0;
        const ratingB = b.imdbRating || 0;
        return ratingB - ratingA;
      }));
    });

    return organized;
  }

  /**
   * Organise les séries par genre
   */
  organizeSeriesByGenre(series: Series[]): Map<string, EnrichedSeries[]> {
    const organized = new Map<string, EnrichedSeries[]>();
    
    series.forEach(s => {
      const enriched = this.categorizeSeries(s);
      
      // Une série peut avoir plusieurs genres
      if (enriched.genres.length === 0) {
        enriched.genres = ['Autre'];
      }

      enriched.genres.forEach(genre => {
        if (!organized.has(genre)) {
          organized.set(genre, []);
        }
        organized.get(genre)!.push(enriched);
      });
    });

    // Trier par note IMDb décroissante
    organized.forEach((seriesList, genre) => {
      organized.set(genre, seriesList.sort((a, b) => {
        const ratingA = a.imdbRating || 0;
        const ratingB = b.imdbRating || 0;
        return ratingB - ratingA;
      }));
    });

    return organized;
  }

  /**
   * Filtre les films par année
   */
  filterMoviesByYear(movies: EnrichedMovie[], year: number): EnrichedMovie[] {
    return movies.filter(m => m.year && m.year.includes(year.toString()));
  }

  /**
   * Filtre par note minimum
   */
  filterByRating(items: (EnrichedMovie | EnrichedSeries)[], minRating: number) {
    return items.filter(item => (item.imdbRating || 0) >= minRating);
  }

  /**
   * Filtre par qualité
   */
  filterByQuality(items: (EnrichedChannel | EnrichedMovie | EnrichedSeries)[], quality: string) {
    return items.filter(item => item.quality === quality);
  }

  /**
   * Recherche intelligente (sans accents, case-insensitive)
   */
  search<T extends { cleanName: string }>(items: T[], query: string): T[] {
    const normalizedQuery = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return items.filter(item => {
      const normalizedName = item.cleanName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      return normalizedName.includes(normalizedQuery);
    });
  }

  /**
   * Obtenir les catégories disponibles
   */
  getLiveCategories(): Category[] {
    return this.LIVE_CATEGORIES.sort((a, b) => a.priority - b.priority);
  }

  getMovieGenres(): Category[] {
    return this.MOVIE_GENRES.sort((a, b) => a.priority - b.priority);
  }

  getSeriesGenres(): Category[] {
    return this.SERIES_GENRES.sort((a, b) => a.priority - b.priority);
  }
}

export const categoryService = new CategoryService();
