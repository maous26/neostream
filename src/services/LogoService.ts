/**
 * LogoService - Fetches channel logos from iptv-org database
 * 
 * The iptv-org project maintains a comprehensive database of channel logos
 * at https://github.com/iptv-org/database
 */

interface Logo {
  channel: string;
  feed?: string;
  tags: string[];
  width: number;
  height: number;
  format: string;
  url: string;
}

class LogoService {
  private readonly API_BASE = 'https://iptv-org.github.io/api';
  private logosCache: Logo[] = [];
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Fetch all logos from the iptv-org API
   */
  private async fetchLogos(): Promise<Logo[]> {
    try {
      const now = Date.now();
      
      // Return cached data if still valid
      if (this.logosCache.length > 0 && now < this.cacheExpiry) {
        return this.logosCache;
      }

      console.log('📡 Fetching logos from iptv-org API...');
      
      const response = await fetch(`${this.API_BASE}/logos.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const logos: Logo[] = await response.json();
      
      // Cache the results
      this.logosCache = logos;
      this.cacheExpiry = now + this.CACHE_DURATION;
      
      console.log(`✅ Loaded ${logos.length} logos from iptv-org`);
      
      return logos;
    } catch (error) {
      console.error('❌ Failed to fetch logos:', error);
      return [];
    }
  }

  /**
   * Find logo for a channel by name
   * @param channelName - The name of the channel
   * @param country - Optional country code (e.g., 'fr', 'us', 'uk')
   * @returns Logo URL or null
   */
  async findLogoByName(channelName: string, country?: string): Promise<string | null> {
    try {
      const logos = await this.fetchLogos();
      
      if (logos.length === 0) return null;

      // Normalize channel name for comparison
      const normalizedName = this.normalizeChannelName(channelName);
      
      // Try to find exact match with country code
      if (country) {
        const channelId = `${normalizedName}.${country.toLowerCase()}`;
        const exactMatch = logos.find(logo => 
          logo.channel.toLowerCase() === channelId.toLowerCase()
        );
        
        if (exactMatch) {
          return this.selectBestLogo([exactMatch]);
        }
      }

      // Try to find by channel name without country
      const matches = logos.filter(logo => {
        const logoChannelName = logo.channel.split('.')[0];
        return logoChannelName.toLowerCase() === normalizedName.toLowerCase();
      });

      if (matches.length > 0) {
        return this.selectBestLogo(matches);
      }

      // Try fuzzy matching
      const fuzzyMatches = logos.filter(logo => {
        const logoChannelName = logo.channel.split('.')[0].toLowerCase();
        return logoChannelName.includes(normalizedName.toLowerCase()) ||
               normalizedName.toLowerCase().includes(logoChannelName);
      });

      if (fuzzyMatches.length > 0) {
        return this.selectBestLogo(fuzzyMatches);
      }

      return null;
    } catch (error) {
      console.error(`Failed to find logo for ${channelName}:`, error);
      return null;
    }
  }

  /**
   * Select the best logo from multiple options
   * Prefers: SVG > PNG > Others, and larger sizes
   */
  private selectBestLogo(logos: Logo[]): string | null {
    if (logos.length === 0) return null;
    
    // Sort by format preference and size
    const sorted = logos.sort((a, b) => {
      // Format priority: SVG=5, PNG=4, WebP=3, AVIF=2, JPEG=1, others=0
      const formatScore = (format: string) => {
        const scores: { [key: string]: number } = {
          'SVG': 5,
          'PNG': 4,
          'WebP': 3,
          'AVIF': 2,
          'JPEG': 1
        };
        return scores[format] || 0;
      };

      const formatDiff = formatScore(b.format) - formatScore(a.format);
      if (formatDiff !== 0) return formatDiff;

      // If same format, prefer closer to 512x512 (ideal size)
      const idealSize = 512;
      const aDiff = Math.abs(a.width - idealSize) + Math.abs(a.height - idealSize);
      const bDiff = Math.abs(b.width - idealSize) + Math.abs(b.height - idealSize);
      
      return aDiff - bDiff;
    });

    return sorted[0].url;
  }

  /**
   * Normalize channel name to match iptv-org format
   */
  private normalizeChannelName(name: string): string {
    return name
      .replace(/^@/gi, 'At')
      .replace(/^&/i, 'And')
      .replace(/\+/gi, 'Plus')
      .replace(/\s-(\d)/gi, 'Minus$1')
      .replace(/^-(\d)/gi, 'Minus$1')
      .replace(/[^a-z\d]+/gi, '');
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.logosCache = [];
    this.cacheExpiry = 0;
  }
}

export const logoService = new LogoService();
export type { Logo };
