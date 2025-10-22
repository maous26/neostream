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
import { xtreamService } from '../services';

const SeriesScreen = ({ navigation }) => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [categories, setCategories] = useState(['Toutes']);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      setLoading(true);
      console.log('📺 Chargement des séries...');
      const seriesList = await xtreamService.getVODSeries();
      setSeries(seriesList);

      // Extract unique categories
      const uniqueCategories = ['Toutes', ...new Set(seriesList.map(s => s.category))];
      setCategories(uniqueCategories);

      console.log('✅ Séries chargées:', seriesList.length);
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

  const displayedSeries = series.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Toutes' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderSeriesItem = ({ item }) => (
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
        <Text style={styles.seriesTitle} numberOfLines={2}>{item.name}</Text>
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        )}
        {item.year && (
          <Text style={styles.yearText}>{item.year}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

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
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une série..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category && styles.categoryChipTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Series Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {displayedSeries.length} série{displayedSeries.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Series Grid */}
      <FlatList
        data={displayedSeries}
        renderItem={renderSeriesItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
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
    padding: 15,
    backgroundColor: '#0f172a',
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  categoryScroll: {
    backgroundColor: '#0f172a',
    maxHeight: 50,
  },
  categoryScrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  categoryChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#06b6d4',
  },
  categoryChipText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  countContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#0a0e27',
  },
  countText: {
    color: '#64748b',
    fontSize: 14,
  },
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
    padding: 8,
  },
  seriesTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    marginBottom: 4,
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 11,
  },
  yearText: {
    color: '#64748b',
    fontSize: 11,
  },
});

export default SeriesScreen;
