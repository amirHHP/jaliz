#!/bin/bash
set -e

# =================================================================
# Jaliz TWA Build Script
# Builds an Android App Bundle (AAB) for Google Play Store
# =================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANDROID_DIR="$SCRIPT_DIR/../android"
PUBLIC_DIR="$SCRIPT_DIR/../public"

echo "🌱 Jaliz TWA Build Script"
echo "========================="
echo ""

# Step 1: Check prerequisites
echo "📋 Checking prerequisites..."

# Check for Java/JDK
if ! command -v java &> /dev/null; then
    echo "❌ Java/JDK not found. Please install JDK 17+:"
    echo "   brew install openjdk@17"
    exit 1
fi
echo "  ✅ Java found: $(java -version 2>&1 | head -1)"

# Check for keytool
if ! command -v keytool &> /dev/null; then
    echo "❌ keytool not found (should be part of JDK)"
    exit 1
fi
echo "  ✅ keytool found"

# Check for npx
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi
echo "  ✅ npx found: $(npx --version)"

echo ""

# Step 2: Generate PNG icons if missing
echo "🎨 Checking icons..."
if [ ! -f "$PUBLIC_DIR/icons/icon-512x512.png" ]; then
    echo "  ⚠️  PNG icons not found. Generating from SVG..."
    
    # Check if sharp is available
    if node -e "require('sharp')" 2>/dev/null; then
        node "$SCRIPT_DIR/generate-icons.js"
    else
        echo "  📌 Installing sharp for icon generation..."
        cd "$SCRIPT_DIR/.."
        npm install --no-save sharp
        node "$SCRIPT_DIR/generate-icons.js"
    fi
    echo "  ✅ Icons generated"
else
    echo "  ✅ Icons already exist"
fi

echo ""

# Step 3: Generate keystore if missing
KEYSTORE="$ANDROID_DIR/jaliz-keystore.jks"
if [ ! -f "$KEYSTORE" ]; then
    echo "🔑 Generating signing keystore..."
    echo "   (You'll be prompted for keystore details)"
    echo ""
    keytool -genkeypair \
        -alias jaliz \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -keystore "$KEYSTORE" \
        -storepass jaliz123 \
        -keypass jaliz123 \
        -dname "CN=Jaliz, OU=Jaliz, O=Jaliz, L=Tehran, ST=Tehran, C=IR"
    echo ""
    echo "  ✅ Keystore generated at: $KEYSTORE"
    echo "  ⚠️  Default password: jaliz123 - CHANGE THIS before production!"
else
    echo "🔑 Keystore already exists: $KEYSTORE"
fi

echo ""

# Step 4: Extract SHA256 fingerprint
echo "📎 Extracting SHA256 fingerprint..."
FINGERPRINT=$(keytool -list -v -keystore "$KEYSTORE" -alias jaliz -storepass jaliz123 2>/dev/null | grep "SHA256:" | sed 's/.*SHA256: //')
echo "  Fingerprint: $FINGERPRINT"

# Step 5: Update assetlinks.json
echo ""
echo "🔗 Updating assetlinks.json..."
ASSETLINKS="$PUBLIC_DIR/.well-known/assetlinks.json"
if [ -n "$FINGERPRINT" ]; then
    cat > "$ASSETLINKS" << EOF
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "ir.jaliz.app",
      "sha256_cert_fingerprints": [
        "$FINGERPRINT"
      ]
    }
  }
]
EOF
    echo "  ✅ assetlinks.json updated with fingerprint"
else
    echo "  ⚠️  Could not extract fingerprint. Update assetlinks.json manually."
fi

echo ""

# Step 6: Build with Bubblewrap
echo "🏗️  Building TWA..."
echo "   This will generate an AAB (Android App Bundle) for Play Store"
echo ""

cd "$ANDROID_DIR"

# Initialize if not already done
if [ ! -f "$ANDROID_DIR/build.gradle" ]; then
    echo "  Initializing Bubblewrap project..."
    npx -y @nicolo-ribaudo/pwa-to-twa init --manifest "$ANDROID_DIR/twa-manifest.json" 2>&1 || {
        echo ""
        echo "  ⚠️  Bubblewrap init failed. Try these alternatives:"
        echo ""
        echo "  Option 1: Use PWABuilder (easiest)"
        echo "    1. Go to https://www.pwabuilder.com/"
        echo "    2. Enter: https://jaliz.ir"
        echo "    3. Follow the wizard to download APK/AAB"
        echo ""
        echo "  Option 2: Use Android Studio"
        echo "    1. Import the twa-manifest.json settings"
        echo "    2. Create a TWA project manually"
        echo ""
        exit 1
    }
fi

echo ""
echo "  Building AAB..."
npx -y @nicolo-ribaudo/pwa-to-twa build 2>&1 || {
    echo ""
    echo "  ⚠️  Build failed. The AAB may need to be built with Android Studio."
    echo "  See android/README.md for manual instructions."
    exit 1
}

echo ""
echo "======================================"
echo "✅ Build complete!"
echo ""
echo "Output files should be in: $ANDROID_DIR/app/build/outputs/"
echo ""
echo "Next steps:"
echo "  1. Deploy the updated assetlinks.json to production"
echo "  2. Upload the AAB to Google Play Console"
echo "  3. Set up your Play Store listing (screenshots, description)"
echo "======================================"
