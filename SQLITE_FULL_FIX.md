# 🔧 SQLite Storage Full - Fix & Prevention

## ❌ ERREUR RENCONTRÉE

```
Error: database or disk is full (code 13 SQLITE_FULL)
Source: LiveTVScreen.js (47:20) - loadChannels
```

## 🔍 CAUSE

AsyncStorage utilise SQLite en arrière-plan sur Android. L'erreur SQLITE_FULL se produit quand :

1. **Trop de données accumulées** dans AsyncStorage
2. **Tentatives répétées** de sauvegarde (échecs précédents non nettoyés)
3. **Émulateur** avec espace de stockage limité
4. **Anciennes données corrompues** non supprimées

Dans notre cas:
- Tentatives de sauvegarder 11,864 chaînes plusieurs fois
- Échecs précédents ont laissé des données partielles
- Cache AsyncStorage saturé

---

## ✅ SOLUTION IMMÉDIATE

### 1. Vider les Données de l'App

```bash
# Sur émulateur ou appareil connecté
adb shell pm clear com.neostream
```

**Effet:**
- ✅ Supprime toutes les données AsyncStorage
- ✅ Supprime les credentials sauvegardés
- ✅ Réinitialise l'app comme première installation
- ✅ Libère l'espace de stockage

### 2. Redémarrer l'App

```bash
npx react-native run-android
```

---

## 🛡️ PRÉVENTION IMPLÉMENTÉE

### Code Ajouté dans CacheService.ts

#### 1. Détection SQLITE_FULL lors de la Sauvegarde

```typescript
private static async setLargeArray<T>(key: string, data: T[], ttl?: number): Promise<void> {
  try {
    // ... save logic
  } catch (error: any) {
    console.error('❌ Cache save error:', error);
    
    // Detect disk full error
    if (error.message && (error.message.includes('SQLITE_FULL') || 
                          error.message.includes('disk is full'))) {
      console.log('⚠️ Storage full detected, clearing old cache...');
      
      try {
        await this.clearAll();  // Clear all cache
        console.log('✅ Cache cleared, please restart the app');
      } catch (clearError) {
        console.error('❌ Failed to clear cache:', clearError);
      }
    }
    
    throw error;
  }
}
```

#### 2. Détection de Corruption lors de la Lecture

```typescript
private static async getLargeArray<T>(key: string): Promise<T[] | null> {
  try {
    // ... load logic
    return allData;
  } catch (error: any) {
    console.error('❌ Cache get error:', error);
    
    // Detect SQLite or corruption errors
    if (error.message && (error.message.includes('SQLITE') || 
                          error.message.includes('JSON') || 
                          error.message.includes('disk'))) {
      console.log('⚠️ Cache corrupted, clearing cache for:', key);
      
      try {
        await this.deleteLargeArray(key);  // Clear specific cache
      } catch (e) {
        console.error('Failed to delete corrupted cache:', e);
      }
    }
    
    return null;  // Fallback to API
  }
}
```

---

## 🎯 COMPORTEMENT ATTENDU

### Scénario 1: Stockage Plein lors de la Sauvegarde

```
User ouvre Live TV
  ↓
Tente de sauvegarder en cache
  ↓
❌ SQLITE_FULL error détectée
  ↓
⚠️ Log: "Storage full detected, clearing old cache..."
  ↓
Vide tout le cache AsyncStorage
  ↓
✅ Log: "Cache cleared, please restart the app"
  ↓
Données chargées depuis l'API (pas de cache cette fois)
  ↓
Affiche les chaînes normalement
```

**Prochain redémarrage**: Cache sera recréé avec espace libre

### Scénario 2: Cache Corrompu lors de la Lecture

```
User ouvre Live TV
  ↓
Tente de lire le cache
  ↓
❌ Erreur JSON parse ou SQLite
  ↓
⚠️ Log: "Cache corrupted, clearing cache for: live_channels"
  ↓
Supprime le cache corrompu
  ↓
Retourne null → charge depuis l'API
  ↓
Sauvegarde nouveau cache propre
  ↓
Affiche les chaînes normalement
```

---

## 📋 COMMANDES UTILES

### Vérifier l'Espace de Stockage de l'Émulateur

```bash
adb shell df -h /data
```

### Lister les Données de l'App

```bash
adb shell ls -lh /data/data/com.neostream/databases/
```

### Vider UNIQUEMENT AsyncStorage (sans supprimer l'app)

```bash
adb shell run-as com.neostream rm -rf /data/data/com.neostream/databases/RKStorage
```

### Voir les Logs en Temps Réel

```bash
adb logcat | grep -E "(SQLITE|Cache|AsyncStorage|ReactNativeJS)"
```

---

## 🧪 TESTS EFFECTUÉS

### ✅ Test 1: Vider les Données
```bash
$ adb shell pm clear com.neostream
Success
```
**Résultat**: App réinitialisée, espace libéré

### ✅ Test 2: Rebuild & Réinstallation
```bash
$ npx react-native run-android
BUILD SUCCESSFUL in 4s
Installed on 1 device
```
**Résultat**: App installée avec succès

### ⏳ Test 3: Chargement Live TV (en cours)
- Devrait charger depuis l'API (cache vide)
- Devrait sauvegarder en chunks
- Vérifier logs pour confirmer

---

## 🎓 LEÇONS APPRISES

### Problèmes Identifiés
1. **AsyncStorage a des limites** même avec chunking
2. **Émulateurs** ont souvent moins d'espace que les vrais appareils
3. **Échecs répétés** peuvent saturer le stockage
4. **Nettoyage** doit être automatique

### Solutions Appliquées
1. ✅ **Chunking** pour éviter CursorWindow (500 items/chunk)
2. ✅ **Détection SQLITE_FULL** avec auto-nettoyage
3. ✅ **Détection corruption** avec suppression ciblée
4. ✅ **Graceful fallback** vers l'API si cache indisponible
5. ✅ **Logs clairs** pour debugging

### Recommandations
1. **Sur émulateur**: Vider les données régulièrement
2. **En production**: Monitorer la taille du cache
3. **Future**: Implémenter une limite de taille globale
4. **Future**: Ajouter un bouton "Vider le cache" dans Settings (déjà fait ✅)

---

## 🚀 PROCHAINES ÉTAPES

### Immédiat
1. ✅ Données vidées
2. ✅ App recompilée avec gestion d'erreurs
3. ⏳ Tester le chargement Live TV
4. ⏳ Vérifier que le cache fonctionne

### Court Terme
1. Implémenter une limite de taille maximale du cache
2. Ajouter un monitoring de l'espace disponible
3. Compresser les données avant sauvegarde (si nécessaire)

### Long Terme
1. Migrer vers une solution de cache plus robuste (ex: realm, WatermelonDB)
2. Implémenter un cache en mémoire (RAM) pour les données les plus utilisées
3. Ajouter une stratégie LRU (Least Recently Used) pour le nettoyage automatique

---

## 📝 RÉSUMÉ

### Problème
```
SQLITE_FULL → Cache saturé → Impossible de sauvegarder
```

### Solution Immédiate
```
adb shell pm clear com.neostream → Stockage vidé → App fonctionne
```

### Solution Permanente
```
Détection auto + Nettoyage auto → Cache resilient → Fallback API
```

### Status
- **Fix appliqué**: ✅
- **Build réussi**: ✅
- **App installée**: ✅
- **Prêt à tester**: ✅

**L'application devrait maintenant fonctionner normalement !** 🎉
