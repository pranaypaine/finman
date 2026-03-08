/**
 * Cards Screen
 * Credit card overview and management
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl, Alert} from 'react-native';
import {useAccounts} from '@hooks';
import {AccountForm} from '@components/AccountForm';
import {Card, EmptyState, Loading, ErrorDisplay, Button} from '@components/UI';
import {AccountType} from '@types';
import type {Account} from '@types';
import {formatCurrency} from '@utils';
import * as AccountService from '@services/accounts';

function CardsScreen() {
  const {accounts, loading, error, refresh} = useAccounts();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const creditCards = accounts.filter(a => a.type === AccountType.CREDIT_CARD);
  const bankAccounts = accounts.filter(a => a.type === AccountType.BANK);

  const handleAccountPress = (account: Account) => {
    Alert.alert(
      account.name,
      `${account.bankName}\n•••• ${account.last4}${account.creditLimit ? `\nCredit Limit: ${formatCurrency(account.creditLimit)}` : ''}`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Edit',
          onPress: () => {
            setEditingAccount(account);
            setShowForm(true);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteAccount(account),
        },
      ],
    );
  };

  const handleDeleteAccount = (account: Account) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete ${account.name}? This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AccountService.deleteAccount(account.id);
              refresh();
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ],
    );
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  if (loading && accounts.length === 0) {
    return <Loading message="Loading accounts..." />;
  }

  if (error && accounts.length === 0) {
    return <ErrorDisplay message={error} onRetry={refresh} />;
  }

  if (accounts.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="💳"
          title="No accounts added"
          message="Add bank accounts and credit cards to start tracking"
          action={{
            label: 'Add Account',
            onPress: () => setShowForm(true),
          }}
        />
        <AccountForm
          visible={showForm}
          onClose={handleFormClose}
          onSuccess={refresh}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
      <View style={styles.content}>
        {creditCards.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Credit Cards</Text>
            {creditCards.map(card => (
              <Card
                key={card.id}
                style={styles.accountCard}
                onPress={() => handleAccountPress(card)}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>💳</Text>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{card.name}</Text>
                    <Text style={styles.cardDetails}>
                      {card.bankName} •••• {card.last4}
                    </Text>
                  </View>
                  <Text style={styles.editHint}>Tap to edit</Text>
                </View>

                {card.creditLimit && (
                  <View style={styles.cardStats}>
                    <View>
                      <Text style={styles.statLabel}>Credit Limit</Text>
                      <Text style={styles.statValue}>{formatCurrency(card.creditLimit)}</Text>
                    </View>
                    {card.statementDay && (
                      <View>
                        <Text style={styles.statLabel}>Statement Day</Text>
                        <Text style={styles.statValue}>{card.statementDay}</Text>
                      </View>
                    )}
                    {card.dueDay && (
                      <View>
                        <Text style={styles.statLabel}>Due Day</Text>
                        <Text style={styles.statValue}>{card.dueDay}</Text>
                      </View>
                    )}
                  </View>
                )}
              </Card>
            ))}
          </>
        )}

        {bankAccounts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Bank Accounts</Text>
            {bankAccounts.map(account => (
              <Card
                key={account.id}
                style={styles.accountCard}
                onPress={() => handleAccountPress(account)}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>🏦</Text>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{account.name}</Text>
                    <Text style={styles.cardDetails}>
                      {account.bankName} •••• {account.last4}
                    </Text>
                  </View>
                  <Text style={styles.editHint}>Tap to edit</Text>
                </View>
              </Card>
            ))}
          </>
        )}

        <Button
          title="Add Account"
          onPress={() => setShowForm(true)}
          variant="primary"
          style={styles.addButton}
        />
      </View>

      <AccountForm
        visible={showForm}
        account={editingAccount}
        onClose={handleFormClose}
        onSuccess={refresh}
      />
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    marginTop: 8,
  },
  accountCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  cardDetails: {
    fontSize: 14,
    color: '#8E8E93',
  },
  editHint: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});

export default CardsScreen;
