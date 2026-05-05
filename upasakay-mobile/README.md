# Welcome to UPASAKAY Mobile! 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


## Export development build to access features like notifications [IMPORTANT FOR ANDROID]

Do keep in mind that there are options for you to run the app with or without the server (running the app locally on the phone)

App with computer

1. **Connect your Android phone to your computer via USB cable.**

2. **Enable Developer Mode on your Android device:**
   - Open **Settings**
   - Go to **About phone**
   - Locate **Build number**
   - Tap **Build number** 7 times until Developer Mode is enabled

3. **Enable USB Debugging:**
   - Go to **Settings > System > Developer options**
   - Turn on **USB debugging**

4. **For people that want to test the app on their personal devices: Enable Install from USB**
    - Go to **Settings > System > Developer options >Debugging**
    - Turn on **Install via USB**
    
5. **Verify that your device is detected (Windows):**
   - Open Command Prompt
   - Run:
     ```bash
     C:\Users\DELL\AppData\Local\Android\Sdk\platform-tools>adb devices
     ```
   - You should see output similar to:
     ```text
     List of devices attached
     06219330CI035872        device
     ```

6. Wait for installation to happen

7. Do not disconnect physical device when running the app. (It will complain about Metro.js)

App without computer

1. Prepare your Android device/simulator (connect Android phone through USB)

2. Go to settings and tap [Build Number] or [OS version] 4-7 times until it says "You are now a developer!".

3. Enable USB Debugging from Settings>System>Developer Options and turn on the setting

4. Connect phone to PC through USB

2. Start the app

   ```bash
   npx expo run:android --configuration Release --device #Installs the app to your device 
   ```

3. Select your device

4. Wait for installation to happen
5. NOTE! DO NOT PRESS ANYTHING especially ENTER and CTRL+C on the terminal while installation is ongoing,  it will cause a corruption to the app and will take you a significant amount of time to fix and reinstall everything.
6. Physical phone is now free to disconnect from the host server and can run the app's local database with its local memory.



## 📱 Android Development Setup Guide
> For Expo / React Native projects on Windows
 
This guide walks you through everything you need to install before running `npx expo run:android`, and how to fix the most common issues that come up along the way.
 
---
 
## ✅ Prerequisites — Install These First
 
Before running any Expo Android build, make sure you have all of the following installed and configured.
 
### 1. Node.js
Download and install from https://nodejs.org (LTS version recommended).
 
Verify:
```powershell
node -v
npm -v
```
 
---
 
### 2. JDK 17 (Temurin — NOT Oracle, NOT Java 8)
Expo and React Native require **JDK 17 minimum**. The recommended distribution is **Eclipse Temurin** (free, open-source, no license restrictions).
 
Download: https://adoptium.net/temurin/releases/?version=17
- Choose: **Windows x64 → .msi installer**
- During install, **check the option to set JAVA_HOME automatically**
> ⚠️ **Do NOT use Oracle Java** — the default Oracle installer gives you a JRE (no compiler), and Oracle JDK requires a paid commercial license.
> ⚠️ **Do NOT use Java 8** — it is too old for Gradle 8+ and Expo's build plugins.
 
Verify after install (in a new terminal):
```powershell
java -version    # should say 17.x.x
javac -version   # should say javac 17.x.x
echo $env:JAVA_HOME  # should point to JDK 17 folder
```
 
---
 
### 3. Android Studio + Android SDK
Download: https://developer.android.com/studio
 
During setup, make sure to install:
- **Android SDK**
- **Android SDK Platform-Tools**
- **Android Emulator** (if testing on emulator)
After install, set these environment variables:
 
```powershell
# In PowerShell as Administrator
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\<YourUser>\AppData\Local\Android\Sdk", "Machine")
```
 
Add to PATH:
- `%ANDROID_HOME%\platform-tools`
- `%ANDROID_HOME%\emulator`
Verify:
```powershell
adb --version
```
 
---
 
### 4. Expo CLI
```powershell
npm install -g expo-cli
```
 
---
 
### 5. Enable Developer Options on Your Phone (for physical device)
1. Go to **Settings → About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings → Developer Options** and enable:
   - ✅ USB Debugging
   - ✅ Install via USB ← **important, easy to miss**
Then connect via USB and verify your device is detected:
```powershell
adb devices
```
 
---
 
## 🚀 Running the App
 
```powershell
cd your-project-folder
npx expo run:android
```
 
The **first build takes 15–30 minutes** — this is normal. Gradle is compiling native C++ code and converting all libraries to DEX format. Subsequent builds are much faster due to caching.
 
> ⚠️ **Do NOT press Ctrl+C during the first build.** It can corrupt the Gradle cache and force a full rebuild.
 
---
 
## 🔧 Troubleshooting
 
### ❌ `No Java compiler found, please ensure you are running Gradle with a JDK`
 
**Cause:** Gradle is picking up a JRE instead of a JDK, or the wrong Java version.
 
**Fix 1 — Verify JAVA_HOME is set correctly:**
```powershell
echo $env:JAVA_HOME
# Should print: C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot
 
[System.Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")
```
 
If blank or wrong, set it (in PowerShell as Administrator):
```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot", "Machine")
```
 
Then **open a new terminal** and verify again.
 
**Fix 2 — Check for old Java versions in PATH:**
```powershell
$env:PATH -split ";" | Where-Object { $_ -match "java|jdk|jre" }
```
 
If you see Oracle Java 8 or any old JRE entries, remove them:
1. Open **System Properties → Advanced → Environment Variables**
2. Under **System Variables**, select **Path → Edit**
3. Delete entries like:
   - `C:\Program Files (x86)\Common Files\Oracle\Java\java8path`
   - `C:\Program Files (x86)\Common Files\Oracle\Java\javapath`
**Fix 3 — Kill stale Gradle daemons:**
```powershell
cd your-project\android
.\gradlew.bat --stop
```
 
Old daemons started with the wrong Java version keep running in the background even after you fix JAVA_HOME.
 
---
 
### ❌ `This build uses a Java 8 JVM`
 
Same root cause as above. The Gradle daemon was started when Java 8 was still active. Stop all daemons first:
 
```powershell
cd your-project\android
.\gradlew.bat --stop
cd ..
npx expo run:android
```
 
If it persists, set the JDK in your **user-level** `gradle.properties` (safe — never committed to git):
```powershell
Add-Content "$env:USERPROFILE\.gradle\gradle.properties" "`norg.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.18.8-hotspot"
```
 
---
 
### ❌ `Could not read workspace metadata from ...metadata.bin`
 
**Cause:** Gradle cache was corrupted, usually from interrupting a build with Ctrl+C.
 
**Fix — Wipe the Gradle cache entirely:**
```powershell
Remove-Item "$env:USERPROFILE\.gradle\caches" -Recurse -Force
Remove-Item "$env:USERPROFILE\.gradle\daemon" -Recurse -Force
```
 
Then rebuild. The first build after wiping cache will be slow again.
 
---
 
### ❌ `INSTALL_FAILED_USER_RESTRICTED: Install canceled by user`
 
**Cause:** Your phone is blocking APK installs over USB.
 
**Fix — Enable "Install via USB" in Developer Options:**
 
| Brand | Path |
|---|---|
| Xiaomi / MIUI | Settings → Developer Options → Install via USB |
| Samsung | Settings → Developer Options → Install via USB |
| Stock Android | A permission popup should appear on your phone — tap Allow |
 
Then run again:
```powershell
npx expo run:android
```
 
---
 
### ❌ `adb devices` shows no device or `unauthorized`
 
- Make sure **USB Debugging** is enabled on your phone
- Unplug and replug the USB cable
- On your phone, look for a popup asking **"Allow USB Debugging?"** — tap Always Allow
- Try a different USB cable (data cable, not charge-only)
---
 
## 🧹 Full Clean Reset (Nuclear Option)
 
If everything is broken and nothing works:
 
```powershell
# 1. Stop all Gradle daemons
cd your-project\android
.\gradlew.bat --stop
 
# 2. Wipe Gradle cache
Remove-Item "$env:USERPROFILE\.gradle\caches" -Recurse -Force
Remove-Item "$env:USERPROFILE\.gradle\daemon" -Recurse -Force
 
# 3. Wipe project build folders
Remove-Item "your-project\android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "your-project\android\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "your-project\android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
 
# 4. Reinstall node modules
cd your-project
Remove-Item "node_modules" -Recurse -Force
npm install
 
# 5. Rebuild
npx expo run:android
```
 
---
 
