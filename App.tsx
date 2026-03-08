/**
 * Main App Component
 * Entry point for FinTrack AI
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {initializeDatabase} from '@database/db';
import RootNavigator from '@navigation/RootNavigator';

function App(): React.JSX.Element {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        console.log('Initializing FinTrack AI...');
        await initializeDatabase();
        console.log('Database initialized successfully');
        setIsReady(true);
      } catch (err) {
        console.error('Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    }

    initialize();
  }, []);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Initialization Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isReady) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing FinTrack AI...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default App;
