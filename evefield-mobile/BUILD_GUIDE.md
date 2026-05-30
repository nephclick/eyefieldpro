# Eyefield Mobile App - Build Guide

## Building APK and AAB for Google Play Store

### Prerequisites
1. **Java Development Kit (JDK)** - Install JDK 17 or higher
2. **Android Studio** - Install Android Studio with Android SDK
3. **Node.js** - Already installed (required for React Native)

### Step 1: Generate a Signing Key

Before building for production, you need to generate a signing key:

```bash
# Navigate to android/app directory
cd android/app

# Generate a keystore (replace 'your-key-alias' and 'your-keystore-name' with your preferred names)
keytool -genkeypair -v -storetype PKCS12 -keystore eyefield-release-key.keystore -alias eyefield-key -keyalg RSA -keysize 2048 -validity 10000
```

**Important**: 
- Remember the passwords you set - you'll need them for future updates
- Store the keystore file safely - losing it means you can't update your app on Play Store
- Add the keystore to your `.gitignore` to avoid committing it

### Step 2: Configure Gradle for Signing

Create or edit `android/gradle.properties` and add:

```properties
MYAPP_RELEASE_STORE_FILE=eyefield-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=eyefield-key
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

### Step 3: Build the APK (for testing)

```bash
# From the root directory
cd android
./gradlew assembleRelease
```

The APK will be generated at: `android/app/build/outputs/apk/release/app-release.apk`

### Step 4: Build the AAB (for Play Store)

```bash
# From the android directory
./gradlew bundleRelease
```

The AAB will be generated at: `android/app/build/outputs/bundle/release/app-release.aab`

### Step 5: Test the APK

Install the APK on a device to test:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Google Play Store Deployment Guide

### 1. Create a Google Play Developer Account
- Go to [Google Play Console](https://play.google.com/console)
- Pay the one-time $25 registration fee
- Complete the developer profile

### 2. Create a New App
1. Click "Create app" in the Play Console
2. Fill in app details:
   - **App name**: Eyefield
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free (or Paid if applicable)

### 3. Complete Store Listing
Navigate to "Store listing" and fill in:

**App details:**
- App name: Eyefield
- Short description: (50 characters max)
- Full description: (4000 characters max)

**Graphics:**
- App icon: 512 x 512 px (high-res version of your icon)
- Feature graphic: 1024 x 500 px
- Phone screenshots: At least 2, up to 8 (16:9 or 9:16 aspect ratio)
- 7-inch tablet screenshots: At least 1 (optional but recommended)
- 10-inch tablet screenshots: At least 1 (optional but recommended)

**Categorization:**
- App category: Choose appropriate category
- Content rating: Complete the questionnaire

**Contact details:**
- Email address
- Website (optional)
- Privacy policy URL (required for apps that handle personal data)

### 4. Upload Your App Bundle
1. Go to "Release" > "Production"
2. Click "Create new release"
3. Upload your `app-release.aab` file
4. Fill in release notes
5. Review and roll out to production

### 5. Content Rating
Complete the content rating questionnaire to get your app rated for different regions.

### 6. App Signing
Google Play App Signing is recommended. If you haven't enrolled:
1. Go to "Release" > "Setup" > "App signing"
2. Follow the instructions to enroll

### 7. Review and Publish
1. Complete all required sections (they'll be marked with red exclamation marks)
2. Submit for review
3. Google will review your app (usually takes 1-3 days)
4. Once approved, your app will be live on the Play Store

## Important Notes

- **Version Management**: Increment `versionCode` in `app.json` for each new release
- **Testing**: Always test your APK thoroughly before uploading to Play Store
- **Updates**: Use the same keystore for all future updates
- **Backup**: Keep your keystore and passwords in a secure location

## Troubleshooting

### Common Build Issues:
1. **Java version**: Ensure you're using JDK 17+
2. **Android SDK**: Make sure Android SDK is properly installed
3. **Gradle**: Try `./gradlew clean` before building
4. **Memory issues**: Add `org.gradle.jvmargs=-Xmx4096m` to `gradle.properties`

### Play Store Rejection Reasons:
1. **Missing privacy policy** (required if app collects data)
2. **Inappropriate content rating**
3. **Missing required permissions explanations**
4. **App crashes or doesn't function properly**

For more detailed information, refer to the [Google Play Console Help](https://support.google.com/googleplay/android-developer/).