import { ConfigPlugin, withAppBuildGradle } from '@expo/config-plugins';

/**
 * Expo Config Plugin: Fix Gradle 9 implicit task dependency validation
 *
 * React Native's BundleHermesCTask (createBundle*JsAndAssets) uses the project
 * root directory as its working directory. Gradle 9 requires explicit ordering
 * when other subproject tasks (e.g. :expo:*) also output to that location.
 *
 * This plugin patches android/app/build.gradle to add mustRunAfter() declarations
 * so Gradle knows the correct task execution order.
 *
 * @see https://docs.gradle.org/9.3.1/userguide/validation_problems.html#implicit_dependency
 */
const withGradleTaskFix: ConfigPlugin = (config) => {
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
                            bundleTask.mustRunAfter(depTask)
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

export default withGradleTaskFix;
