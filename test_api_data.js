// Test pour voir les données réelles de l'API
const fetch = require('node-fetch');

const serverUrl = 'http://protv.site:8080';
const username = 'MfVN8rHEh2';
const password = 'FuaDcbKZkU';

async function testAPIData() {
  console.log('🔍 Test des données API Xtream Codes...\n');
  
  // Test 1: Un film VOD
  console.log('📽️  TEST 1: Structure d\'un film VOD');
  console.log('=====================================');
  try {
    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams`;
    const response = await fetch(url);
    const movies = await response.json();
    
    if (movies && movies.length > 0) {
      console.log('Premier film:', JSON.stringify(movies[0], null, 2));
      console.log('\nChamps disponibles:', Object.keys(movies[0]).join(', '));
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  }
  
  console.log('\n');
  
  // Test 2: Une série VOD
  console.log('📺 TEST 2: Structure d\'une série VOD');
  console.log('=====================================');
  try {
    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series`;
    const response = await fetch(url);
    const series = await response.json();
    
    if (series && series.length > 0) {
      console.log('Première série:', JSON.stringify(series[0], null, 2));
      console.log('\nChamps disponibles:', Object.keys(series[0]).join(', '));
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  }
  
  console.log('\n');
  
  // Test 3: Détails d'une série
  console.log('🎬 TEST 3: Détails complets d\'une série');
  console.log('=========================================');
  try {
    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series`;
    const response = await fetch(url);
    const series = await response.json();
    
    if (series && series.length > 0) {
      const seriesId = series[0].series_id;
      const detailsUrl = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${seriesId}`;
      const detailsResponse = await fetch(detailsUrl);
      const details = await detailsResponse.json();
      
      console.log('Détails série complète:', JSON.stringify(details, null, 2));
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  }
  
  console.log('\n');
  
  // Test 4: Catégories disponibles
  console.log('📂 TEST 4: Catégories VOD disponibles');
  console.log('======================================');
  try {
    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`;
    const response = await fetch(url);
    const categories = await response.json();
    
    console.log(`Total de catégories: ${categories.length}`);
    console.log('Premières catégories:', JSON.stringify(categories.slice(0, 5), null, 2));
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testAPIData();
