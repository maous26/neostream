import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IPTVService, StorageService } from '../services';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [m3uUrl, setM3uUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Références pour gérer le focus
  const urlInputRef = useRef<TextInput>(null);
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Auto-focus sur le premier champ au chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      urlInputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    setError('');

    if (!m3uUrl.trim()) {
      setError('⚠️ Veuillez entrer une URL M3U');
      return;
    }

    setLoading(true);

    try {
      const credentials = { m3uUrl: m3uUrl.trim(), username, password };
      
      // Test de connexion
      await IPTVService.getChannels(credentials);
      
      // Sauvegarde des identifiants
      await StorageService.saveCredentials(credentials);
      
      // Navigation vers Home
      navigation.replace('Home');
    } catch (err) {
      setError('❌ Connexion échouée. Vérifiez vos identifiants.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>📺 NeoStream</Text>
          <Text style={styles.subtitle}>Votre IPTV personnalisée</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* URL M3U */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>🔗 URL M3U *</Text>
            <TextInput
              ref={urlInputRef}
              style={styles.input}
              placeholder="http://exemple.com/playlist.m3u"
              placeholderTextColor="#64748b"
              value={m3uUrl}
              onChangeText={setM3uUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="next"
              onSubmitEditing={() => usernameInputRef.current?.focus()}
              blurOnSubmit={false}
              focusable={true}
              autoFocus={true}
            />
          </View>

          {/* Username (optionnel) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>👤 Nom d'utilisateur (optionnel)</Text>
            <TextInput
              ref={usernameInputRef}
              style={styles.input}
              placeholder="username"
              placeholderTextColor="#64748b"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              blurOnSubmit={false}
              focusable={true}
            />
          </View>

          {/* Password (optionnel) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>🔒 Mot de passe (optionnel)</Text>
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              placeholder="password"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              focusable={true}
            />
          </View>

          {/* Error message */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            focusable={true}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🚀 Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Astuce : Vous pouvez copier-coller vos identifiants directement depuis votre fournisseur IPTV
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: '#06b6d4',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 15,
    padding: 18,
    fontSize: 16,
    color: '#fff',
    borderWidth: 2,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#06b6d4',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#334155',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  errorText: {
    color: '#fca5a5',
    textAlign: 'center',
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#0c4a6e',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  infoText: {
    color: '#7dd3fc',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoginScreen;
