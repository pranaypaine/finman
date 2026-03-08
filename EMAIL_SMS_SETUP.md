# Email and SMS Integration Setup

This guide explains how to set up automatic transaction import from Gmail and SMS.

## Gmail Integration Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Fill in required fields:
   - App name: "FinTrack AI"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
5. Add test users (your Gmail accounts)
6. Save and continue

### 3. Create OAuth 2.0 Credentials

#### For Android:

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Android" as application type
4. Get your SHA-1 fingerprint:
   ```bash
   # Debug keystore
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Production keystore
   keytool -list -v -keystore /path/to/your/keystore -alias your-key-alias
   ```
5. Enter:
   - Package name: `com.finman` (from your android/app/build.gradle)
   - SHA-1 certificate fingerprint: (from above command)
6. Create the credential

#### For iOS:

1. Create OAuth client ID
2. Select "iOS" as application type
3. Enter Bundle ID: (from your ios project)
4. Create the credential

#### For Web (Required for React Native):

1. Create another OAuth client ID
2. Select "Web application"
3. No need to configure authorized domains for local testing
4. Copy the **Client ID** (ends with `.apps.googleusercontent.com`)

### 4. Update App Configuration

1. Open `src/services/email/gmailClient.ts`
2. Replace `YOUR_WEB_CLIENT_ID` with your Web OAuth Client ID:
   ```typescript
   const WEB_CLIENT_ID = 'xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com';
   ```

### 5. Android Specific Setup

No additional configuration needed! The package handles everything.

### 6. iOS Specific Setup

1. Install pods:
   ```bash
   cd ios && pod install && cd ..
   ```

2. Add URL scheme in `ios/finman/Info.plist`:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID</string>
       </array>
     </dict>
   </array>
   ```
   Replace `YOUR_REVERSED_CLIENT_ID` with your client ID reversed.

## SMS Integration Setup (Android Only)

### Automatic Setup

The app will automatically request SMS permission when you try to enable SMS sync.

### Manual Permission Grant

If needed, you can manually grant permission:

1. Open your Android Settings
2. Go to Apps > FinTrack AI > Permissions
3. Enable "SMS" permission

### Note for iOS

SMS reading is **not available on iOS** due to platform restrictions. iOS does not allow apps to read SMS messages for privacy reasons.

## Testing

### Test Gmail Integration

1. Open the app and go to Settings
2. Tap "Connect Gmail"
3. Sign in with your Google account
4. Grant permissions
5. Tap "Sync Now"
6. Select an account to import transactions to
7. Check the Transactions screen for imported transactions

### Test SMS Integration (Android)

1. Open the app and go to Settings
2. Tap "Grant Permission" under SMS Reader
3. Allow SMS permission
4. Tap "Sync SMS"
5. Select an account
6. Check the Transactions screen for imported transactions

## Supported Banks and SMS Formats

The parser currently supports common transaction formats from:

### Email Banks:
- HDFC Bank
- ICICI Bank
- SBI
- Axis Bank
- Kotak Bank
- And most major banks with standard transaction email formats

### SMS Banks (Android):
- HDFC Bank
- ICICI Bank
- SBI
- Axis Bank
- Kotak Bank
- Paytm
- Google Pay
- PhonePe

### Supported Formats

The parser looks for keywords like:
- "debited"
- "spent"
- "charged"
- "transaction"
- "payment"
- "purchase"
- "withdrawn"

And extracts:
- Amount (INR, Rs., ₹, USD, $)
- Merchant name
- Transaction date
- Auto-categorization based on merchant

## Troubleshooting

### Gmail Sign-In Fails

1. Check that you've enabled Gmail API in Google Cloud Console
2. Verify the Web Client ID is correct
3. Make sure test users are added in OAuth consent screen
4. Try clearing app data and signing in again

### No Transactions Imported

1. Check that emails contain transaction keywords
2. Verify date range (default is last 30 days)
3. Check processed emails to avoid duplicates
4. Review email parser patterns in `emailParser.ts`

### SMS Permission Denied

1. Manually grant permission in Android Settings
2. Reinstall the app if needed
3. On some devices, you may need to enable "Install from Unknown Sources"

### Duplicate Transactions

The app tracks processed emails and SMS to avoid duplicates. If you see duplicates:

1. Check the `processed_emails` table in the database
2. Each email/SMS is tracked by its unique ID
3. Clearing the database will cause re-imports

## Privacy & Security

- **All data stays local**: No data is sent to any server
- **OAuth tokens**: Stored securely using React Native Keychain
- **SMS data**: Only transaction SMS are processed, all data stays on device
- **Encryption**: Database can be encrypted using SQLCipher
- **Permissions**: Minimal permissions requested (Gmail read-only, SMS read on Android)

## Customization

### Adding New Bank Patterns

Edit `src/services/email/emailParser.ts` and `src/services/sms/index.ts` to add custom patterns for your bank.

### Changing Sync Frequency

Modify the `daysBack` parameter in sync functions to adjust how far back to look for transactions.

### Custom Categorization

Update the auto-categorization logic in the parser files to match your spending patterns.
