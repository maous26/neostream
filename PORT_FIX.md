# 🔧 Solution: Problème de Port Manquant

## 🎯 Problème Identifié

L'URL générée pour les streams était:
```
http://apsmarter.net/live/703985977790132/1593574628/7819.m3u8
```

Mais elle devrait être:
```
http://apsmarter.net:80/live/703985977790132/1593574628/7819.m3u8
```

**Le port `:80` était manquant !**

---

## ✅ Solution Appliquée

### 1. Correction du LoginScreen
```typescript
// Avant
const [serverUrl, setServerUrl] = useState('apsmarter.net');

// Après
const [serverUrl, setServerUrl] = useState('apsmarter.net:80');
```

### 2. Log ajouté dans HomeScreen
Pour voir l'URL stockée:
```javascript
console.log('🌐 Server URL from storage:', credentials.m3uUrl);
```

---

## 🚀 Comment Corriger

### Option 1: Reset et Reconnexion (Recommandé)

Utilisez le script de reset:
```bash
./reset-credentials.sh
```

Cela va:
1. ✅ Effacer les credentials stockés
2. ✅ Relancer l'app
3. ✅ Vous ramener à l'écran de connexion

Puis reconnectez-vous avec:
- **Server:** `apsmarter.net:80` (avec le port)
- **Username:** `703985977790132`
- **Password:** `1593574628`

### Option 2: Manuel depuis l'App

1. Cliquez sur "Déconnexion" dans l'app
2. Sur l'écran de connexion, modifiez le serveur pour inclure `:80`
3. Reconnectez-vous

---

## 📋 Vérification

Après la reconnexion, dans les logs vous devriez voir:
```
🌐 Server URL from storage: http://apsmarter.net:80
🎬 PlayerScreen - Chargement de: TF1 HD
🔗 URL: http://apsmarter.net:80/live/703985977790132/1593574628/7819.m3u8
✅ Vidéo chargée avec succès
```

---

## 🔍 Pourquoi ça Arrive ?

1. Le serveur était initialement configuré sans port: `apsmarter.net`
2. Le service ajoutait automatiquement `http://` → `http://apsmarter.net`
3. Mais le port `:80` n'était jamais ajouté
4. Résultat: URLs de streaming incorrectes

---

## 🛠️ Commandes

### Reset complet
```bash
./reset-credentials.sh
```

### Relancer l'app manuellement
```bash
~/Library/Android/sdk/platform-tools/adb shell am force-stop com.neostream
~/Library/Android/sdk/platform-tools/adb shell am start -n com.neostream/.MainActivity
```

### Voir les logs
```bash
./follow-logs.sh
```

---

## ✨ Après la Correction

Une fois reconnecté avec `apsmarter.net:80`:
- ✅ Les URLs de streaming seront correctes
- ✅ Le Player pourra lire les vidéos
- ✅ Plus d'erreur ExoPlayer

---

**Status**: Correction prête ✅  
**Action requise**: Relancer l'app et se reconnecter avec le port `:80`

---

## 📱 Instructions Rapides

1. **Attendez** que la compilation se termine
2. **Lancez** le script: `./reset-credentials.sh`
3. **Reconnectez-vous** (le port `:80` est déjà pré-rempli)
4. **Testez** en sélectionnant une chaîne
5. **Vérifiez** les logs avec `./follow-logs.sh`

🎉 **La vidéo devrait maintenant fonctionner !**
