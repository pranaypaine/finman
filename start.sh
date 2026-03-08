#!/bin/bash

# FinTrack AI - Quick Start Script
# Easily launch the app with Expo for testing

echo "🚀 FinTrack AI - Expo Quick Start"
echo "=================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
    echo ""
fi

echo "Choose how you want to run the app:"
echo ""
echo "1) Expo Dev Server (Recommended for testing)"
echo "2) Expo Android Build (for native features)"
echo "3) Expo iOS Build (for native features)"
echo "4) React Native CLI Android"
echo "5) React Native CLI iOS"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🎯 Starting Expo Dev Server..."
        echo "📱 Scan the QR code with:"
        echo "   - iOS: Camera app"
        echo "   - Android: Expo Go app"
        echo ""
        echo "Note: Gmail & SMS features need a dev build (option 2 or 3)"
        npm run expo:start
        ;;
    2)
        echo ""
        echo "🤖 Building for Android..."
        echo "This will install the app on your connected Android device/emulator"
        npm run expo:android
        ;;
    3)
        echo ""
        echo "🍎 Building for iOS..."
        echo "This will install the app on iOS simulator"
        npm run expo:ios
        ;;
    4)
        echo ""
        echo "🤖 Running with React Native CLI (Android)..."
        npm run android
        ;;
    5)
        echo ""
        echo "🍎 Running with React Native CLI (iOS)..."
        npm run ios
        ;;
    *)
        echo ""
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac
