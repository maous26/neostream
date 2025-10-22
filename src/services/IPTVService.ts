import { IPTVCredentials } from './StorageService';

export interface Channel {
  id: string;
  name: string;
  url: string;
  group?: string;
  logo?: string;
}

export const IPTVService = {
  getChannels: async (credentials: IPTVCredentials): Promise<Channel[]> => {
    try {
      // Validate the M3U URL
      if (!credentials.m3uUrl) {
        throw new Error('M3U URL is required');
      }

      let url = credentials.m3uUrl.trim();
      
      // Add default protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
      }

      console.log('🔗 Fetching M3U from:', url);

      // Build the URL with credentials if provided
      if (credentials.username && credentials.password) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}username=${encodeURIComponent(credentials.username)}&password=${encodeURIComponent(credentials.password)}`;
        console.log('👤 Added credentials to URL');
      }

      // Fetch the M3U playlist with timeout
      console.log('📡 Starting fetch request...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'NeoStream/1.0',
          'Accept': '*/*',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const m3uContent = await response.text();
      console.log('📄 Content length:', m3uContent.length);
      
      // Parse M3U content
      const channels = parseM3U(m3uContent);
      console.log('✅ Parsed channels:', channels.length);
      
      if (channels.length === 0) {
        throw new Error('No channels found in the playlist. Please check your M3U URL.');
      }

      return channels;
    } catch (error: any) {
      console.error('❌ IPTVService.getChannels error:', error);
      
      // Better error messages
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your internet connection.');
      } else if (error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your internet connection and M3U URL.');
      } else if (error.message.includes('HTTP')) {
        throw new Error(`Server error: ${error.message}`);
      }
      
      throw error;
    }
  },
};

function parseM3U(content: string): Channel[] {
  const channels: Channel[] = [];
  const lines = content.split('\n');
  
  let currentChannel: Partial<Channel> = {};
  let channelId = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      // Parse channel info
      const nameMatch = line.match(/,(.+)$/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      
      currentChannel = {
        id: channelId.toString(),
        name: nameMatch ? nameMatch[1].trim() : `Channel ${channelId}`,
        group: groupMatch ? groupMatch[1] : undefined,
        logo: logoMatch ? logoMatch[1] : undefined,
      };
      channelId++;
    } else if (line && !line.startsWith('#') && currentChannel.name) {
      // This should be the stream URL
      currentChannel.url = line;
      channels.push(currentChannel as Channel);
      currentChannel = {};
    }
  }

  return channels;
}
