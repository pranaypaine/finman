/**
 * Settings Screen
 * App configuration and data management
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';

function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email Integration</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Connect Gmail</Text>
          <Text style={styles.settingValue}>Not connected</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>App Lock</Text>
          <Text style={styles.settingValue}>Off</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Export Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={[styles.settingLabel, styles.dangerText]}>Reset Database</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.aboutText}>FinTrack AI v0.1.0</Text>
        <Text style={styles.aboutSubtext}>Local-first personal finance manager</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
  },
  settingValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  dangerText: {
    color: '#FF3B30',
  },
  aboutText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 40,
  },
  aboutSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default SettingsScreen;
