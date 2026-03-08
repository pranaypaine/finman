/**
 * Dashboard Screen
 * Main overview of financial status
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Financial Overview</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Spend</Text>
          <Text style={styles.cardValue}>₹0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Remaining Budget</Text>
          <Text style={styles.cardValue}>₹0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Credit Utilization</Text>
          <Text style={styles.cardValue}>0%</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
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
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});

export default DashboardScreen;
