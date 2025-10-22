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
import { xtreamService } from '../services/XtreamCodesService';
import { StorageService } from '../services';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [serverUrl, setServerUrl] = useState('apsmarter.net:80');
  const [username, setUsername] = useState('703985977790132');
  const [password, setPassword] = useState('1593574628');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const urlInputRef = useRef<TextInput>(null);
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      urlInputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    setError('');

    // Validation
    if (!serverUrl.trim()) {
      setError('⚠️ URL du serveur requise');
      return;
    }

    if (!username.trim()) {
      setError('⚠️ Username requis');
      return;
    }

    if (!password.trim()) {
      setError('⚠️ Password requis');
      return;
    }

    setLoading(true);

    try {
      const credentials = {
        serverUrl: serverUrl.trim(),
        username: username.trim(),
        password: password.trim(),
      };

      console.log('🚀 Tentative de connexion...');
      
      // Test de connexion avec Xtream Codes
      await xtreamService.authenticate(credentials);
      
      // Sauvegarde
      await StorageService.saveCredentials({
        m3uUrl: credentials.serverUrl, // On garde la même structure
        username: credentials.username,
        password: credentials.password,
      });
      
      console.log('✅ Connexion réussie !');
      navigation.replace('Home');
      
    } catch (err: any) {
      console.error('❌ Échec connexion:', err);
      setError(err.message || '❌ Connexion échouée');
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
          <Text style={styles.subtitle}>Xtream Codes IPTV</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Server URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>🌐 URL du serveur *</Text>
            <TextInput
              ref={urlInputRef}
              style={styles.input}
              placeholder="http://votreserveur.com:8080"
              placeholderTextColor="#64748b"
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="next"
              onSubmitEditing={() => usernameInputRef.current?.focus()}
              blurOnSubmit={false}
              autoFocus={true}
            />
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>👤 Username *</Text>
            <TextInput
              ref={usernameInputRef}
              style={styles.input}
              placeholder="votre_username"
              placeholderTextColor="#64748b"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>🔒 Password *</Text>
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              placeholder="votre_password"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
          </View>

          {/* Error */}
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
              💡 Même système que IPTV Smarters !{'\n'}
              Entrez votre URL serveur, username et password
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 50 },
  logo: { fontSize: 48, fontWeight: '900', color: '#06b6d4', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#64748b', fontWeight: '600' },
  form: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#94a3b8', marginBottom: 8 },
  input: { backgroundColor: '#1e293b', borderRadius: 15, padding: 18, fontSize: 16, color: '#fff', borderWidth: 2, borderColor: '#334155' },
  button: { backgroundColor: '#06b6d4', borderRadius: 15, padding: 18, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#334155' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  errorBox: { backgroundColor: '#7f1d1d', borderRadius: 10, padding: 15, marginBottom: 15 },
  errorText: { color: '#fca5a5', textAlign: 'center', fontWeight: '700' },
  infoBox: { backgroundColor: '#0c4a6e', borderRadius: 10, padding: 15, marginTop: 20 },
  infoText: { color: '#7dd3fc', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});

export default LoginScreen;
