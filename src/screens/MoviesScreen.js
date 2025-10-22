import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput, ScrollView } from 'react-native';
import { xtreamService } from '../services/XtreamCodesService';
import { StorageService, categoryService } from '../services';

const MoviesScreen = ({ navigation }) => {
  const [movies, setMovies] = useState([]);
  const [enrichedMovies, setEnrichedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('Tout');
  const [selectedYear, setSelectedYear] = useState('Tout');
  const [minRating, setMinRating] = useState(0);
  const [error, setError] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'rating', 'year'

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setError(null);
      const credentials = await StorageService.getCredentials();
      
      if (!credentials) {
        navigation.replace('Login');
        return;
      }

      console.log('🎬 Chargement des films VOD...');
      
      // Authenticate first
      await xtreamService.authenticate({
        serverUrl: credentials.m3uUrl,
        username: credentials.username || '',
        password: credentials.password || '',
      });

      const movieList = await xtreamService.getVODMovies();
      
      console.log('✅ Films chargés:', movieList.length);
      
      setMovies(movieList);
      
      // Enrichir avec CategoryService
      console.log('🎯 Classification intelligente des films...');
      const enriched = movieList.map(m => categoryService.categorizeMovie(m));
      setEnrichedMovies(enriched);
      
      // Extraire tous les genres uniques
      const allGenres = new Set();
      enriched.forEach(movie => {
        movie.genres.forEach(genre => allGenres.add(genre));
      });
      const sortedGenres = Array.from(allGenres).sort();
      setGenres(['Tout', ...sortedGenres]);
      
      console.log(`✨ ${enriched.length} films enrichis dans ${sortedGenres.length} genres`);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement films:', error);
      setError(error.message || 'Impossible de charger les films');
      setLoading(false);
    }
  };

  // Utiliser les films enrichis si disponibles
  const moviesToDisplay = enrichedMovies.length > 0 ? enrichedMovies : movies;

  // Filter by genre
  let filteredMovies = selectedGenre === 'Tout' 
    ? moviesToDisplay 
    : moviesToDisplay.filter(m => m.genres.includes(selectedGenre));
  
  // Filter by year
  if (selectedYear !== 'Tout') {
    filteredMovies = filteredMovies.filter(m => m.year && m.year.includes(selectedYear));
  }
  
  // Filter by rating
  if (minRating > 0) {
    filteredMovies = categoryService.filterByRating(filteredMovies, minRating);
  }
  
  // Filter by search
  if (searchQuery.trim()) {
    filteredMovies = categoryService.search(
      filteredMovies.map(m => ({ ...m, cleanName: m.cleanName || m.name })),
      searchQuery
    );
  }
  
  // Sort
  filteredMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.imdbRating || 0) - (a.imdbRating || 0);
    } else if (sortBy === 'year') {
      return (b.year || '').localeCompare(a.year || '');
    } else {
      return (a.cleanName || a.name).localeCompare(b.cleanName || b.name);
    }
  });
  
  // Limit for performance
  const displayedMovies = filteredMovies.slice(0, displayLimit);
  const hasMore = filteredMovies.length > displayLimit;

  const renderMovie = ({ item }) => {
    const displayName = item.cleanName || item.name;
    const rating = item.imdbRating || (item.rating ? parseFloat(item.rating) : null);
    const qualityBadge = item.quality && item.quality !== 'SD' ? item.quality : null;
    
    return (
      <TouchableOpacity 
        style={styles.movieCard}
        onPress={() => navigation.navigate('Player', { 
          channel: {
            id: item.id,
            name: displayName,
            url: item.streamUrl,
            category: item.category,
            logo: item.cover,
            emoji: '🎬',
            quality: 'VOD',
          }
        })}
      >
        {item.cover ? (
          <Image 
            source={{ uri: item.cover }} 
            style={styles.movieCover}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.moviePlaceholder}>
            <Text style={styles.placeholderText}>🎬</Text>
          </View>
        )}
        <View style={styles.movieInfo}>
          <Text style={styles.movieName} numberOfLines={2}>{displayName}</Text>
          <View style={styles.movieMeta}>
            {item.year && <Text style={styles.movieYear}>📅 {item.year.substring(0, 4)}</Text>}
            {rating && <Text style={styles.movieRating}>⭐ {rating.toFixed(1)}</Text>}
          </View>
          {item.genres && item.genres.length > 0 && (
            <Text style={styles.movieGenres} numberOfLines={1}>
              {item.genres.slice(0, 2).join(' · ')}
            </Text>
          )}
          {qualityBadge && (
            <View style={styles.qualityBadge}>
              <Text style={styles.qualityText}>{qualityBadge}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderGenre = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.genreButton,
        selectedGenre === item && styles.genreButtonActive
      ]}
      onPress={() => setSelectedGenre(item)}
    >
      <Text style={[
        styles.genreText,
        selectedGenre === item && styles.genreTextActive
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Chargement des films...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Erreur</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMovies}>
          <Text style={styles.retryText}>🔄 Réessayer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎬 Films</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un film..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Genres */}
      {genres.length > 0 && (
        <FlatList
          horizontal
          data={genres}
          renderItem={renderGenre}
          keyExtractor={(item) => item}
          style={styles.genreList}
          showsHorizontalScrollIndicator={false}
        />
      )}

      {/* Filters */}
      <ScrollView 
        horizontal 
        style={styles.filtersContainer}
        showsHorizontalScrollIndicator={false}
      >
        {/* Sort by */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Tri:</Text>
          {['name', 'rating', 'year'].map(sort => (
            <TouchableOpacity
              key={sort}
              style={[styles.filterButton, sortBy === sort && styles.filterButtonActive]}
              onPress={() => setSortBy(sort)}
            >
              <Text style={[styles.filterButtonText, sortBy === sort && styles.filterButtonTextActive]}>
                {sort === 'name' ? '📝 Nom' : sort === 'rating' ? '⭐ Note' : '📅 Année'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Year filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Année:</Text>
          {['Tout', '2024', '2023', '2022', '2021', '2020'].map(year => (
            <TouchableOpacity
              key={year}
              style={[styles.filterButton, selectedYear === year && styles.filterButtonActive]}
              onPress={() => setSelectedYear(year)}
            >
              <Text style={[styles.filterButtonText, selectedYear === year && styles.filterButtonTextActive]}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rating filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Note min:</Text>
          {[0, 6, 7, 8].map(rating => (
            <TouchableOpacity
              key={rating}
              style={[styles.filterButton, minRating === rating && styles.filterButtonActive]}
              onPress={() => setMinRating(rating)}
            >
              <Text style={[styles.filterButtonText, minRating === rating && styles.filterButtonTextActive]}>
                {rating === 0 ? 'Tout' : `${rating}+`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Stats */}
      <Text style={styles.statsText}>
        📊 {displayedMovies.length} film{displayedMovies.length > 1 ? 's' : ''}
        {selectedGenre !== 'Tout' && ` · ${selectedGenre}`}
        {selectedYear !== 'Tout' && ` · ${selectedYear}`}
        {minRating > 0 && ` · ${minRating}+ ⭐`}
      </Text>

      {/* Movies Grid */}
      <FlatList
        data={displayedMovies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.movieList}
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={() => setDisplayLimit(prev => prev + 50)}
            >
              <Text style={styles.loadMoreText}>
                📥 Charger plus ({displayedMovies.length}/{filteredMovies.length})
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 {displayedMovies.length} / {filteredMovies.length} films
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27' },
  loadingContainer: { flex: 1, backgroundColor: '#0a0e27', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 20, fontSize: 16 },
  errorContainer: { flex: 1, backgroundColor: '#0a0e27', justifyContent: 'center', alignItems: 'center', padding: 30 },
  errorEmoji: { fontSize: 64, marginBottom: 20 },
  errorTitle: { fontSize: 24, fontWeight: 'bold', color: '#dc2626', marginBottom: 15 },
  errorMessage: { fontSize: 16, color: '#fff', textAlign: 'center', marginBottom: 30 },
  retryButton: { backgroundColor: '#06b6d4', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 10, marginBottom: 15 },
  retryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButton: { backgroundColor: '#1e293b', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 10 },
  backText: { color: '#94a3b8', fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#0f172a' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 10 },
  backBtnText: { fontSize: 24, color: '#06b6d4' },
  title: { fontSize: 24, fontWeight: '900', color: '#06b6d4' },
  placeholder: { width: 40 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', marginHorizontal: 20, marginVertical: 10, paddingHorizontal: 15, borderRadius: 15 },
  searchIcon: { fontSize: 20, marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 12 },
  clearIcon: { fontSize: 24, color: '#64748b', paddingHorizontal: 10 },
  genreList: { maxHeight: 70, paddingHorizontal: 10, marginVertical: 10 },
  genreButton: { backgroundColor: '#1e293b', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, marginHorizontal: 6 },
  genreButtonActive: { backgroundColor: '#06b6d4' },
  genreText: { color: '#cbd5e1', fontWeight: '700', fontSize: 14 },
  genreTextActive: { color: '#fff', fontWeight: '900' },
  filtersContainer: { maxHeight: 50, paddingHorizontal: 20, marginBottom: 10 },
  filterGroup: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  filterLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginRight: 8 },
  filterButton: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 6 },
  filterButtonActive: { backgroundColor: '#06b6d4' },
  filterButtonText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  filterButtonTextActive: { color: '#fff', fontWeight: '900' },
  statsText: { color: '#64748b', fontSize: 13, fontWeight: '600', paddingHorizontal: 20, marginBottom: 10 },
  categoryList: { maxHeight: 70, paddingHorizontal: 10, marginVertical: 15 },
  categoryButton: { backgroundColor: '#1e293b', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 25, marginHorizontal: 8 },
  categoryButtonActive: { backgroundColor: '#06b6d4' },
  categoryText: { color: '#cbd5e1', fontWeight: '700', fontSize: 16 },
  categoryTextActive: { color: '#fff', fontWeight: '900' },
  movieList: { paddingHorizontal: 15, paddingBottom: 20 },
  movieCard: { 
    flex: 1, 
    margin: 5, 
    backgroundColor: '#1e293b', 
    borderRadius: 15, 
    overflow: 'hidden',
    maxWidth: '31%',
  },
  movieCover: { 
    width: '100%', 
    height: 160, 
    backgroundColor: '#334155' 
  },
  moviePlaceholder: { 
    width: '100%', 
    height: 160, 
    backgroundColor: '#334155', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  placeholderText: { fontSize: 48 },
  movieInfo: { 
    padding: 10 
  },
  movieName: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#fff', 
    marginBottom: 5 
  },
  movieMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  movieYear: { 
    fontSize: 11, 
    color: '#94a3b8', 
    marginRight: 8,
  },
  movieRating: { 
    fontSize: 11, 
    color: '#fbbf24', 
    fontWeight: '700' 
  },
  movieGenres: { 
    fontSize: 10, 
    color: '#64748b',
    marginBottom: 5,
  },
  qualityBadge: { 
    backgroundColor: '#06b6d4', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  qualityText: { 
    color: '#fff', 
    fontSize: 9, 
    fontWeight: '900' 
  },
  movieRating: { 
    fontSize: 12, 
    color: '#fbbf24', 
    fontWeight: '600' 
  },
  loadMoreButton: { backgroundColor: '#06b6d4', padding: 20, margin: 20, borderRadius: 15, alignItems: 'center' },
  loadMoreText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  infoBox: { backgroundColor: '#0f172a', padding: 15, margin: 20, borderRadius: 15 },
  infoText: { color: '#06b6d4', textAlign: 'center', fontWeight: '700' },
});

export default MoviesScreen;
