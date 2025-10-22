import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import { xtreamService } from '../services/XtreamCodesService';
import { StorageService } from '../services';

const MoviesScreen = ({ navigation }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [error, setError] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');

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
      
      // Extract unique categories
      const cats = ['Tout', ...new Set(movieList.map(m => m.category || 'Films'))];
      setCategories(cats);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement films:', error);
      setError(error.message || 'Impossible de charger les films');
      setLoading(false);
    }
  };

  // Filter by category
  let filteredMovies = selectedCategory === 'Tout' 
    ? movies 
    : movies.filter(m => (m.category || 'Films') === selectedCategory);
  
  // Filter by search
  if (searchQuery.trim()) {
    filteredMovies = filteredMovies.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Limit for performance
  const displayedMovies = filteredMovies.slice(0, displayLimit);
  const hasMore = filteredMovies.length > displayLimit;

  const renderMovie = ({ item }) => (
    <TouchableOpacity 
      style={styles.movieCard}
      onPress={() => navigation.navigate('Player', { 
        channel: {
          id: item.id,
          name: item.name,
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
        <Text style={styles.movieName} numberOfLines={2}>{item.name}</Text>
        {item.year && <Text style={styles.movieYear}>{item.year}</Text>}
        {item.rating && <Text style={styles.movieRating}>⭐ {item.rating}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item && styles.categoryTextActive
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

      {/* Categories */}
      {categories.length > 0 && (
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
          style={styles.categoryList}
          showsHorizontalScrollIndicator={false}
        />
      )}

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
  movieYear: { 
    fontSize: 12, 
    color: '#94a3b8', 
    marginBottom: 3 
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
