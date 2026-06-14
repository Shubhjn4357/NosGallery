const withAndroidWidgets = require('./plugin/withAndroidWidgets');
const withGradleTaskFix = require('./plugin/withGradleTaskFix');

/**
 * expo-widget Expo config plugin entry point.
 * Chains both withAndroidWidgets and withGradleTaskFix.
 */
module.exports = (config) => {
  config = withAndroidWidgets(config);
  config = withGradleTaskFix(config);
  return config;
};
