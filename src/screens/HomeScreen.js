import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StorageService } from '../services';

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    checkCredentials();
  }, []);

  useEffect(() => {
    checkCredentials();
  }, []);

  const checkCredentials = async () => {
    try {
      const credentials = await StorageService.getCredentials();
      
      if (!credentials) {
        navigation.replace('Login');
        return;
      }

      setUserInfo({
        username: credentials.username || 'User',
        serverUrl: credentials.m3uUrl || '',
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading credentials:', error);
      setError(error.message || 'Failed to load credentials');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await StorageService.clearCredentials();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Erreur</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={checkCredentials}>
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
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>📺 NeoStream</Text>
          <Text style={styles.subtitle}>IPTV Player</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content - 3 Large Categories */}
      <View style={styles.mainContent}>
        
        {/* LIVE TV - Large Card */}
        <TouchableOpacity 
          style={[styles.categoryCard, styles.liveTVCard]}
          onPress={() => navigation.navigate('LiveTV')}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.iconEmoji}>📺</Text>
          </View>
          <Text style={styles.cardTitle}>LIVE TV</Text>
          <Text style={styles.cardSubtitle}>Chaînes en direct</Text>
        </TouchableOpacity>

        {/* Row with MOVIES and SERIES */}
        <View style={styles.rowContainer}>
          
          {/* MOVIES */}
          <TouchableOpacity 
            style={[styles.categoryCard, styles.moviesCard]}
            onPress={() => navigation.navigate('Movies')}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.iconEmoji}>🎬</Text>
            </View>
            <Text style={styles.cardTitle}>MOVIES</Text>
            <Text style={styles.cardSubtitle}>Films à la demande</Text>
          </TouchableOpacity>

          {/* SERIES */}
          <TouchableOpacity 
            style={[styles.categoryCard, styles.seriesCard]}
            onPress={() => navigation.navigate('Series')}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.iconEmoji}>🎭</Text>
            </View>
            <Text style={styles.cardTitle}>SERIES</Text>
            <Text style={styles.cardSubtitle}>Séries TV</Text>
          </TouchableOpacity>

        </View>

        {/* Additional Options Row */}
        <View style={styles.optionsRow}>
          
          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>👥</Text>
            <Text style={styles.optionText}>Profils</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>👤</Text>
            <Text style={styles.optionText}>Compte</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.optionIcon}>⚙️</Text>
            <Text style={styles.optionText}>Paramètres</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Connecté: {userInfo?.username || 'User'}
        </Text>
        <Text style={styles.footerText}>
          Expiration: Illimitée
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0a0e27' 
  },
  
  // Loading & Error
  loadingContainer: { 
    flex: 1, 
    backgroundColor: '#0a0e27', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    color: '#fff', 
    marginTop: 20, 
    fontSize: 16 
  },
  errorContainer: { 
    flex: 1, 
    backgroundColor: '#0a0e27', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 30 
  },
  errorEmoji: { 
    fontSize: 64, 
    marginBottom: 20 
  },
  errorTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#dc2626', 
    marginBottom: 15 
  },
  errorMessage: { 
    fontSize: 16, 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 30, 
    lineHeight: 24 
  },
  retryButton: { 
    backgroundColor: '#06b6d4', 
    paddingHorizontal: 30, 
    paddingVertical: 15, 
    borderRadius: 10, 
    marginBottom: 15 
  },
  retryText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  backButton: { 
    backgroundColor: '#1e293b', 
    paddingHorizontal: 30, 
    paddingVertical: 15, 
    borderRadius: 10 
  },
  backText: { 
    color: '#94a3b8', 
    fontSize: 16 
  },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 50, 
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  logo: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#06b6d4' 
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: { 
    backgroundColor: '#dc2626', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 10 
  },
  logoutText: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  
  // Main Content
  mainContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  
  // Category Cards
  categoryCard: {
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  liveTVCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#667eea',
  },
  
  moviesCard: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    backgroundColor: '#f093fb',
    flex: 1,
    marginRight: 10,
  },
  
  seriesCard: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    backgroundColor: '#4facfe',
    flex: 1,
    marginLeft: 10,
  },
  
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  
  cardIcon: {
    marginBottom: 15,
  },
  
  iconEmoji: {
    fontSize: 64,
  },
  
  cardTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  cardSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    fontWeight: '600',
  },
  
  // Options Row
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  
  optionCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  
  optionText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
});

export default HomeScreen;
