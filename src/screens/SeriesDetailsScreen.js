import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  FlatList
} from 'react-native';
import { xtreamService } from '../services';

const SeriesDetailsScreen = ({ navigation, route }) => {
  const { series, seriesInfo: initialInfo } = route.params;
  const [seriesInfo, setSeriesInfo] = useState(initialInfo || null);
  const [loading, setLoading] = useState(!initialInfo);
  const [selectedSeason, setSelectedSeason] = useState(null);

  useEffect(() => {
    if (!initialInfo) {
      loadSeriesInfo();
    } else {
      // Extract first season
      const seasons = Object.keys(seriesInfo.episodes || {});
      if (seasons.length > 0) {
        setSelectedSeason(seasons[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (seriesInfo && !selectedSeason) {
      const seasons = Object.keys(seriesInfo.episodes || {});
      if (seasons.length > 0) {
        setSelectedSeason(seasons[0]);
      }
    }
  }, [seriesInfo]);

  const loadSeriesInfo = async () => {
    try {
      setLoading(true);
      const info = await xtreamService.getSeriesInfo(series.id);
      setSeriesInfo(info);
      
      const seasons = Object.keys(info.episodes || {});
      if (seasons.length > 0) {
        setSelectedSeason(seasons[0]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement détails série:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodePress = (episode) => {
    // Build the episode stream URL
    const streamUrl = episode.container_extension 
      ? xtreamService.getEpisodeStreamUrl(episode.id, episode.container_extension)
      : episode.info?.video || '';

    navigation.navigate('Player', {
      channel: {
        stream_id: episode.id,
        name: `${series.name} - ${episode.title || `Episode ${episode.episode_num}`}`,
        stream_url: streamUrl,
        stream_type: 'series',
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>Détails</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  const seasons = seriesInfo?.episodes ? Object.keys(seriesInfo.episodes).sort() : [];
  const episodes = selectedSeason && seriesInfo?.episodes ? seriesInfo.episodes[selectedSeason] : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{series.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Series Banner/Cover */}
        {series.cover && (
          <Image 
            source={{ uri: series.cover }}
            style={styles.banner}
            resizeMode="cover"
          />
        )}

        {/* Series Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.seriesTitle}>{series.name}</Text>
          
          <View style={styles.metaRow}>
            {series.year && (
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>{series.year}</Text>
              </View>
            )}
            {series.rating && (
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>⭐ {series.rating}</Text>
              </View>
            )}
            {series.genre && (
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>{series.genre}</Text>
              </View>
            )}
          </View>

          {series.plot && (
            <View style={styles.plotContainer}>
              <Text style={styles.plotTitle}>Synopsis</Text>
              <Text style={styles.plotText}>{series.plot}</Text>
            </View>
          )}
        </View>

        {/* Season Selector */}
        {seasons.length > 0 && (
          <View style={styles.seasonContainer}>
            <Text style={styles.seasonTitle}>Saisons</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seasonScrollContent}
            >
              {seasons.map(season => (
                <TouchableOpacity
                  key={season}
                  style={[
                    styles.seasonChip,
                    selectedSeason === season && styles.seasonChipActive
                  ]}
                  onPress={() => setSelectedSeason(season)}
                >
                  <Text style={[
                    styles.seasonChipText,
                    selectedSeason === season && styles.seasonChipTextActive
                  ]}>
                    Saison {season}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Episodes List */}
        {episodes.length > 0 && (
          <View style={styles.episodesContainer}>
            <Text style={styles.episodesTitle}>
              {episodes.length} épisode{episodes.length > 1 ? 's' : ''}
            </Text>
            {episodes.map((episode, index) => (
              <TouchableOpacity 
                key={episode.id || index}
                style={styles.episodeCard}
                onPress={() => handleEpisodePress(episode)}
              >
                <View style={styles.episodeNumber}>
                  <Text style={styles.episodeNumberText}>{episode.episode_num}</Text>
                </View>
                <View style={styles.episodeInfo}>
                  <Text style={styles.episodeTitle}>
                    {episode.title || `Episode ${episode.episode_num}`}
                  </Text>
                  {episode.info?.plot && (
                    <Text style={styles.episodePlot} numberOfLines={2}>
                      {episode.info.plot}
                    </Text>
                  )}
                  {episode.info?.duration && (
                    <Text style={styles.episodeDuration}>
                      ⏱️ {episode.info.duration}
                    </Text>
                  )}
                </View>
                <View style={styles.playIcon}>
                  <Text style={styles.playIconText}>▶</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {episodes.length === 0 && (
          <View style={styles.noEpisodesContainer}>
            <Text style={styles.noEpisodesText}>
              Aucun épisode disponible pour cette saison
            </Text>
          </View>
        )}
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
    fontSize: 20,
    fontWeight: '900',
    color: '#06b6d4',
    flex: 1,
    marginHorizontal: 15,
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
  scrollView: {
    flex: 1,
  },
  banner: {
    width: '100%',
    height: 200,
    backgroundColor: '#1e293b',
  },
  infoContainer: {
    padding: 20,
  },
  seriesTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 15,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  metaChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  metaText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  plotContainer: {
    marginTop: 10,
  },
  plotTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  plotText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  seasonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  seasonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  seasonScrollContent: {
    paddingVertical: 5,
  },
  seasonChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  seasonChipActive: {
    backgroundColor: '#06b6d4',
  },
  seasonChipText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  seasonChipTextActive: {
    color: '#fff',
  },
  episodesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  episodesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 15,
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  episodeNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  episodeNumberText: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: '700',
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  episodePlot: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 4,
  },
  episodeDuration: {
    fontSize: 11,
    color: '#475569',
  },
  playIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  playIconText: {
    color: '#fff',
    fontSize: 14,
  },
  noEpisodesContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noEpisodesText: {
    color: '#64748b',
    fontSize: 16,
  },
});

export default SeriesDetailsScreen;
