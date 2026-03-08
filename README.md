# FinTrack AI

A local-first personal finance manager built with React Native.

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

### Prerequisites

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

```bash
# Start Metro bundler
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## License

MIT
