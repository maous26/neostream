import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  TextInput, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { xtreamService, categoryService } from '../services';

const SeriesScreen = ({ navigation }) => {
  const [series, setSeries] = useState([]);
  const [enrichedSeries, setEnrichedSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tout');
  const [genres, setGenres] = useState(['Tout']);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'rating', 'year'
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      setLoading(true);
      console.log('📺 Chargement des séries...');
      const seriesList = await xtreamService.getVODSeries();
      setSeries(seriesList);

      // Enrichir avec CategoryService
      console.log('🎯 Classification intelligente des séries...');
      const enriched = seriesList.map(s => categoryService.categorizeSeries(s));
      setEnrichedSeries(enriched);

      // Extraire tous les genres uniques
      const allGenres = new Set();
      enriched.forEach(s => {
        s.genres.forEach(genre => allGenres.add(genre));
      });
      const sortedGenres = Array.from(allGenres).sort();
      setGenres(['Tout', ...sortedGenres]);

      console.log(`✅ ${enriched.length} séries enrichies dans ${sortedGenres.length} genres`);
    } catch (error) {
      console.error('❌ Erreur chargement séries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeriesPress = async (seriesItem) => {
    try {
      // Fetch series details including episodes
      const seriesInfo = await xtreamService.getSeriesInfo(seriesItem.id);
      
      // Navigate to a series details screen (you can create this later)
      navigation.navigate('SeriesDetails', { 
        series: seriesItem,
        seriesInfo: seriesInfo
      });
    } catch (error) {
      console.error('❌ Erreur chargement détails série:', error);
      // For now, just show an alert or log
      alert('Erreur de chargement des détails de la série');
    }
  };

  // Utiliser les séries enrichies si disponibles
  const seriesToDisplay = enrichedSeries.length > 0 ? enrichedSeries : series;

  // Filter by genre
  let filteredSeries = selectedGenre === 'Tout' 
    ? seriesToDisplay 
    : seriesToDisplay.filter(s => s.genres.includes(selectedGenre));
  
  // Filter by rating
  if (minRating > 0) {
    filteredSeries = categoryService.filterByRating(filteredSeries, minRating);
  }
  
  // Filter by search
  if (searchQuery.trim()) {
    filteredSeries = categoryService.search(
      filteredSeries.map(s => ({ ...s, cleanName: s.cleanName || s.name })),
      searchQuery
    );
  }
  
  // Sort
  filteredSeries = [...filteredSeries].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.imdbRating || 0) - (a.imdbRating || 0);
    } else if (sortBy === 'year') {
      return (b.year || '').localeCompare(a.year || '');
    } else {
      return (a.cleanName || a.name).localeCompare(b.cleanName || b.name);
    }
  });

  const renderSeriesItem = ({ item }) => {
    const displayName = item.cleanName || item.name;
    const rating = item.imdbRating || (item.rating ? parseFloat(item.rating) : null);
    
    return (
      <TouchableOpacity 
        style={styles.seriesCard}
        onPress={() => handleSeriesPress(item)}
      >
        <Image 
          source={{ uri: item.cover || 'https://via.placeholder.com/200x300/1e293b/64748b?text=No+Cover' }}
          style={styles.seriesCover}
          resizeMode="cover"
        />
        <View style={styles.seriesInfo}>
          <Text style={styles.seriesTitle} numberOfLines={2}>{displayName}</Text>
          <View style={styles.seriesMeta}>
            {item.year && (
              <Text style={styles.yearText}>📅 {item.year.substring(0, 4)}</Text>
            )}
            {rating && (
              <Text style={styles.ratingText}>⭐ {rating.toFixed(1)}</Text>
            )}
          </View>
          {item.genres && item.genres.length > 0 && (
            <Text style={styles.genresText} numberOfLines={1}>
              {item.genres.slice(0, 2).join(' · ')}
            </Text>
          )}
          {item.status && (
            <Text style={styles.statusText}>
              {item.status === 'Terminée' ? '✓ Terminée' : '▶ En cours'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎭 Séries</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Chargement des séries...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎭 Séries</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une série..."
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
          renderItem={({ item }) => (
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
          )}
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
        📊 {filteredSeries.length} série{filteredSeries.length > 1 ? 's' : ''}
        {selectedGenre !== 'Tout' && ` · ${selectedGenre}`}
        {minRating > 0 && ` · ${minRating}+ ⭐`}
      </Text>

      {/* Series Grid */}
      <FlatList
        data={filteredSeries}
        renderItem={renderSeriesItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#0f172a',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
  },
  backBtnText: {
    fontSize: 24,
    color: '#06b6d4',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#06b6d4',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  searchIcon: { fontSize: 20, marginRight: 10 },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
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
  gridContainer: {
    padding: 10,
  },
  seriesCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    overflow: 'hidden',
    maxWidth: '31%',
  },
  seriesCover: {
    width: '100%',
    aspectRatio: 2/3,
    backgroundColor: '#0f172a',
  },
  seriesInfo: {
    padding: 10,
  },
  seriesTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  seriesMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  yearText: {
    fontSize: 11,
    color: '#94a3b8',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 11,
    color: '#fbbf24',
    fontWeight: '700',
  },
  genresText: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 10,
    color: '#06b6d4',
    fontWeight: '700',
  },
});

export default SeriesScreen;
