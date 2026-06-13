@AGENTS.md

# Build Commands

- **Local Android Prebuild**:
  ```bash
  pnpm exec expo prebuild --platform android --no-install
  ```

- **Local Android Build (supports any active JDK version, e.g., Java 25)**:
  ```powershell
  # Windows PowerShell
  $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot"
  cd android
  .\gradlew.bat assembleDebug --no-daemon --init-script ../scripts/init.gradle
  ```
  ```bash
  # Linux/macOS
  cd android
  ./gradlew assembleDebug --no-daemon --init-script ../scripts/init.gradle
  ```
