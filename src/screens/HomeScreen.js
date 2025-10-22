import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { IPTVService } from '../services/IPTVService';
import { StorageService } from '../services/StorageService';

const HomeScreen = ({ navigation }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const credentials = await StorageService.getCredentials();
      
      if (!credentials) {
        navigation.replace('Login');
        return;
      }

      const channelList = await IPTVService.getChannels(credentials);
      setChannels(channelList);
      
      // Extract unique categories
      const cats = ['All', ...new Set(channelList.map(ch => ch.category))];
      setCategories(cats);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading channels:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await StorageService.clearCredentials();
    navigation.replace('Login');
  };

  const filteredChannels = selectedCategory === 'All' 
    ? channels 
    : channels.filter(ch => ch.category === selectedCategory);

  const renderChannel = ({ item }) => (
    <TouchableOpacity style={styles.channelCard}>
      <View style={styles.channelEmoji}>
        <Text style={styles.emojiText}>{item.emoji}</Text>
      </View>
      <View style={styles.channelInfo}>
        <Text style={styles.channelName}>{item.name}</Text>
        <Text style={styles.channelCategory}>{item.category}</Text>
        <Text style={styles.channelQuality}>{item.quality}</Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Text style={styles.playText}>▶</Text>
      </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>NeoStream 📺</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item}
        style={styles.categoryList}
        showsHorizontalScrollIndicator={false}
      />

      {/* Channels */}
      <FlatList
        data={filteredChannels}
        renderItem={renderChannel}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.channelList}
      />

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 {filteredChannels.length} chaînes disponibles
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 20, fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#0f172a' },
  title: { fontSize: 28, fontWeight: '900', color: '#06b6d4' },
  logoutButton: { backgroundColor: '#dc2626', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  logoutText: { color: '#fff', fontWeight: '700' },
  categoryList: { maxHeight: 50, paddingHorizontal: 10, marginVertical: 15 },
  categoryButton: { backgroundColor: '#1e293b', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginHorizontal: 5 },
  categoryButtonActive: { backgroundColor: '#06b6d4' },
  categoryText: { color: '#94a3b8', fontWeight: '700' },
  categoryTextActive: { color: '#fff' },
  channelList: { paddingHorizontal: 20 },
  channelCard: { flexDirection: 'row', backgroundColor: '#1a0a2e', borderRadius: 20, padding: 15, marginBottom: 15, alignItems: 'center', borderWidth: 2, borderColor: '#8b5cf6' },
  channelEmoji: { width: 60, height: 60, backgroundColor: '#2d1b69', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  emojiText: { fontSize: 32 },
  channelInfo: { flex: 1 },
  channelName: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 5 },
  channelCategory: { fontSize: 14, color: '#a78bfa', fontWeight: '700', marginBottom: 3 },
  channelQuality: { fontSize: 12, color: '#eab308', fontWeight: '700' },
  playButton: { backgroundColor: '#8b5cf6', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  playText: { color: '#fff', fontSize: 20 },
  infoBox: { backgroundColor: '#0c4a6e', padding: 15, margin: 20, borderRadius: 15 },
  infoText: { color: '#06b6d4', textAlign: 'center', fontWeight: '700', fontSize: 16 },
});

export default HomeScreen;
