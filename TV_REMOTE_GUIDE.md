# 📺 NeoStream - Guide d'utilisation TV Remote

## 🎮 Navigation avec la télécommande Android TV

### Touches principales:
- **Flèches Directionnelles** (↑ ↓ ← →) : Naviguer entre les champs
- **OK / Entrée** : Sélectionner / Valider
- **Retour** : Revenir en arrière
- **Menu** : Options supplémentaires

### 🔧 Configuration pour le clavier virtuel

Si le clavier Android ne s'affiche pas automatiquement:

1. **Sur Android TV:**
   - Allez dans Paramètres → Clavier
   - Activez "Gboard" (clavier Google)
   - Assurez-vous que le clavier virtuel est activé

2. **Alternative - Utiliser une application de clavier virtuel:**
   - Installer "Remote Mouse" ou "Unified Remote" sur votre smartphone
   - Connectez-vous au même réseau WiFi
   - Utilisez votre téléphone comme clavier/souris

3. **Depuis ADB (pour développeurs):**
   ```bash
   # Afficher le clavier
   adb shell input text "votre_url_m3u"
   
   # Ou ouvrir les paramètres du clavier
   adb shell am start -a android.settings.SETTINGS
   ```

### ⌨️ Problèmes courants

#### Le clavier ne s'affiche pas:
1. Activez le mode développeur sur Android TV
2. Allez dans Paramètres → Clavier → Clavier à l'écran
3. Activez "Toujours afficher le clavier"

#### Les touches ne répondent pas:
1. Redémarrez l'application
2. Vérifiez que les permissions sont accordées
3. Assurez-vous que le mode Focus est activé

### 💡 Astuces

1. **Copier-coller depuis un ordinateur:**
   - Utilisez ADB pour envoyer du texte directement:
     ```bash
     adb shell input text "http://votre-url-m3u.com/playlist.m3u"
     ```

2. **Utiliser un navigateur web:**
   - Ouvrez un navigateur sur Android TV
   - Copiez votre URL M3U
   - Revenez à l'application (le texte peut rester dans le presse-papiers)

3. **Application compagnon:**
   - Installez "Android TV Remote Control" sur votre smartphone
   - Utilisez le clavier de votre téléphone pour taper

## 🚀 Navigation rapide

### Écran de connexion:
1. Focus sur le champ "URL M3U"
2. Appuyez sur OK pour activer le clavier
3. Tapez votre URL
4. Appuyez sur ↓ pour passer au champ suivant
5. Appuyez sur OK sur le bouton "Se connecter"

### Écran d'accueil:
- Utilisez les flèches pour naviguer entre les chaînes
- Appuyez sur OK pour lancer une chaîne
- Appuyez sur Retour pour quitter

## 🔄 Redémarrage de l'application

Si vous rencontrez des problèmes:
```bash
# Arrêter l'application
adb shell am force-stop com.neostream

# Relancer
adb shell am start -n com.neostream/.MainActivity
```
