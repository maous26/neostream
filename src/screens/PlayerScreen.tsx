import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, Dimensions, NativeModules } from 'react-native';
import Video from 'react-native-video';
import axios from 'axios';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { Channel } from '../services/IPTVService';

const { URLResolver } = NativeModules;
const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Player: { channel: Channel };
};

type PlayerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Player'>;
type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;

type PlayerScreenProps = {
  navigation: PlayerScreenNavigationProp;
  route: PlayerScreenRouteProp;
};

const PlayerScreen = ({ route, navigation }: PlayerScreenProps) => {
  const { channel } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [cookieHeader, setCookieHeader] = useState<string | undefined>(undefined);

  // Stable headers reference
  const BASE_HEADERS = useMemo(() => ({
    'User-Agent': 'IPTVSmarters/1.1.1 (Linux; Android 11) ExoPlayerLib/2.13.2',
    'Accept': 'application/x-mpegURL, application/vnd.apple.mpegurl, */*',
    'Connection': 'keep-alive',
  } as const), []);

  // Compute base origin from the channel URL for optional same-origin hints
  const baseOrigin = useMemo(() => {
    try {
      const m = channel.url.match(/^(https?:\/\/[^/]+)/i)?.[1];
      return m;
    } catch {
      return undefined;
    }
  }, [channel.url]);

  const SAME_ORIGIN_HEADERS = useMemo(() => ({
    ...BASE_HEADERS,
    ...(baseOrigin ? { Origin: baseOrigin, Referer: `${baseOrigin}/` } : {}),
  } as const), [BASE_HEADERS, baseOrigin]);

  const resolveUrl = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if native module is available
      if (URLResolver && typeof URLResolver.resolveUrl === 'function') {
        console.log('🎯 Utilisation du module natif URLResolver...');
        let finalUrl = await URLResolver.resolveUrl(channel.url, BASE_HEADERS);
        console.log('🌐 URL résolue par le module natif:', finalUrl.substring(0, 100) + '...');
        
        // WORKAROUND: Remove .m3u8 extension to force ExoPlayer to detect as MPEG-TS
        // The server returns direct transport stream, not M3U8 playlist
        if (finalUrl.includes('.m3u8')) {
          finalUrl = finalUrl.replace('.m3u8', '.ts');
          console.log('🔧 Extension modifiée pour forcer la détection MPEG-TS');
        }
        
        setResolvedUrl(finalUrl);
        setCookieHeader(undefined);
        setLoading(false);
        return;
      }
      
      // Fallback: Use axios to follow redirects
      console.log('⚠️ Module natif non disponible, utilisation d\'axios...');
      console.log('🔗 URL originale:', channel.url);
      
      try {
        const response = await axios.head(channel.url, {
          headers: BASE_HEADERS,
          maxRedirects: 5,
          timeout: 5000,
          validateStatus: () => true, // Accept all status codes
        });
        
        // Get the final URL after redirects
        const finalUrl = response.request?.responseURL || channel.url;
        console.log('✅ URL finale après redirects:', finalUrl.substring(0, 100) + '...');
        
        setResolvedUrl(finalUrl);
        setCookieHeader(undefined);
        setLoading(false);
        
      } catch (axiosError: any) {
        console.error('❌ Erreur axios:', axiosError.message);
        console.log('⚠️ Utilisation de l\'URL originale');
        setResolvedUrl(channel.url);
        setCookieHeader(undefined);
        setLoading(false);
      }
      
    } catch (e: any) {
      console.error('❌ Résolution échouée:', e?.message || e);
      console.log('⚠️ Utilisation de l\'URL originale');
      setResolvedUrl(channel.url);
      setCookieHeader(undefined);
      setLoading(false);
    }
  }, [channel.url, BASE_HEADERS]);

  useEffect(() => {
    console.log('🎬 PlayerScreen - Lecture de:', channel.name);
    console.log('🔗 URL d\'origine:', channel.url);
    resolveUrl();
  }, [resolveUrl, channel.name, channel.url]);

  const handleLoad = () => {
    console.log('✅ Vidéo chargée avec succès');
    setLoading(false);
    setError(null);
  };

  const handleError = (e: any) => {
    console.error('❌ Erreur de lecture:', JSON.stringify(e, null, 2));
    let errorMsg = 'Impossible de lire cette chaîne';
    if (e?.error?.localizedDescription) errorMsg = e.error.localizedDescription;
    else if (e?.error?.code) errorMsg = `Erreur code: ${e.error.code}`;
    setError(errorMsg);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Bouton retour */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>⬅️ Retour</Text>
      </TouchableOpacity>

      {/* Nom de la chaîne */}
      <View style={styles.channelHeader}>
        <Text style={styles.channelName}>{channel.name}</Text>
      </View>

      {/* Video Player */}
      {resolvedUrl ? (
        <Video
          source={{
            uri: resolvedUrl,
            // Don't specify type - let ExoPlayer auto-detect
            // This allows it to handle both M3U8 playlists and direct MPEG-TS streams
            headers: {
              ...BASE_HEADERS,
              ...(cookieHeader ? { Cookie: cookieHeader } : {}),
            } as any,
          }}
          style={styles.video}
          resizeMode="contain"
          onLoadStart={() => {
            console.log('▶️ Démarrage du chargement... URL:', resolvedUrl);
            console.log('🧾 Headers envoyés:', { ...BASE_HEADERS, ...(cookieHeader ? { Cookie: cookieHeader } : {}) });
            setLoading(true);
          }}
          onLoad={handleLoad}
          onError={handleError}
          controls
          ignoreSilentSwitch="ignore"
          playInBackground={false}
          playWhenInactive={false}
          allowsExternalPlayback={false}
          repeat={false}
          onBuffer={(data: any) => {
            console.log('🔄 Buffering:', data.isBuffering);
            setLoading(data.isBuffering);
          }}
        />
      ) : null}

      {/* Loading */}
      {loading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>
            {resolvedUrl ? '📡 Chargement...' : '🔄 Résolution de l\'URL...'}
          </Text>
        </View>
      )}

      {/* Erreur */}
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorEmoji}>❌</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorUrl} numberOfLines={2} ellipsizeMode="middle">{resolvedUrl || channel.url}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={resolveUrl}
          >
            <Text style={styles.retryText}>🔄 Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: width,
    height: height,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  channelHeader: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  channelName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '700',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 5,
  },
  errorEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '700',
  },
  errorUrl: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  errorDetails: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
});

export default PlayerScreen;
