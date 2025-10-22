import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import { xtreamService } from '../services/XtreamCodesService';
import { StorageService } from '../services';

const HomeScreen = ({ navigation }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(100); // Show 100 channels at a time
  const [searchQuery, setSearchQuery] = useState(''); // Search functionality

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

      console.log('🔄 Loading channels with Xtream Codes...');
      console.log('🌐 Server URL from storage:', credentials.m3uUrl);
      
      // Get channels (this will authenticate automatically)
      const channelList = await xtreamService.getChannels({
        serverUrl: credentials.m3uUrl,
        username: credentials.username || '',
        password: credentials.password || '',
      });
      console.log('📺 Received channels:', channelList.length);
      
      setChannels(channelList);
      
      // Extract unique categories
      const cats = ['All', ...new Set(channelList.map(ch => ch.category || 'Other'))];
      console.log('📂 Total categories found:', cats.length);
      console.log('📂 Categories list:', JSON.stringify(cats));
      console.log('📺 Sample channel:', JSON.stringify(channelList[0]));
      console.log('📺 All categories from channels:', channelList.map(ch => ch.category).slice(0, 20));
      setCategories(cats);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading channels:', error);
      setError(error.message || 'Failed to load channels');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await StorageService.clearCredentials();
    navigation.replace('Login');
  };

  // Filter by category
  let filteredChannels = selectedCategory === 'All' 
    ? channels 
    : channels.filter(ch => (ch.category || 'Other') === selectedCategory);
  
  // Filter by search query
  if (searchQuery.trim()) {
    filteredChannels = filteredChannels.filter(ch => 
      ch.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Limit displayed channels for performance
  const displayedChannels = filteredChannels.slice(0, displayLimit);
  const hasMore = filteredChannels.length > displayLimit;

  const renderChannel = ({ item }) => (
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
        <Text style={styles.channelName}>{item.name}</Text>
        <Text style={styles.channelCategory}>{item.category || 'General'}</Text>
        <Text style={styles.channelQuality}>{item.quality || 'Live'}</Text>
      </View>
      <View style={styles.playButton}>
        <Text style={styles.playText}>▶</Text>
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
        <Text style={styles.loadingText}>Chargement des chaînes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Erreur de chargement</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadChannels}>
          <Text style={styles.retryText}>🔄 Réessayer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleLogout}>
          <Text style={styles.backText}>← Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>NeoStream 📺</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une chaîne..."
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
                📥 Charger 100 chaînes de plus ({displayedChannels.length}/{filteredChannels.length})
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Affichage de {displayedChannels.length} / {filteredChannels.length} chaînes
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 20, fontSize: 16 },
  errorContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 30 },
  errorEmoji: { fontSize: 64, marginBottom: 20 },
  errorTitle: { fontSize: 24, fontWeight: 'bold', color: '#dc2626', marginBottom: 15 },
  errorMessage: { fontSize: 16, color: '#fff', textAlign: 'center', marginBottom: 30, lineHeight: 24 },
  retryButton: { backgroundColor: '#06b6d4', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 10, marginBottom: 15 },
  retryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButton: { backgroundColor: '#1e293b', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 10 },
  backText: { color: '#94a3b8', fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#0f172a' },
  title: { fontSize: 28, fontWeight: '900', color: '#06b6d4' },
  logoutButton: { backgroundColor: '#dc2626', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  logoutText: { color: '#fff', fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', marginHorizontal: 20, marginVertical: 10, paddingHorizontal: 15, borderRadius: 15, borderWidth: 2, borderColor: '#334155' },
  searchIcon: { fontSize: 20, marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 12 },
  clearIcon: { fontSize: 24, color: '#64748b', paddingHorizontal: 10 },
  categoryList: { maxHeight: 70, paddingHorizontal: 10, marginVertical: 15, backgroundColor: '#0f172a' },
  categoryButton: { backgroundColor: '#1e293b', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 25, marginHorizontal: 8, borderWidth: 2, borderColor: '#334155' },
  categoryButtonActive: { backgroundColor: '#06b6d4', borderColor: '#06b6d4' },
  categoryText: { color: '#cbd5e1', fontWeight: '700', fontSize: 16 },
  categoryTextActive: { color: '#fff', fontWeight: '900' },
  channelList: { paddingHorizontal: 20 },
  channelCard: { flexDirection: 'row', backgroundColor: '#1a0a2e', borderRadius: 20, padding: 15, marginBottom: 15, alignItems: 'center', borderWidth: 2, borderColor: '#8b5cf6' },
  channelLogo: { width: 60, height: 60, borderRadius: 10, marginRight: 15, backgroundColor: '#2d1b69' },
  channelEmoji: { width: 60, height: 60, backgroundColor: '#2d1b69', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  emojiText: { fontSize: 32 },
  channelInfo: { flex: 1 },
  channelName: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 5 },
  channelCategory: { fontSize: 14, color: '#a78bfa', fontWeight: '700', marginBottom: 3 },
  channelQuality: { fontSize: 12, color: '#eab308', fontWeight: '700' },
  playButton: { backgroundColor: '#8b5cf6', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  playText: { color: '#fff', fontSize: 20 },
  loadMoreButton: { backgroundColor: '#16a34a', padding: 20, margin: 20, borderRadius: 15, alignItems: 'center' },
  loadMoreText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  infoBox: { backgroundColor: '#0c4a6e', padding: 15, margin: 20, borderRadius: 15 },
  infoText: { color: '#06b6d4', textAlign: 'center', fontWeight: '700', fontSize: 16 },
});

export default HomeScreen;
