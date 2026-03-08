/**
 * Cards Screen
 * Credit card overview and management
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

function CardsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emptyText}>No credit cards added</Text>
        <Text style={styles.emptySubtext}>
          Add credit cards to track utilization and payment due dates
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default CardsScreen;
