// Quick test of the LogoService
const fetch = require('node-fetch');

async function testLogoService() {
  try {
    console.log('🧪 Testing iptv-org Logo API...\n');
    
    // Test fetching logos
    const response = await fetch('https://iptv-org.github.io/api/logos.json');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const logos = await response.json();
    console.log(`✅ Successfully fetched ${logos.length} logos from iptv-org\n`);
    
    // Show some example logos
    console.log('📺 Example channel logos:');
    logos.slice(0, 10).forEach(logo => {
      console.log(`  - ${logo.channel}: ${logo.url}`);
    });
    
    console.log('\n✨ Logo service is working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogoService();
