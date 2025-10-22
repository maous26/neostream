import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
}

interface ChunkedCacheMetadata {
  totalChunks: number;
  timestamp: number;
  expiresAt: number;
  totalItems: number;
}

class CacheService {
  private static readonly CACHE_PREFIX = '@neostream_cache_';
  private static readonly CHUNK_SIZE = 100; // Reduced to 100 items per chunk for emulator storage limits
  private static cacheDisabled = false; // Flag to disable cache if storage is full
  
  // Cache keys
  private static readonly KEYS = {
    LIVE_CHANNELS: 'live_channels',
    VOD_MOVIES: 'vod_movies',
    VOD_SERIES: 'vod_series',
    SERIES_INFO: 'series_info_',
  };

  // Default TTL values (in milliseconds)
  private static readonly DEFAULT_TTL = {
    LIVE_CHANNELS: 6 * 60 * 60 * 1000,  // 6 hours
    VOD_MOVIES: 24 * 60 * 60 * 1000,    // 24 hours
    VOD_SERIES: 24 * 60 * 60 * 1000,    // 24 hours
    SERIES_INFO: 48 * 60 * 60 * 1000,   // 48 hours
  };

  /**
   * Save large array data in chunks to avoid CursorWindow limit
   */
  private static async setLargeArray<T>(key: string, data: T[], ttl?: number): Promise<void> {
    // Check if cache is disabled due to previous storage errors
    if (this.cacheDisabled) {
      console.log('⚠️ Cache disabled due to storage issues, skipping save');
      return;
    }

    try {
      const now = Date.now();
      const expiresAt = now + (ttl || 24 * 60 * 60 * 1000);
      
      // Split data into chunks
      const chunks: T[][] = [];
      for (let i = 0; i < data.length; i += this.CHUNK_SIZE) {
        chunks.push(data.slice(i, i + this.CHUNK_SIZE));
      }

      // Save metadata
      const metadata: ChunkedCacheMetadata = {
        totalChunks: chunks.length,
        timestamp: now,
        expiresAt,
        totalItems: data.length,
      };

      const metadataKey = this.CACHE_PREFIX + key + '_metadata';
      await AsyncStorage.setItem(metadataKey, JSON.stringify(metadata));

      // Save each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunkKey = this.CACHE_PREFIX + key + `_chunk_${i}`;
        await AsyncStorage.setItem(chunkKey, JSON.stringify(chunks[i]));
      }

      console.log(`✅ Cache saved: ${key} (${data.length} items in ${chunks.length} chunks, expires in ${Math.round((expiresAt - now) / 3600000)}h)`);
    } catch (error: any) {
      console.error('❌ Cache save error (large array):', error);
      
      // If disk is full, disable cache and clear all
      if (error.message && (error.message.includes('SQLITE_FULL') || error.message.includes('disk is full'))) {
        console.log('⚠️ Storage full detected - DISABLING CACHE for this session');
        this.cacheDisabled = true; // Disable cache to prevent further errors
        
        try {
          await this.clearAll();
          console.log('✅ Cache cleared - App will work without cache until restart');
        } catch (clearError) {
          console.error('❌ Failed to clear cache:', clearError);
        }
      }
      
      // Don't throw - just continue without cache
      console.log('ℹ️ Continuing without cache for:', key);
    }
  }

  /**
   * Get large array data from chunks
   */
  private static async getLargeArray<T>(key: string): Promise<T[] | null> {
    // If cache is disabled, return null immediately
    if (this.cacheDisabled) {
      return null;
    }

    try {
      // Get metadata
      const metadataKey = this.CACHE_PREFIX + key + '_metadata';
      const metadataString = await AsyncStorage.getItem(metadataKey);
      
      if (!metadataString) {
        console.log(`ℹ️ Cache miss: ${key}`);
        return null;
      }

      const metadata: ChunkedCacheMetadata = JSON.parse(metadataString);
      const now = Date.now();

      // Check if cache is expired
      if (now > metadata.expiresAt) {
        console.log(`⏰ Cache expired: ${key}`);
        await this.deleteLargeArray(key);
        return null;
      }

      // Load all chunks
      const allData: T[] = [];
      for (let i = 0; i < metadata.totalChunks; i++) {
        const chunkKey = this.CACHE_PREFIX + key + `_chunk_${i}`;
        const chunkString = await AsyncStorage.getItem(chunkKey);
        
        if (chunkString) {
          const chunk: T[] = JSON.parse(chunkString);
          allData.push(...chunk);
        }
      }

      const ageInHours = Math.round((now - metadata.timestamp) / 3600000);
      console.log(`✅ Cache hit: ${key} (${allData.length} items from ${metadata.totalChunks} chunks, age: ${ageInHours}h)`);
      
      return allData;
    } catch (error: any) {
      console.error('❌ Cache get error (large array):', error);
      
      // If corrupted or disk full, clear the cache and disable it
      if (error.message && (error.message.includes('SQLITE') || error.message.includes('JSON') || error.message.includes('disk'))) {
        console.log('⚠️ Cache corrupted or storage issue, disabling cache');
        this.cacheDisabled = true;
        
        try {
          await this.deleteLargeArray(key);
        } catch (e) {
          console.error('Failed to delete corrupted cache:', e);
        }
      }
      
      return null;
    }
  }

  /**
   * Delete large array cache (metadata + all chunks)
   */
  private static async deleteLargeArray(key: string): Promise<void> {
    try {
      // Get metadata to know how many chunks to delete
      const metadataKey = this.CACHE_PREFIX + key + '_metadata';
      const metadataString = await AsyncStorage.getItem(metadataKey);
      
      if (metadataString) {
        const metadata: ChunkedCacheMetadata = JSON.parse(metadataString);
        
        // Delete all chunks
        const keysToDelete = [metadataKey];
        for (let i = 0; i < metadata.totalChunks; i++) {
          keysToDelete.push(this.CACHE_PREFIX + key + `_chunk_${i}`);
        }
        
        await AsyncStorage.multiRemove(keysToDelete);
        console.log(`🗑️ Cache deleted: ${key} (${metadata.totalChunks} chunks)`);
      } else {
        // Just try to delete metadata
        await AsyncStorage.removeItem(metadataKey);
      }
    } catch (error) {
      console.error('❌ Cache delete error (large array):', error);
    }
  }

  /**
   * Save data to cache with expiration
   */
  static async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      const now = Date.now();
      const expiresAt = now + (ttl || 24 * 60 * 60 * 1000); // Default 24h
      
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: now,
        expiresAt,
      };

      const cacheKey = this.CACHE_PREFIX + key;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      
      console.log(`✅ Cache saved: ${key} (expires in ${Math.round((expiresAt - now) / 3600000)}h)`);
    } catch (error) {
      console.error('❌ Cache save error:', error);
    }
  }

  /**
   * Get data from cache if not expired
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cachedString = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedString) {
        console.log(`ℹ️ Cache miss: ${key}`);
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cachedString);
      const now = Date.now();

      // Check if cache is expired
      if (now > cacheItem.expiresAt) {
        console.log(`⏰ Cache expired: ${key}`);
        await this.delete(key);
        return null;
      }

      const ageInHours = Math.round((now - cacheItem.timestamp) / 3600000);
      console.log(`✅ Cache hit: ${key} (age: ${ageInHours}h)`);
      return cacheItem.data;
    } catch (error) {
      console.error('❌ Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete specific cache entry
   */
  static async delete(key: string): Promise<void> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      await AsyncStorage.removeItem(cacheKey);
      console.log(`🗑️ Cache deleted: ${key}`);
    } catch (error) {
      console.error('❌ Cache delete error:', error);
    }
  }

  /**
   * Clear all cache
   */
  static async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`🗑️ All cache cleared (${cacheKeys.length} items)`);
    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }

  /**
   * Check if cache exists and is valid
   */
  static async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * Get cache age in milliseconds
   */
  static async getAge(key: string): Promise<number | null> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cachedString = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedString) {
        return null;
      }

      const cacheItem: CacheItem<any> = JSON.parse(cachedString);
      return Date.now() - cacheItem.timestamp;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<{
    totalItems: number;
    totalSize: number;
    items: Array<{ key: string; age: number; size: number }>;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      const items = await Promise.all(
        cacheKeys.map(async (key) => {
          const value = await AsyncStorage.getItem(key);
          const size = value ? new Blob([value]).size : 0;
          const cacheItem: CacheItem<any> = value ? JSON.parse(value) : null;
          const age = cacheItem ? Date.now() - cacheItem.timestamp : 0;
          
          return {
            key: key.replace(this.CACHE_PREFIX, ''),
            age,
            size,
          };
        })
      );

      const totalSize = items.reduce((sum, item) => sum + item.size, 0);

      return {
        totalItems: items.length,
        totalSize,
        items,
      };
    } catch (error) {
      console.error('❌ Cache stats error:', error);
      return { totalItems: 0, totalSize: 0, items: [] };
    }
  }

  // Specific cache methods for each data type

  static async saveLiveChannels(channels: any[]): Promise<void> {
    await this.setLargeArray(this.KEYS.LIVE_CHANNELS, channels, this.DEFAULT_TTL.LIVE_CHANNELS);
  }

  static async getLiveChannels(): Promise<any[] | null> {
    return await this.getLargeArray<any>(this.KEYS.LIVE_CHANNELS);
  }

  static async saveVODMovies(movies: any[]): Promise<void> {
    await this.setLargeArray(this.KEYS.VOD_MOVIES, movies, this.DEFAULT_TTL.VOD_MOVIES);
  }

  static async getVODMovies(): Promise<any[] | null> {
    return await this.getLargeArray<any>(this.KEYS.VOD_MOVIES);
  }

  static async saveVODSeries(series: any[]): Promise<void> {
    await this.setLargeArray(this.KEYS.VOD_SERIES, series, this.DEFAULT_TTL.VOD_SERIES);
  }

  static async getVODSeries(): Promise<any[] | null> {
    return await this.getLargeArray<any>(this.KEYS.VOD_SERIES);
  }

  static async saveSeriesInfo(seriesId: string, seriesInfo: any): Promise<void> {
    await this.set(
      this.KEYS.SERIES_INFO + seriesId,
      seriesInfo,
      this.DEFAULT_TTL.SERIES_INFO
    );
  }

  static async getSeriesInfo(seriesId: string): Promise<any | null> {
    return await this.get<any>(this.KEYS.SERIES_INFO + seriesId);
  }

  static async deleteSeriesInfo(seriesId: string): Promise<void> {
    await this.delete(this.KEYS.SERIES_INFO + seriesId);
  }

  /**
   * Clear only VOD cache (keep live channels)
   */
  static async clearVODCache(): Promise<void> {
    await this.deleteLargeArray(this.KEYS.VOD_MOVIES);
    await this.deleteLargeArray(this.KEYS.VOD_SERIES);
    console.log('🗑️ VOD cache cleared');
  }

  /**
   * Clear only Live TV cache
   */
  static async clearLiveTVCache(): Promise<void> {
    await this.deleteLargeArray(this.KEYS.LIVE_CHANNELS);
    console.log('🗑️ Live TV cache cleared');
  }
}

export default CacheService;
