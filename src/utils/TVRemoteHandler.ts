import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

/**
 * Hook pour gérer les événements de la télécommande Android TV
 */
export const useTVRemoteHandler = (onBackPress?: () => boolean) => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (onBackPress) {
        return onBackPress();
      }
      return false;
    });

    return () => backHandler.remove();
  }, [onBackPress]);
};

/**
 * Configuration pour activer la navigation au clavier/télécommande
 */
export const TVRemoteConfig = {
  // Active la navigation par focus pour Android TV
  enableTVEventHandler: true,
  
  // Style par défaut pour les éléments focusables
  focusableStyle: {
    borderWidth: 3,
    borderColor: '#06b6d4',
    transform: [{ scale: 1.05 }],
  },
};
