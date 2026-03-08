# FinTrack AI

A local-first personal finance manager built with React Native.

## Quick Start (Expo - Recommended for Testing) 🚀

Try the app immediately without complex setup:

```bash
# Option 1: Use the interactive script
./start.sh

# Option 2: Direct commands
npm run expo:start        # Start dev server (scan QR code)
npm run expo:android      # Run on Android device/emulator
npm run expo:ios          # Run on iOS simulator
```

**📚 Full Expo Guide**: See [EXPO_SETUP.md](EXPO_SETUP.md) for detailed instructions.

**Note**: Gmail and SMS features require a custom dev build (not Expo Go).

## Features

- 📧 Automatic transaction parsing from emails
- 💳 Credit card tracking and utilization monitoring
- 📊 Budget management with progress tracking
- 🤖 AI-powered expense categorization
- 💡 Smart financial insights
- 🔒 Secure local storage with encryption
- 📱 Offline-first architecture

## Tech Stack

- React Native with TypeScript
- SQLite with Drizzle ORM
- ONNX Runtime for on-device ML
- React Navigation
- Victory Native for charts

## Getting Started

### Quick Start with Expo (Easiest)

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start testing**:
   ```bash
   # Interactive menu
   ./start.sh
   
   # Or directly
   npm run expo:start
   ```

3. **Run on device**:
   - iOS: Scan QR code with Camera app
   - Android: Scan QR code with Expo Go app
   - Or press `a` for Android, `i` for iOS simulator

See [EXPO_SETUP.md](EXPO_SETUP.md) for full details.

### Traditional React Native CLI Setup

#### Prerequisites

- Node.js 18+
- React Native development environment set up
- iOS: Xcode and CocoaPods
- Android: Android Studio and SDK

### Installation

```bash
npm install
```

### iOS Setup

```bash
cd ios && pod install && cd ..
npm run ios
```

### Android Setup

```bash
npm run android
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── database/       # Database schema and migrations
├── services/       # Business logic services
├── ai/            # ML models and inference
├── utils/         # Utility functions
├── hooks/         # Custom React hooks
└── types/         # TypeScript type definitions
```

## Development

### Available Scripts

**Expo (Recommended):**
- `npm run expo:start` - Start Expo dev server
- `npm run expo:android` - Build and run on Android
- `npm run expo:ios` - Build and run on iOS
- `npm run expo:prebuild` - Generate native folders
- `./start.sh` - Interactive start menu

**React Native CLI (Traditional):**
- `npm start` - Start Metro bundler
- `npm run android` - Run on Android (CLI)
- `npm run ios` - Run on iOS (CLI)

**Other:**
- `npm test` - Run tests
- `npm run lint` - Lint code

### Testing Native Features

For Gmail OAuth and SMS reading:

```bash
# Build custom dev client
npm run expo:prebuild
npm run expo:android  # or expo:ios
```

## Documentation

- [Expo Setup Guide](EXPO_SETUP.md) - Testing with Expo
- [Email & SMS Setup](EMAIL_SMS_SETUP.md) - Configure auto-import
- [Project Plan](plan.md) - Full project roadmap

## License

MIT
