/**
 * Budgets Screen
 * Manage category budgets
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Alert} from 'react-native';
import {useBudgetStatus} from '@hooks';
import {BudgetCard} from '@components/BudgetCard';
import {BudgetForm} from '@components/BudgetForm';
import {Loading, ErrorDisplay, EmptyState} from '@components/UI';
import {formatCurrency} from '@utils';
import * as BudgetService from '@services/budgets';
import type {Budget, BudgetProgress} from '@types';

function BudgetsScreen() {
  const {budgetProgress, totalLimit, totalSpent, remainingBudget, percentage, loading, error, refresh} = useBudgetStatus();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const handleBudgetPress = (progress: BudgetProgress) => {
    setEditingBudget(progress.budget);
    setShowForm(true);
  };

  const handleBudgetLongPress = (progress: BudgetProgress) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete the ${progress.budget.category} budget?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await BudgetService.deleteBudget(progress.budget.id);
              refresh();
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ],
    );
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  if (loading) {
    return <Loading message="Loading budgets..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refresh} />;
  }

  // Determine overall status color
  let statusColor = '#34C759'; // Green
  if (percentage >= 90) {
    statusColor = '#FF3B30'; // Red
  } else if (percentage >= 70) {
    statusColor = '#FF9500'; // Orange
  }

  return (
    <View style={styles.container}>
      {budgetProgress.length === 0 ? (
        <EmptyState
          icon="💰"
          title="No budgets set"
          message="Create budgets to track your spending by category"
          action={{
            label: 'Create Budget',
            onPress: () => setShowForm(true),
          }}
        />
      ) : (
        <>
          {/* Overall Budget Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Monthly Budget Overview</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Budget</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(totalLimit)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Spent</Text>
                <Text style={[styles.summaryAmount, {color: statusColor}]}>
                  {formatCurrency(totalSpent)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Remaining</Text>
                <Text style={[styles.summaryAmount, remainingBudget <= 0 && {color: '#FF3B30'}]}>
                  {formatCurrency(remainingBudget)}
                </Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {backgroundColor: statusColor, width: `${Math.min(percentage, 100)}%`},
                ]}
              />
            </View>
            <Text style={[styles.percentageText, {color: statusColor}]}>
              {percentage}% of budget used
            </Text>
          </View>

          {/* Budget List */}
          <FlatList
            data={budgetProgress}
            keyExtractor={item => item.budget.id}
            renderItem={({item}) => (
              <BudgetCard
                budgetProgress={item}
                onPress={() => handleBudgetPress(item)}
                onLongPress={() => handleBudgetLongPress(item)}
              />
            )}
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

      <BudgetForm
        visible={showForm}
        budget={editingBudget}
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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

export default BudgetsScreen;
