/**
 * Dashboard Screen
 * Main overview of financial status
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {useMonthlySpend, useBudgetStatus, useCardUtilization, useRecentTransactions} from '@hooks';
import {TransactionCard} from '@components/TransactionCard';
import {Card, Loading} from '@components/UI';
import {formatCurrency} from '@utils';

function DashboardScreen() {
  const {totalSpend, loading: spendLoading, refresh: refreshSpend} = useMonthlySpend();
  const {
    remainingBudget,
    percentage: budgetPercentage,
    loading: budgetLoading,
    refresh: refreshBudget,
  } = useBudgetStatus();
  const {
    utilization,
    loading: utilizationLoading,
    refresh: refreshUtilization,
  } = useCardUtilization();
  const {transactions, loading: transactionsLoading, refresh: refreshTransactions} =
    useRecentTransactions();

  const loading = spendLoading || budgetLoading || utilizationLoading || transactionsLoading;

  const handleRefresh = async () => {
    await Promise.all([refreshSpend(), refreshBudget(), refreshUtilization(), refreshTransactions()]);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Financial Overview</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Spend</Text>
          <Text style={styles.cardValue}>{formatCurrency(totalSpend)}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Remaining Budget</Text>
          <View style={styles.budgetContainer}>
            <Text style={styles.cardValue}>{formatCurrency(Math.max(0, remainingBudget))}</Text>
            {budgetPercentage > 0 && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, budgetPercentage)}%`,
                      backgroundColor:
                        budgetPercentage >= 100
                          ? '#FF3B30'
                          : budgetPercentage >= 80
                            ? '#FF9500'
                            : '#34C759',
                    },
                  ]}
                />
              </View>
            )}
            {budgetPercentage > 0 && (
              <Text
                style={[
                  styles.percentageText,
                  budgetPercentage >= 80 && styles.percentageWarning,
                ]}>
                {budgetPercentage}% used
              </Text>
            )}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Credit Utilization</Text>
          <Text style={styles.cardValue}>{utilization}%</Text>
          {utilization > 0 && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, utilization)}%`,
                    backgroundColor:
                      utilization >= 70 ? '#FF3B30' : utilization >= 50 ? '#FF9500' : '#34C759',
                  },
                ]}
              />
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet</Text>
          ) : (
            <View style={styles.transactions}>
              {transactions.map(transaction => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </View>
          )}
        </Card>
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
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  budgetContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 6,
  },
  percentageWarning: {
    color: '#FF9500',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 8,
  },
  transactions: {
    marginTop: 12,
    gap: 8,
  },
});

export default DashboardScreen;
