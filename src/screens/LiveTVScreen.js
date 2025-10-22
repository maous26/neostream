import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import { xtreamService } from '../services/XtreamCodesService';
import { StorageService, categoryService } from '../services';

const LiveTVScreen = ({ navigation }) => {
  const [channels, setChannels] = useState([]);
  const [enrichedChannels, setEnrichedChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [selectedQuality, setSelectedQuality] = useState('Tout');
  const [error, setError] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setError(null);
      const credentials = await StorageService.getCredentials();
      
      if (!credentials) {
        navigation.replace('Login');
        return;
      }

      console.log('📺 Chargement des chaînes live...');
      
      const channelList = await xtreamService.getChannels({
        serverUrl: credentials.m3uUrl,
        username: credentials.username || '',
        password: credentials.password || '',
      });
      
      console.log('✅ Chaînes chargées:', channelList.length);
      
      setChannels(channelList);
      
      // Enrichir avec CategoryService (nettoyage, catégorisation intelligente)
      console.log('🎯 Classification intelligente des chaînes...');
      const enriched = channelList.map(ch => categoryService.categorizeChannel(ch));
      setEnrichedChannels(enriched);
      
      // Extraire les catégories uniques triées
      const uniqueCats = new Set(enriched.map(ch => ch.category));
      const sortedCats = Array.from(uniqueCats).sort();
      setCategories(['Tout', ...sortedCats]);
      
      console.log(`✨ ${enriched.length} chaînes enrichies dans ${sortedCats.length} catégories`);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement chaînes:', error);
      setError(error.message || 'Impossible de charger les chaînes');
      setLoading(false);
    }
  };

  // Utiliser les chaînes enrichies si disponibles
  const channelsToDisplay = enrichedChannels.length > 0 ? enrichedChannels : channels;

  // Filter by category
  let filteredChannels = selectedCategory === 'Tout' 
    ? channelsToDisplay 
    : channelsToDisplay.filter(ch => ch.category === selectedCategory);
  
  // Filter by quality
  if (selectedQuality !== 'Tout') {
    filteredChannels = filteredChannels.filter(ch => ch.quality === selectedQuality);
  }
  
  // Filter by search (utilise cleanName si disponible)
  if (searchQuery.trim()) {
    filteredChannels = categoryService.search(
      filteredChannels.map(ch => ({ ...ch, cleanName: ch.cleanName || ch.name })),
      searchQuery
    );
  }
  
  // Limit for performance
  const displayedChannels = filteredChannels.slice(0, displayLimit);
  const hasMore = filteredChannels.length > displayLimit;

  const renderChannel = ({ item }) => {
    const displayName = item.cleanName || item.name;
    const qualityBadge = item.quality && item.quality !== 'SD' ? item.quality : null;
    
    return (
      <TouchableOpacity 
        style={styles.channelCard}
        onPress={() => navigation.navigate('Player', { channel: item })}
      >
        {item.logo ? (
          <Image 
            source={{ uri: item.logo }} 
            style={styles.channelLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.channelEmoji}>
            <Text style={styles.emojiText}>{item.emoji || '📺'}</Text>
          </View>
        )}
        <View style={styles.channelInfo}>
          <Text style={styles.channelName} numberOfLines={1}>{displayName}</Text>
          <View style={styles.channelMeta}>
            <Text style={styles.channelCategory}>{item.category || 'Général'}</Text>
            {qualityBadge && (
              <View style={styles.qualityBadge}>
                <Text style={styles.qualityText}>{qualityBadge}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.playButton}>
          <Text style={styles.playText}>▶</Text>
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.loadingText}>Chargement des chaînes live...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Erreur</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadChannels}>
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
        <Text style={styles.title}>📺 Chaînes Live</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
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

      {/* Quality Filter */}
      <View style={styles.qualityFilter}>
        <Text style={styles.filterLabel}>Qualité:</Text>
        {['Tout', 'HD', 'FHD', '4K'].map(quality => (
          <TouchableOpacity
            key={quality}
            style={[
              styles.qualityButton,
              selectedQuality === quality && styles.qualityButtonActive
            ]}
            onPress={() => setSelectedQuality(quality)}
          >
            <Text style={[
              styles.qualityButtonText,
              selectedQuality === quality && styles.qualityButtonTextActive
            ]}>
              {quality}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <Text style={styles.statsText}>
        📊 {displayedChannels.length} chaîne{displayedChannels.length > 1 ? 's' : ''} 
        {selectedCategory !== 'Tout' && ` · ${selectedCategory}`}
        {selectedQuality !== 'Tout' && ` · ${selectedQuality}`}
      </Text>

      {/* Channels */}
      <FlatList
        data={displayedChannels}
        renderItem={renderChannel}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.channelList}
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={() => setDisplayLimit(prev => prev + 100)}
            >
              <Text style={styles.loadMoreText}>
                📥 Charger plus ({displayedChannels.length}/{filteredChannels.length})
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 {displayedChannels.length} / {filteredChannels.length} chaînes
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
  channelList: { paddingHorizontal: 20 },
  channelCard: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 15, padding: 15, marginBottom: 15, alignItems: 'center' },
  channelLogo: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  channelEmoji: { width: 60, height: 60, backgroundColor: '#334155', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  emojiText: { fontSize: 32 },
  channelInfo: { flex: 1 },
  channelName: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 5 },
  channelMeta: { flexDirection: 'row', alignItems: 'center' },
  channelCategory: { fontSize: 14, color: '#94a3b8', fontWeight: '600', marginRight: 10 },
  qualityBadge: { backgroundColor: '#06b6d4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  qualityText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  qualityFilter: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginVertical: 10 },
  filterLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '700', marginRight: 10 },
  qualityButton: { backgroundColor: '#1e293b', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginRight: 8 },
  qualityButtonActive: { backgroundColor: '#06b6d4' },
  qualityButtonText: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
  qualityButtonTextActive: { color: '#fff', fontWeight: '900' },
  statsText: { color: '#64748b', fontSize: 13, fontWeight: '600', paddingHorizontal: 20, marginBottom: 10 },
  playButton: { backgroundColor: '#06b6d4', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  playText: { color: '#fff', fontSize: 20 },
  loadMoreButton: { backgroundColor: '#06b6d4', padding: 20, margin: 20, borderRadius: 15, alignItems: 'center' },
  loadMoreText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  infoBox: { backgroundColor: '#0f172a', padding: 15, margin: 20, borderRadius: 15 },
  infoText: { color: '#06b6d4', textAlign: 'center', fontWeight: '700' },
});

export default LiveTVScreen;
