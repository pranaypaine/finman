/**
 * Transactions Screen
 * List and manage all transactions
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

function TransactionsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emptyText}>No transactions yet</Text>
        <Text style={styles.emptySubtext}>
          Add your first transaction manually or sync your email to get started
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

export default TransactionsScreen;
