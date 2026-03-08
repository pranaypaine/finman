/**
 * Settings Screen
 * App configuration and data management
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import * as EmailService from '@services/email';
import * as SmsService from '@services/sms';
import * as ExportService from '@services/export';
import {useAccounts} from '@hooks';
import {Button, Card} from '@components/UI';
import {Account} from '@types';

function SettingsScreen() {
  const {accounts, refresh: refreshAccounts} = useAccounts();
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [gmailUser, setGmailUser] = useState<any>(null);
  const [hasSmsPermission, setHasSmsPermission] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [syncType, setSyncType] = useState<'email' | 'sms' | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    checkGmailStatus();
    checkSmsStatus();
  }, []);

  const checkGmailStatus = async () => {
    const connected = await EmailService.isSignedIn();
    setIsGmailConnected(connected);
    if (connected) {
      const user = await EmailService.getCurrentUser();
      setGmailUser(user);
    }
  };

  const checkSmsStatus = async () => {
    const hasPermission = await SmsService.hasSmsPermission();
    setHasSmsPermission(hasPermission);
  };

  const handleConnectGmail = async () => {
    const result = await EmailService.signInToGmail();
    if (result.success) {
      Alert.alert('Success', 'Gmail connected successfully');
      await checkGmailStatus();
    } else {
      Alert.alert('Error', result.error || 'Failed to connect Gmail');
    }
  };

  const handleDisconnectGmail = async () => {
    Alert.alert('Disconnect Gmail', 'Are you sure you want to disconnect Gmail?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          await EmailService.signOutFromGmail();
          setIsGmailConnected(false);
          setGmailUser(null);
        },
      },
    ]);
  };

  const handleRequestSmsPermission = async () => {
    const granted = await SmsService.requestSmsPermission();
    if (granted) {
      Alert.alert('Success', 'SMS permission granted');
      await checkSmsStatus();
    } else {
      Alert.alert('Permission Denied', 'SMS reading permission was not granted');
    }
  };

  const handleSyncEmail = () => {
    if (!isGmailConnected) {
      Alert.alert('Not Connected', 'Please connect Gmail first');
      return;
    }
    if (accounts.length === 0) {
      Alert.alert('No Accounts', 'Please add a bank account first');
      return;
    }
    setSyncType('email');
    setShowAccountPicker(true);
  };

  const handleSyncSms = () => {
    if (!hasSmsPermission) {
      Alert.alert('Permission Required', 'Please grant SMS permission first');
      return;
    }
    if (accounts.length === 0) {
      Alert.alert('No Accounts', 'Please add a bank account first');
      return;
    }
    setSyncType('sms');
    setShowAccountPicker(true);
  };

  const performSync = async (accountId: string) => {
    setShowAccountPicker(false);
    setSyncing(true);

    try {
      let result;
      if (syncType === 'email') {
        result = await EmailService.syncTransactionsFromGmail(accountId, 30);
      } else if (syncType === 'sms') {
        result = await SmsService.syncTransactionsFromSms(accountId, 30);
      }

      if (result && result.success) {
        Alert.alert(
          'Sync Complete',
          `Imported ${result.imported} new transactions\nSkipped ${result.skipped} duplicates`,
        );
      } else {
        Alert.alert('Sync Failed', result?.error || 'Unknown error');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = async (type: 'transactions' | 'accounts' | 'budgets' | 'all') => {
    setExporting(true);
    try {
      let path: string;
      let filename: string;

      switch (type) {
        case 'transactions':
          path = await ExportService.exportTransactionsCSV();
          filename = 'transactions';
          break;
        case 'accounts':
          path = await ExportService.exportAccountsCSV();
          filename = 'accounts';
          break;
        case 'budgets':
          path = await ExportService.exportBudgetsCSV();
          filename = 'budgets';
          break;
        case 'all':
          path = await ExportService.exportAllDataJSON();
          filename = 'full backup';
          break;
        default:
          throw new Error('Invalid export type');
      }

      Alert.alert(
        'Export Successful',
        `Your ${filename} have been exported.\n\nLocation: ${ExportService.getExportPath()}`,
        [
          {text: 'OK', style: 'default'},
          {
            text: 'Open Folder',
            onPress: () => {
              if (Platform.OS === 'android') {
                Linking.openURL('content://com.android.externalstorage.documents/document/primary%3ADownload');
              }
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('Export Failed', error.message || 'An error occurred during export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Automatic Transaction Import</Text>

        <Card style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <View>
              <Text style={styles.settingLabel}>Gmail Integration</Text>
              <Text style={styles.settingSubtext}>
                {isGmailConnected
                  ? `Connected as ${gmailUser?.user?.email || 'Unknown'}`
                  : 'Connect to import transactions from emails'}
              </Text>
            </View>
          </View>

          {isGmailConnected ? (
            <View style={styles.buttonRow}>
              <Button
                title="Sync Now"
                onPress={handleSyncEmail}
                variant="primary"
                style={styles.actionButton}
                disabled={syncing}
              />
              <Button
                title="Disconnect"
                onPress={handleDisconnectGmail}
                variant="secondary"
                style={styles.actionButton}
              />
            </View>
          ) : (
            <Button
              title="Connect Gmail"
              onPress={handleConnectGmail}
              variant="primary"
              style={styles.fullButton}
            />
          )}
        </Card>

        {Platform.OS === 'android' && (
          <Card style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <View>
                <Text style={styles.settingLabel}>SMS Reader (Android)</Text>
                <Text style={styles.settingSubtext}>
                  {hasSmsPermission
                    ? 'Permission granted - can read transaction SMS'
                    : 'Allow reading SMS for bank transaction alerts'}
                </Text>
              </View>
            </View>

            {hasSmsPermission ? (
              <Button
                title="Sync SMS"
                onPress={handleSyncSms}
                variant="primary"
                style={styles.fullButton}
                disabled={syncing}
              />
            ) : (
              <Button
                title="Grant Permission"
                onPress={handleRequestSmsPermission}
                variant="primary"
                style={styles.fullButton}
              />
            )}
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>App Lock</Text>
          <Text style={styles.settingValue}>Coming Soon</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <Card style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>Export Data</Text>
            <Text style={styles.settingSubtext}>
              Export your financial data as CSV or JSON files
            </Text>
          </View>

          <View style={styles.exportButtonGrid}>
            <Button
              title="Transactions"
              onPress={() => handleExport('transactions')}
              variant="secondary"
              style={styles.exportButton}
              disabled={exporting}
            />
            <Button
              title="Accounts"
              onPress={() => handleExport('accounts')}
              variant="secondary"
              style={styles.exportButton}
              disabled={exporting}
            />
            <Button
              title="Budgets"
              onPress={() => handleExport('budgets')}
              variant="secondary"
              style={styles.exportButton}
              disabled={exporting}
            />
            <Button
              title="Full Backup"
              onPress={() => handleExport('all')}
              variant="primary"
              style={styles.exportButton}
              disabled={exporting}
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={[styles.settingLabel, styles.dangerText]}>Reset Database</Text>
          <Text style={styles.settingValue}>Coming Soon</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.aboutText}>FinTrack AI v0.1.0</Text>
        <Text style={styles.aboutSubtext}>Local-first personal finance manager</Text>
      </View>

      {/* Account Picker Modal */}
      <Modal visible={showAccountPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Account to Sync</Text>
            <Text style={styles.modalSubtitle}>
              Choose which account these transactions belong to
            </Text>

            <ScrollView style={styles.accountList}>
              {accounts.map(account => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.accountItem}
                  onPress={() => performSync(account.id)}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountBank}>{account.bankName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button
              title="Cancel"
              onPress={() => setShowAccountPicker(false)}
              variant="secondary"
              style={styles.fullButton}
            />
          </View>
        </View>
      </Modal>

      {/* Syncing Overlay */}
      {syncing && (
        <View style={styles.syncingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.syncingText}>Syncing transactions...</Text>
        </View>
      )}
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
  settingCard: {
    marginBottom: 12,
  },
  settingHeader: {
    marginBottom: 16,
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
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  settingSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  fullButton: {
    marginTop: 8,
  },
  exportButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exportButton: {
    flex: 1,
    minWidth: '45%',
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
    marginBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  accountList: {
    marginBottom: 16,
  },
  accountItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    marginBottom: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  accountBank: {
    fontSize: 14,
    color: '#8E8E93',
  },
  syncingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
});

export default SettingsScreen;
