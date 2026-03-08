/**
 * Transactions Screen
 * List and manage all transactions
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {useTransactions} from '@hooks';
import {TransactionCard} from '@components/TransactionCard';
import {TransactionForm} from '@components/TransactionForm';
import {Loading, ErrorDisplay, EmptyState} from '@components/UI';

function TransactionsScreen() {
  const {transactions, loading, error, refresh} = useTransactions();
  const [showForm, setShowForm] = useState(false);

  if (loading) {
    return <Loading message="Loading transactions..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refresh} />;
  }

  return (
    <View style={styles.container}>
      {transactions.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No transactions yet"
          message="Add your first transaction to start tracking your expenses"
          action={{
            label: 'Add Transaction',
            onPress: () => setShowForm(true),
          }}
        />
      ) : (
        <>
          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={({item}) => <TransactionCard transaction={item} />}
            contentContainerStyle={styles.list}
            onRefresh={refresh}
            refreshing={loading}
          />

          {/* Floating Action Button */}
          <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        </>
      )}

      <TransactionForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={refresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default TransactionsScreen;
