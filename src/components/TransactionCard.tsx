/**
 * Transaction Card Component
 * Displays a single transaction with merchant, amount, category, and date
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import type {Transaction} from '@types';
import {formatCurrency, formatDate} from '@utils';
import {Category} from '@types';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

const CATEGORY_ICONS: Record<Category, string> = {
  [Category.FOOD]: '🍽️',
  [Category.TRANSPORT]: '🚗',
  [Category.SHOPPING]: '🛍️',
  [Category.BILLS]: '📄',
  [Category.ENTERTAINMENT]: '🎬',
  [Category.HEALTH]: '🏥',
  [Category.EDUCATION]: '📚',
  [Category.TRAVEL]: '✈️',
  [Category.GROCERIES]: '🛒',
  [Category.OTHERS]: '📦',
  [Category.UNCATEGORIZED]: '❓',
};

export function TransactionCard({transaction, onPress}: TransactionCardProps) {
  const icon = CATEGORY_ICONS[transaction.category as Category] || '❓';
  const date = new Date(transaction.transactionDate);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.merchant} numberOfLines={1}>
            {transaction.merchant}
          </Text>
          <Text style={styles.amount}>{formatCurrency(transaction.amount)}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.category}>{transaction.category}</Text>
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>

        {transaction.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {transaction.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  merchant: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 13,
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 13,
    color: '#8E8E93',
  },
  notes: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
