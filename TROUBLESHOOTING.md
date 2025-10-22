# 🔧 Guide de Dépannage - Erreur de Connexion

## ❌ Erreur: "Network request failed"

Cette erreur signifie que l'application ne peut pas se connecter à votre serveur IPTV. Voici comment la résoudre:

### 🔍 Diagnostic

1. **Testez votre URL M3U:**
   ```bash
   ./test-m3u-url.sh
   ```
   Ce script vous dira si votre URL est accessible.

### ⚠️ Problèmes Courants

#### 1. URL Incomplète
❌ **Mauvais:** `http://protv.top`  
✅ **Correct:** `http://protv.top/get.php?username=VOTRE_USER&password=VOTRE_PASS&type=m3u`

L'URL doit pointer vers le **fichier M3U complet**, pas juste le nom de domaine!

#### 2. Format d'URL Incorrect

Les formats corrects sont:
```
# Format 1: API avec paramètres
http://exemple.com/get.php?username=USER&password=PASS&type=m3u

# Format 2: Fichier M3U direct
http://exemple.com/playlist.m3u

# Format 3: Avec port
http://exemple.com:8080/get.php?username=USER&password=PASS

# Format 4: HTTPS
https://exemple.com/secure/playlist.m3u
```

#### 3. Serveur IPTV Hors Ligne

Testez depuis votre navigateur:
1. Copiez votre URL M3U complète
2. Collez-la dans un navigateur web
3. Le fichier M3U devrait se télécharger ou s'afficher

Si ça ne fonctionne pas, contactez votre fournisseur IPTV.

### 🛠️ Solutions

#### Solution 1: Vérifiez l'URL Complète

Votre fournisseur IPTV devrait vous avoir donné une URL complète. Exemple:
```
http://votreserveur.com/get.php?username=12345&password=67890&type=m3u
```

#### Solution 2: Testez Manuellement

```bash
# Depuis votre terminal:
curl "http://votre-url-complete.com/playlist.m3u" | head -20
```

Si ça affiche du contenu commençant par `#EXTM3U`, l'URL est bonne!

#### Solution 3: Utilisez le Script de Test

```bash
# Lancez le script de test
./test-m3u-url.sh

# Entrez votre URL complète quand demandé
```

Le script vous dira exactement quel est le problème.

### 📝 Exemples d'URLs Valides

#### Xtream Codes API:
```
http://server.com:8080/get.php?username=USERNAME&password=PASSWORD&type=m3u_plus
```

#### M3U Direct:
```
http://server.com/playlist.m3u
```

#### M3U avec Authentification:
```
http://USERNAME:PASSWORD@server.com/playlist.m3u
```

### 🔄 Après Correction

Une fois que vous avez l'URL complète:

1. **Testez-la:**
   ```bash
   ./test-m3u-url.sh
   ```

2. **Relancez l'app:**
   ```bash
   ./launch-app.sh
   ```

3. **Entrez l'URL complète:**
   ```bash
   ./adb-input-text.sh "http://votre-url-complete-ici.com/..."
   ```

4. **Connectez-vous:**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   $ANDROID_HOME/platform-tools/adb shell input keyevent KEYCODE_TAB
   $ANDROID_HOME/platform-tools/adb shell input keyevent KEYCODE_TAB
   $ANDROID_HOME/platform-tools/adb shell input keyevent KEYCODE_ENTER
   ```

### 💡 Astuce Pro

Créez un fichier avec votre URL complète:
```bash
echo "http://server.com/get.php?username=XXX&password=YYY&type=m3u" > my_iptv_url.txt
```

Puis utilisez-le facilement:
```bash
./adb-input-text.sh "$(cat my_iptv_url.txt)"
```

### 📞 Besoin d'Aide?

Si le problème persiste:
1. Contactez votre fournisseur IPTV
2. Demandez l'URL M3U **complète**
3. Assurez-vous que votre abonnement est actif

### ✅ Checklist de Vérification

- [ ] L'URL commence par `http://` ou `https://`
- [ ] L'URL contient le chemin complet (`.m3u` ou `/get.php`)
- [ ] L'URL inclut username/password si nécessaire
- [ ] L'URL fonctionne dans un navigateur web
- [ ] Votre connexion Internet fonctionne
- [ ] Votre abonnement IPTV est actif

---

## 🎯 En Résumé

**Le problème principal:** Vous avez entré `http://protv.top` au lieu de l'URL M3U complète.

**La solution:** Obtenez l'URL M3U complète de votre fournisseur IPTV. Elle devrait ressembler à:
```
http://protv.top/get.php?username=VOTRE_ID&password=VOTRE_PASS&type=m3u
```

Utilisez cette URL complète dans l'application! 🚀
