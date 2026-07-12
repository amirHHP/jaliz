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

If Chrome shows a green URL bar (`jaliz.noxte.ir`) inside the app, TWA verification
failed and Chrome fell back to Custom Tabs. Fix Digital Asset Links — do not rebuild
the APK just to hide that bar.

`public/.well-known/assetlinks.json` must contain **only** valid Google namespaces
(`android_app`). Do **not** add `cafebazaar_twa` here — Google's parser returns
`ERROR_CODE_MALFORMED_CONTENT` and fullscreen TWA breaks.

After generating the keystore and getting the SHA256 fingerprint:

1. Get fingerprint of the **signing key that users actually get**:
   ```bash
   keytool -list -v -keystore <your-keystore>.jks -alias <alias> | grep SHA256
   ```
   If you use Play App Signing, also copy the **App signing key** SHA-256 from
   Play Console → App integrity (not only the upload key).

2. Put every needed fingerprint in `sha256_cert_fingerprints` in
   `public/.well-known/assetlinks.json`

3. Deploy to production, then verify:
   ```bash
   curl -s "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://jaliz.noxte.ir&relation=delegate_permission/common.handle_all_urls"
   ```
   Expect statements for `ir.noxte.jaliz.twa` and **no** `errorCode`.

4. On the phone: clear Chrome storage for the site (or reinstall the app), open
   **جالیز from the app icon** (not from the browser).

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
