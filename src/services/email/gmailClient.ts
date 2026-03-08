/**
 * Gmail API Client
 * Handles OAuth authentication and email fetching
 */

import {GoogleSignin} from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
// You'll need to add your Web Client ID from Google Cloud Console
const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  });
}

/**
 * Sign in to Gmail account
 */
export async function signInToGmail(): Promise<{success: boolean; error?: string}> {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    return {success: true};
  } catch (error: any) {
    console.error('Gmail sign-in error:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Sign out from Gmail
 */
export async function signOutFromGmail(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Gmail sign-out error:', error);
  }
}

/**
 * Check if user is signed in
 */
export async function isSignedIn(): Promise<boolean> {
  return GoogleSignin.isSignedIn();
}

/**
 * Get current user info
 */
export async function getCurrentUser() {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    return userInfo;
  } catch (error) {
    return null;
  }
}

/**
 * Get access token for API calls
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Fetch emails from Gmail API
 */
export async function fetchEmails(query: string, maxResults: number = 50): Promise<any[]> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    // First, get list of message IDs
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const listData = await listResponse.json();

    if (!listData.messages || listData.messages.length === 0) {
      return [];
    }

    // Fetch full message details for each message
    const messages = await Promise.all(
      listData.messages.map(async (msg: {id: string}) => {
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        return msgResponse.json();
      }),
    );

    return messages;
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
}

/**
 * Search for transaction-related emails
 */
export async function fetchTransactionEmails(since?: Date): Promise<any[]> {
  // Gmail search query for common transaction keywords
  const keywords = [
    'debited',
    'spent',
    'charged',
    'transaction',
    'payment',
    'purchase',
    'withdrawal',
  ];

  let query = `(${keywords.join(' OR ')})`;

  // Add date filter if provided
  if (since) {
    const dateStr = since.toISOString().split('T')[0].replace(/-/g, '/');
    query += ` after:${dateStr}`;
  }

  return fetchEmails(query);
}
