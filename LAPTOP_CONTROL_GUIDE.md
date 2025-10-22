# 🖥️ NeoStream - Guide de Connexion depuis votre Laptop

## ✅ Votre laptop fonctionne, pas le clavier Android TV? Pas de problème!

### 🚀 Solution Rapide - Script Interactif

Utilisez votre clavier laptop pour taper et envoyer automatiquement vers Android TV:

```bash
./login-from-laptop.sh
```

Le script vous demandera:
1. 🔗 URL M3U
2. 👤 Username (optionnel)
3. 🔒 Password (optionnel)

Et remplira automatiquement tous les champs sur Android TV!

---

## 📝 Solution Manuelle - Étape par Étape

### 1. Préparez vos identifiants
Exemple:
- URL M3U: `http://exemple.com/playlist.m3u`
- Username: `monusername`
- Password: `monpassword`

### 2. Lancez l'application
```bash
./launch-app.sh
```

### 3. Remplissez le champ URL M3U
```bash
# Tapez votre URL sur votre laptop et envoyez-la:
./adb-input-text.sh "http://exemple.com/playlist.m3u"

# Puis passez au champ suivant:
export ANDROID_HOME=$HOME/Library/Android/sdk
$ANDROID_HOME/platform-tools/adb shell input keyevent KEYCODE_TAB
```

### 4. Remplissez le username (optionnel)
```bash
./adb-input-text.sh "monusername"

# Passez au champ suivant:
$ANDROID_HOME/platform-tools/adb shell input keyevent KEYCODE_TAB
```

### 5. Remplissez le password (optionnel)
```bash
./adb-input-text.sh "monpassword"

# Passez au bouton de connexion:
$ANDROID_HOME/platform-tools/adb shell input keyevent KEYCODE_TAB
```

### 6. Cliquez sur "Se connecter"
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
$ANDROID_HOME/platform-tools/adb shell input keyevent KEYCODE_ENTER
```

---

## ⚡ Commandes Rapides

### Navigation
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Passer au champ suivant
adb shell input keyevent KEYCODE_TAB

# Revenir au champ précédent
adb shell input keyevent SHIFT_TAB

# Appuyer sur OK/Entrée
adb shell input keyevent KEYCODE_ENTER

# Retour
adb shell input keyevent KEYCODE_BACK

# Flèches directionnelles
adb shell input keyevent KEYCODE_DPAD_UP
adb shell input keyevent KEYCODE_DPAD_DOWN
adb shell input keyevent KEYCODE_DPAD_LEFT
adb shell input keyevent KEYCODE_DPAD_RIGHT
```

### Raccourci pour tout en une commande
```bash
# Créez un alias dans votre ~/.bashrc ou ~/.zshrc
alias adb-type='export ANDROID_HOME=$HOME/Library/Android/sdk && $ANDROID_HOME/platform-tools/adb shell input text'
alias adb-enter='export ANDROID_HOME=$HOME/Library/Android/sdk && $ANDROID_HOME/platform-tools/adb shell input keyevent KEYCODE_ENTER'
alias adb-tab='export ANDROID_HOME=$HOME/Library/Android/sdk && $ANDROID_HOME/platform-tools/adb shell input keyevent KEYCODE_TAB'

# Puis utilisez:
adb-type "http://exemple.com/playlist.m3u"
adb-tab
adb-type "username"
adb-tab
adb-type "password"
adb-tab
adb-enter
```

---

## 🎯 Exemple Complet

```bash
# 1. Lancez l'app
./launch-app.sh

# 2. Attendez 2 secondes
sleep 2

# 3. Remplissez tout automatiquement
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# URL M3U
adb shell input text "http://exemple.com/playlist.m3u"
adb shell input keyevent KEYCODE_TAB

# Username
adb shell input text "monusername"
adb shell input keyevent KEYCODE_TAB

# Password
adb shell input text "monpassword"
adb shell input keyevent KEYCODE_TAB

# Connexion
adb shell input keyevent KEYCODE_ENTER
```

---

## 💡 Astuces

### Copier-Coller depuis n'importe où
Si vous avez votre URL M3U dans un fichier texte:
```bash
./adb-input-text.sh "$(cat mon_url.txt)"
```

### Variables d'environnement
Créez un fichier `.env` avec vos identifiants:
```bash
M3U_URL="http://exemple.com/playlist.m3u"
USERNAME="monusername"
PASSWORD="monpassword"
```

Puis:
```bash
source .env
./adb-input-text.sh "$M3U_URL"
```

### Script personnalisé
Créez votre propre script `quick-login.sh`:
```bash
#!/bin/bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

./launch-app.sh
sleep 2

adb shell input text "http://votre-url.com/playlist.m3u"
adb shell input keyevent KEYCODE_TAB
adb shell input keyevent KEYCODE_TAB
adb shell input keyevent KEYCODE_ENTER
```

---

## 🔧 Dépannage

### ADB ne trouve pas l'appareil
```bash
# Listez les appareils
export ANDROID_HOME=$HOME/Library/Android/sdk
$ANDROID_HOME/platform-tools/adb devices

# Redémarrez le serveur ADB
$ANDROID_HOME/platform-tools/adb kill-server
$ANDROID_HOME/platform-tools/adb start-server
```

### Les caractères spéciaux ne passent pas
Utilisez l'échappement:
```bash
# Pour : utilisez \\:
./adb-input-text.sh "http\\://exemple.com"

# Pour / utilisez \\/
./adb-input-text.sh "http\\:\\/\\/exemple.com"

# Ou laissez le script s'en occuper
./adb-input-text.sh "http://exemple.com"  # Le script échappe automatiquement
```

---

## ✨ C'est tout!

Vous pouvez maintenant contrôler complètement l'application Android TV depuis votre laptop! 🎉
