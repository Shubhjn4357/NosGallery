const { withAppBuildGradle } = require('@expo/config-plugins');

const withGradleTaskFix = (config) => {
  return withAppBuildGradle(config, (modConfig) => {
    const contents = modConfig.modResults.contents;

    // Don't patch twice
    if (contents.includes('Fix Gradle 9 implicit task dependency')) {
      return modConfig;
    }

    const gradlePatch = `
// --- Fix Gradle 9 implicit task dependency validation (BundleHermesCTask) ---
// Resolves: WorkValidationException for createBundle*JsAndAssets tasks that use
// outputs from :expo:* tasks without declaring explicit dependencies.
afterEvaluate {
    ["Debug", "Release"].each { variant ->
        def bundleTask = tasks.findByName("createBundle\${variant}JsAndAssets")
        if (bundleTask != null) {
            rootProject.allprojects { proj ->
                if (proj.path != project.path) {
                    [
                        "package\${variant}Resources",
                        "generate\${variant}ResValues",
                        "generate\${variant}BuildConfig",
                        "merge\${variant}JniLibFolders",
                        "copy\${variant}JniLibsProjectOnly"
                    ].each { depName ->
                        def depTask = proj.tasks.findByName(depName)
                        if (depTask != null) {
                            bundleTask.dependsOn(depTask)
                        }
                    }
                }
            }
        }
    }
}
`;

    modConfig.modResults.contents = contents + '\n' + gradlePatch;
    return modConfig;
  });
};

module.exports = withGradleTaskFix;
