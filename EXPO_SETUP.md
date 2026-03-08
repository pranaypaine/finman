# Expo Testing Setup

This project now supports Expo for easier testing and development!

## Quick Start

### Method 1: Using Expo Dev Client (Recommended)

1. **Install Expo Go on your device** (optional, for simple testing)
   - iOS: Download from App Store
   - Android: Download from Google Play Store

2. **Start the development server**:
   ```bash
   npm run expo:start
   ```

3. **Run on device**:
   - Scan the QR code with your phone camera (iOS) or Expo Go app (Android)
   - Or press `a` for Android emulator, `i` for iOS simulator

### Method 2: Using Native Commands with Expo

For testing native modules (Gmail, SMS, Biometrics), you need a development build:

#### Android Development Build
```bash
# First time setup - generates android folder if needed
npm run expo:prebuild

# Build and run on device/emulator
npm run expo:android
```

#### iOS Development Build
```bash
# First time setup - generates ios folder if needed
npm run expo:prebuild

# Build and run on simulator
npm run expo:ios
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run expo:start` | Start Expo development server with dev client |
| `npm run expo:android` | Build and run on Android device/emulator |
| `npm run expo:ios` | Build and run on iOS simulator |
| `npm run expo:prebuild` | Generate native android/ios folders from Expo config |
| `npm start` | Start Metro bundler (traditional React Native) |
| `npm run android` | Run using React Native CLI (Android) |
| `npm run ios` | Run using React Native CLI (iOS) |

## Key Features with Expo

### ✅ Fast Refresh
- Hot reloading works seamlessly
- See changes instantly without full rebuilds

### ✅ Easy Testing
- Use Expo Go for quick testing of JavaScript changes
- Build dev client once, test native modules repeatedly

### ✅ Better Developer Experience
- Expo DevTools for debugging
- Network debugging
- Easy device selection

### ✅ Over-The-Air Updates
- Push updates without app store submissions (with EAS Update)

## Testing Native Features

Some features require native modules and won't work with Expo Go:

- ❌ Gmail OAuth (requires custom development build)
- ❌ SMS Reading (requires custom development build)
- ❌ Biometrics (requires custom development build)
- ✅ SQLite (works with Expo Go)
- ✅ Navigation (works with Expo Go)
- ✅ Most UI components (work with Expo Go)

### Building Custom Development Client

For testing Gmail, SMS, and Biometrics:

```bash
# Generate native projects
npm run expo:prebuild

# Build and install on device
npm run expo:android  # or expo:ios
```

This creates a custom Expo Go app with your native modules included.

## Using EAS Build (Cloud Builds)

For easier distribution and testing:

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS**:
   ```bash
   eas build:configure
   ```

4. **Build for development**:
   ```bash
   # Android development build
   eas build --profile development --platform android
   
   # iOS development build
   eas build --profile development --platform ios
   ```

5. **Install on device**:
   - Download the build from the provided URL
   - Install on your device
   - Run `npm run expo:start` and scan QR code

## Debugging

### Using Expo DevTools

```bash
npm run expo:start
```

Then press:
- `m` - Toggle menu
- `r` - Reload app
- `j` - Open debugger
- `a` - Run on Android
- `i` - Run on iOS

### React Native Debugger

Works with Expo! Just start the debugger and connect.

### Flipper

To use Flipper with Expo:

```bash
npm run expo:prebuild
npx expo run:android  # This enables Flipper
```

## Common Issues

### "Expo Go doesn't support Gmail OAuth"

**Solution**: Build a custom development client
```bash
npm run expo:prebuild
npm run expo:android
```

### Module not found errors

**Solution**: Clear cache and restart
```bash
npm start -- --reset-cache
# or
npx expo start -c
```

### Native module changes not reflected

**Solution**: Rebuild the native app
```bash
npm run expo:android  # or expo:ios
```

### Pod install fails (iOS)

**Solution**: Clean and reinstall
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run expo:ios
```

## Best Practices

1. **Use Expo Go for UI development** - Fast iteration on UI components
2. **Use Dev Client for native features** - Test Gmail, SMS, Biometrics
3. **Use `expo:prebuild` sparingly** - Only when changing native configuration
4. **Keep app.json updated** - Add new permissions and config there
5. **Test on real devices** - Especially for Gmail OAuth and SMS reading

## Switching Between Expo and React Native CLI

You can use both! They work side by side:

```bash
# Expo workflow
npm run expo:start

# Traditional React Native workflow
npm start
npm run android
```

Choose based on your needs:
- **Expo**: Faster development, better DX
- **React Native CLI**: Full native control, custom native code

## Next Steps

1. Start the dev server: `npm run expo:start`
2. Test UI changes in Expo Go
3. Build a dev client for testing native features
4. Consider EAS Build for team distribution

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Dev Client](https://docs.expo.dev/development/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Updates](https://docs.expo.dev/eas-update/introduction/)

## Support

For issues or questions:
- Expo Discord: https://chat.expo.dev/
- Expo Forums: https://forums.expo.dev/
- Stack Overflow: Tag `expo`
