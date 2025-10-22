import AsyncStorage from '@react-native-async-storage/async-storage';

export interface IPTVCredentials {
  m3uUrl: string;
  username?: string;
  password?: string;
}

export const StorageService = {
  saveCredentials: async (credentials: IPTVCredentials): Promise<void> => {
    try {
      await AsyncStorage.setItem('iptv_credentials', JSON.stringify(credentials));
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  },

  getCredentials: async (): Promise<IPTVCredentials | null> => {
    try {
      const data = await AsyncStorage.getItem('iptv_credentials');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting credentials:', error);
      return null;
    }
  },

  clearCredentials: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('iptv_credentials');
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  },
};
