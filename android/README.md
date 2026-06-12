# Jaliz TWA (Trusted Web Activity) - Android App

This directory contains the Android TWA wrapper for the Jaliz web application,
allowing it to be published on Google Play Store.

## What is TWA?
TWA (Trusted Web Activity) is Google's recommended approach for packaging web
apps as Android apps. It loads the website in Chrome without showing the browser
UI (no address bar), providing a native-like experience.

## Prerequisites

1. **JDK 17+** installed (for signing the APK)
2. **Android SDK** (Bubblewrap can install this for you)
3. **Google Play Developer Account** ($25 one-time fee)

## Quick Start

### 1. Install Bubblewrap CLI
```bash
npm install -g @nicolo-ribaudo/pwa-to-twa
# or use npx:
npx -y @nicolo-ribaudo/pwa-to-twa --help
```

### 2. Initialize TWA project
```bash
npx -y @nicolo-ribaudo/pwa-to-twa init --url https://jaliz.ir
```

### 3. Build AAB (Android App Bundle)
```bash
npx -y @nicolo-ribaudo/pwa-to-twa build
```

### 4. Alternative: Use PWABuilder (Easiest)
Go to [PWABuilder.com](https://www.pwabuilder.com/), enter `https://jaliz.ir`,
and follow the wizard to generate a Play Store-ready AAB package.

## Important: Digital Asset Links

After generating the keystore and getting the SHA256 fingerprint:

1. Get fingerprint:
   ```bash
   keytool -list -v -keystore <your-keystore>.jks -alias <alias> | grep SHA256
   ```

2. Update `public/.well-known/assetlinks.json` with the fingerprint

3. Deploy the updated file to production

## Project Structure

```
android/
├── README.md          # This file
├── twa-manifest.json  # TWA configuration
└── (generated files will appear after init)
```

## Alternative: Manual Bubblewrap Setup

If automated tools don't work (e.g., due to network restrictions in Iran),
you can use the manual configuration in `twa-manifest.json` with Android Studio:

1. Open Android Studio
2. Create a new project using "Empty Views Activity"
3. Add TWA dependency to build.gradle
4. Configure the TWA using the settings in twa-manifest.json
