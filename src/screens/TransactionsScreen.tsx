/**
 * Transactions Screen
 * List and manage all transactions
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {useTransactions} from '@hooks';
import {TransactionCard} from '@components/TransactionCard';
import {TransactionForm} from '@components/TransactionForm';
import {Loading, ErrorDisplay, EmptyState} from '@components/UI';
import {Category} from '@types';
import type {Transaction} from '@types';
import * as TransactionService from '@services/transactions';

function TransactionsScreen() {
  const {transactions: allTransactions, loading, error, refresh} = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  // Filter transactions based on search and category
  useEffect(() => {
    let filtered = allTransactions;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search query (merchant name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.merchant.toLowerCase().includes(query));
    }

    setFilteredTransactions(filtered);
  }, [allTransactions, selectedCategory, searchQuery]);

  const handleTransactionPress = (transaction: Transaction) => {
    Alert.alert(
      transaction.merchant,
      `Amount: ₹${(transaction.amount / 100).toFixed(2)}\nCategory: ${transaction.category}\nDate: ${new Date(transaction.transactionDate).toLocaleDateString()}\n${transaction.notes ? `\nNotes: ${transaction.notes}` : ''}`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Edit',
          onPress: () => {
            setEditingTransaction(transaction);
            setShowForm(true);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteTransaction(transaction),
        },
      ],
    );
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete this transaction from ${transaction.merchant}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TransactionService.deleteTransaction(transaction.id);
              refresh();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ],
    );
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  if (loading && allTransactions.length === 0) {
    return <Loading message="Loading transactions..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refresh} />;
  }

  const categories: Array<{value: Category | 'all'; label: string; icon: string}> = [
    {value: 'all', label: 'All', icon: '📋'},
    {value: Category.FOOD, label: 'Food', icon: '🍽️'},
    {value: Category.TRANSPORT, label: 'Transport', icon: '🚗'},
    {value: Category.SHOPPING, label: 'Shopping', icon: '🛍️'},
    {value: Category.GROCERIES, label: 'Groceries', icon: '🛒'},
    {value: Category.BILLS, label: 'Bills', icon: '📄'},
    {value: Category.ENTERTAINMENT, label: 'Fun', icon: '🎬'},
  ];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by merchant..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
        {(searchQuery || selectedCategory !== 'all') && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={item => item.value}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === item.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(item.value)}>
              <Text style={styles.filterIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  selectedCategory === item.value && styles.filterLabelActive,
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon={allTransactions.length === 0 ? '📝' : '🔍'}
            title={allTransactions.length === 0 ? 'No transactions yet' : 'No results found'}
            message={
              allTransactions.length === 0
                ? 'Add your first transaction to start tracking your expenses'
                : 'Try adjusting your filters or search query'
            }
            action={
              allTransactions.length === 0
                ? {
                    label: 'Add Transaction',
                    onPress: () => setShowForm(true),
                  }
                : undefined
            }
          />
        </View>
      ) : (
        <>
          <FlatList
            data={filteredTransactions}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TransactionCard transaction={item} onPress={() => handleTransactionPress(item)} />
            )}
            contentContainerStyle={styles.list}
            onRefresh={refresh}
            refreshing={loading}
          />

          {/* Result Count */}
          {(searchQuery || selectedCategory !== 'all') && (
            <View style={styles.resultCount}>
              <Text style={styles.resultCountText}>
                {filteredTransactions.length} of {allTransactions.length} transactions
              </Text>
            </View>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <TransactionForm
        visible={showForm}
        transaction={editingTransaction}
        onClose={handleFormClose}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#000000',
  },
  clearIcon: {
    fontSize: 20,
    color: '#8E8E93',
    padding: 4,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  filterLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  filterLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  resultCount: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resultCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
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
