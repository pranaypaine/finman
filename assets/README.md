# App Assets

This folder contains the app icons and splash screens for FinTrack AI.

## Current Assets

All assets have been automatically generated with placeholder designs:

- **icon.png** (1024x1024) - Main app icon with blue background and "F" letter
- **splash.png** (2048x2048) - Splash screen shown while app loads
- **adaptive-icon.png** (1024x1024) - Android adaptive icon foreground layer
- **favicon.png** (48x48) - Web favicon for browser tab

## Customizing Assets

### Option 1: Replace Files Directly

Replace any of the PNG files above with your custom designs. Make sure to:
- Keep the same filename
- Use the correct dimensions
- Use PNG format
- For adaptive-icon.png, keep important content in center 66% area

### Option 2: Use Online Tools

- **App Icon Generator**: https://www.appicon.co/
- **Icon Kitchen** (AI-powered): https://icon.kitchen/
- **Figma** or **Canva**: Design from scratch

### Option 3: Regenerate Placeholders

If you need to regenerate the placeholder assets:

```bash
npm run generate-assets
```

This will recreate the blue "F" logo placeholders.

## Design Guidelines

### App Icon (icon.png)
- Size: 1024x1024 pixels
- Format: PNG with transparency (optional)
- Design: Simple, recognizable at small sizes
- Avoid: Small text, complex details
- Test: On both light and dark backgrounds

### Splash Screen (splash.png)
- Size: 2048x2048 pixels (or 1242x2436 for tall screens)
- Format: PNG
- Design: Centered logo + app name
- Background: Match your brand (currently white)
- Keep: Important content in center safe area

### Adaptive Icon (adaptive-icon.png)
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Design: Icon should fit within center 66% circle
- Important: Outer 18% may be cropped on some devices
- Background: Set in app.json (currently white)
- Guide: https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive

### Favicon (favicon.png)
- Size: 48x48 pixels (minimum)
- Format: PNG or ICO
- Design: High contrast, simple
- Purpose: Browser tab icon for web version

## Brand Colors

Current placeholder uses:
- Primary: `#007AFF` (iOS blue)
- Background: `#FFFFFF` (white)
- Text: White on blue

Replace these with your brand colors when customizing.

## After Customizing

After replacing any assets:

1. Clear Expo cache: `npm run expo:start -- -c`
2. Rebuild native apps if needed: `npm run expo:android` or `npm run expo:ios`
3. Test on both iOS and Android devices
4. Verify all sizes look good

## Resources

- [Expo Assets Documentation](https://docs.expo.dev/develop/user-interface/assets/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
