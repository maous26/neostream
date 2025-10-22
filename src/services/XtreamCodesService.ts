import { logoService } from './LogoService';

export interface XtreamCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface Channel {
  id: string;
  name: string;
  url: string;
  category: string;
  logo?: string;
  emoji: string;
  quality: string;
}

class XtreamCodesService {
  private baseUrl: string = '';
  private username: string = '';
  private password: string = '';

  async authenticate(credentials: XtreamCredentials): Promise<boolean> {
    try {
      let serverUrl = credentials.serverUrl.trim();
      
      if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
        serverUrl = 'http://' + serverUrl;
      }

      this.baseUrl = serverUrl.replace(/\/$/, '');
      this.username = credentials.username;
      this.password = credentials.password;

      console.log('🔐 Authentification Xtream Codes...');
      console.log('📡 Input serverUrl:', credentials.serverUrl);
      console.log('📡 Processed baseUrl:', this.baseUrl);
      console.log('👤 Username:', this.username);

      const authUrl = `${this.baseUrl}/player_api.php?username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}`;
      
      console.log('🌐 Tentative de connexion...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 Réponse:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📄 Data reçue:', JSON.stringify(data).substring(0, 200));
      
      if (data.user_info && data.user_info.auth === 1) {
        console.log('✅ Auth OK');
        return true;
      } else if (data.user_info) {
        throw new Error('Authentification refusée - Vérifiez vos identifiants');
      } else {
        throw new Error('Réponse invalide du serveur');
      }

    } catch (error: any) {
      console.error('❌ Auth error:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Le serveur ne répond pas');
      }
      
      if (error.message.includes('Network request failed')) {
        throw new Error('Impossible de contacter le serveur.\nVérifiez:\n1. L\'URL du serveur\n2. Votre connexion Internet\n3. Que le serveur est en ligne');
      }
      
      throw error;
    }
  }

  async getChannels(credentials: XtreamCredentials): Promise<Channel[]> {
    try {
      await this.authenticate(credentials);

      console.log('📺 Chargement des chaînes...');
      const url = `${this.baseUrl}/player_api.php?username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}&action=get_live_streams`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const streams = await response.json();
      console.log('✅ Streams:', streams.length);

      // Map channels WITHOUT fetching logos (to avoid memory issues)
      const channels: Channel[] = streams.map((stream: any, index: number) => ({
        id: stream.stream_id?.toString() || index.toString(),
        name: stream.name || `Channel ${index}`,
        url: `${this.baseUrl}/live/${this.username}/${this.password}/${stream.stream_id}.m3u8`,
        category: stream.category_name || 'General',
        logo: stream.stream_icon || '', // Use provider logo if available
        emoji: '📺',
        quality: 'HD',
      }));

      console.log(`✅ Loaded ${channels.length} channels`);
      return channels;

    } catch (error) {
      console.error('❌ getChannels error:', error);
      throw error;
    }
  }

  async getLiveChannels(): Promise<Channel[]> {
    try {
      if (!this.baseUrl || !this.username || !this.password) {
        throw new Error('Non authentifié - Veuillez vous connecter');
      }

      console.log('📺 Chargement des chaînes live...');
      const url = `${this.baseUrl}/player_api.php?username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}&action=get_live_streams`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const streams = await response.json();
      console.log('✅ Streams reçus:', streams.length);

      const channels: Channel[] = streams.map((stream: any, index: number) => ({
        id: stream.stream_id?.toString() || index.toString(),
        name: stream.name || `Channel ${index}`,
        url: `${this.baseUrl}/live/${this.username}/${this.password}/${stream.stream_id}.m3u8`,
        category: stream.category_name || 'General',
        logo: stream.stream_icon,
        emoji: '📺',
        quality: 'HD',
      }));

      return channels;

    } catch (error) {
      console.error('❌ getLiveChannels error:', error);
      throw error;
    }
  }
}

export const xtreamService = new XtreamCodesService();
