import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { CacheService, StorageService } from '../services';

const SettingsScreen = ({ navigation }) => {
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    try {
      setLoading(true);
      const stats = await CacheService.getStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatAge = (ms) => {
    const hours = Math.floor(ms / 3600000);
    if (hours < 1) return 'Moins d\'1h';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}j ${hours % 24}h`;
  };

  const handleClearAllCache = () => {
    Alert.alert(
      'Vider tout le cache',
      'Êtes-vous sûr de vouloir supprimer tout le cache ? Les données seront rechargées à la prochaine ouverture de chaque section.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await CacheService.clearAll();
            await loadCacheStats();
            setClearing(false);
            Alert.alert('Succès', 'Le cache a été vidé');
          },
        },
      ]
    );
  };

  const handleClearLiveTVCache = () => {
    Alert.alert(
      'Vider le cache Live TV',
      'Les chaînes seront rechargées à la prochaine ouverture.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await CacheService.clearLiveTVCache();
            await loadCacheStats();
            setClearing(false);
            Alert.alert('Succès', 'Cache Live TV vidé');
          },
        },
      ]
    );
  };

  const handleClearVODCache = () => {
    Alert.alert(
      'Vider le cache VOD',
      'Les films et séries seront rechargés à la prochaine ouverture.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await CacheService.clearVODCache();
            await loadCacheStats();
            setClearing(false);
            Alert.alert('Succès', 'Cache VOD vidé');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ? Toutes les données en cache seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await CacheService.clearAll();
            await StorageService.clearCredentials();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚙️ Paramètres</Text>
        <TouchableOpacity onPress={loadCacheStats} style={styles.refreshBtn}>
          <Text style={styles.refreshBtnText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Cache Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Statistiques du Cache</Text>
          
          {loading ? (
            <ActivityIndicator size="small" color="#06b6d4" style={styles.loader} />
          ) : (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Éléments en cache</Text>
                <Text style={styles.statValue}>{cacheStats?.totalItems || 0}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Taille totale</Text>
                <Text style={styles.statValue}>
                  {formatBytes(cacheStats?.totalSize || 0)}
                </Text>
              </View>

              {cacheStats?.items && cacheStats.items.length > 0 && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Détails par type :</Text>
                  {cacheStats.items.map((item, index) => (
                    <View key={index} style={styles.detailRow}>
                      <Text style={styles.detailKey}>{item.key}</Text>
                      <Text style={styles.detailValue}>
                        {formatAge(item.age)} • {formatBytes(item.size)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Cache Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗑️ Gestion du Cache</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleClearLiveTVCache}
            disabled={clearing}
          >
            <Text style={styles.actionButtonIcon}>📺</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>Vider le cache Live TV</Text>
              <Text style={styles.actionButtonSubtext}>
                Recharge les chaînes à la prochaine ouverture
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleClearVODCache}
            disabled={clearing}
          >
            <Text style={styles.actionButtonIcon}>🎬</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>Vider le cache VOD</Text>
              <Text style={styles.actionButtonSubtext}>
                Recharge films et séries à la prochaine ouverture
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleClearAllCache}
            disabled={clearing}
          >
            <Text style={styles.actionButtonIcon}>🗑️</Text>
            <View style={styles.actionButtonContent}>
              <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                Vider tout le cache
              </Text>
              <Text style={styles.actionButtonSubtext}>
                Supprime toutes les données en cache
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Informations</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Version de l'application</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Durée de cache par défaut</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>Live TV: 6h</Text>
              <Text style={styles.infoValue}>Films: 24h</Text>
              <Text style={styles.infoValue}>Séries: 24h</Text>
            </View>
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Compte</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.actionButtonIcon}>🚪</Text>
            <View style={styles.actionButtonContent}>
              <Text style={[styles.actionButtonText, styles.logoutText]}>
                Se déconnecter
              </Text>
              <Text style={styles.actionButtonSubtext}>
                Supprime toutes les données et retourne à l'écran de connexion
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Space */}
        <View style={styles.footerSpace} />
      </ScrollView>
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
  refreshBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
  },
  refreshBtnText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
  },
  loader: {
    marginVertical: 20,
  },
  statCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06b6d4',
  },
  detailsContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 15,
    marginTop: 5,
  },
  detailsTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailKey: {
    fontSize: 12,
    color: '#94a3b8',
  },
  detailValue: {
    fontSize: 11,
    color: '#64748b',
  },
  actionButton: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  actionButtonSubtext: {
    fontSize: 12,
    color: '#64748b',
  },
  actionButtonDanger: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  actionButtonTextDanger: {
    color: '#ef4444',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  logoutText: {
    color: '#f59e0b',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  infoValueContainer: {
    gap: 3,
  },
  footerSpace: {
    height: 30,
  },
});

export default SettingsScreen;
