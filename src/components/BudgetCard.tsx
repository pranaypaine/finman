/**
 * Budget Card Component
 * Displays budget progress with visual indicator
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import type {BudgetProgress} from '@types';
import {formatCurrency} from '@utils';
import {Category} from '@types';

interface BudgetCardProps {
  budgetProgress: BudgetProgress;
  onPress?: () => void;
  onLongPress?: () => void;
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

export function BudgetCard({budgetProgress, onPress, onLongPress}: BudgetCardProps) {
  const {budget, spent, remaining, percentage} = budgetProgress;
  const icon = CATEGORY_ICONS[budget.category as Category] || '❓';

  // Determine color based on percentage
  let progressColor = '#34C759'; // Green
  if (percentage >= 90) {
    progressColor = '#FF3B30'; // Red
  } else if (percentage >= 70) {
    progressColor = '#FF9500'; // Orange
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.category}>{budget.category}</Text>
        </View>
        <Text style={[styles.percentage, {color: progressColor}]}>
          {percentage}%
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, {backgroundColor: progressColor, width: `${Math.min(percentage, 100)}%`}]} />
      </View>

      <View style={styles.footer}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Spent</Text>
          <Text style={styles.amount}>{formatCurrency(spent)}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Limit</Text>
          <Text style={styles.amount}>{formatCurrency(budget.monthlyLimit)}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Left</Text>
          <Text style={[styles.amount, remaining <= 0 && styles.amountNegative]}>
            {formatCurrency(remaining)}
          </Text>
        </View>
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textTransform: 'capitalize',
  },
  percentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountContainer: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  amountNegative: {
    color: '#FF3B30',
  },
});
