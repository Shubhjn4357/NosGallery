const fs = require('fs');

const profile = process.env.EAS_BUILD_PROFILE || process.env.EXPO_BUILD_PROFILE;
console.log('EAS Build Profile:', profile);

// If the profile is preview or production, we strip expo-dev-client
if (profile === 'preview' || profile === 'production') {
  console.log('Detected production/preview EAS build. Stripping expo-dev-client from autolinking and plugins...');

  // 1. Update package.json to exclude expo-dev-client from autolinking
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.expo = pkg.expo || {};
    pkg.expo.autolinking = pkg.expo.autolinking || {};
    pkg.expo.autolinking.exclude = pkg.expo.autolinking.exclude || [];

    const devClientPackages = [
      'expo-dev-client',
      'expo-dev-launcher',
      'expo-dev-menu',
      'expo-dev-menu-interface'
    ];

    devClientPackages.forEach(p => {
      if (!pkg.expo.autolinking.exclude.includes(p)) {
        pkg.expo.autolinking.exclude.push(p);
      }
    });

    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('Added autolinking exclusions to package.json.');
  }

  // 2. Update app.json to remove expo-dev-client from plugins
  if (fs.existsSync('app.json')) {
    const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    if (app.expo && app.expo.plugins) {
      app.expo.plugins = app.expo.plugins.filter(p =>
        p !== 'expo-dev-client' && p?.[0] !== 'expo-dev-client'
      );
      fs.writeFileSync('app.json', JSON.stringify(app, null, 2));
      console.log('Removed expo-dev-client plugin from app.json.');
    }
  }
} else {
  console.log('Development EAS build profile detected (or build profile not set). Leaving expo-dev-client enabled.');
}
