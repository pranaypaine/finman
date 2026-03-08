/**
 * Spending Trend Chart
 * Line chart showing spending over the last 6 months
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {VictoryChart, VictoryLine, VictoryAxis, VictoryTheme} from 'victory-native';
import * as TransactionService from '@services/transactions';

const {width} = Dimensions.get('window');

interface MonthData {
  month: string;
  amount: number;
}

export function SpendingTrendChart() {
  const [data, setData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const monthsToShow = 6;
      const monthData: MonthData[] = [];
      const now = new Date();

      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const spent = await TransactionService.getTotalSpent(start, end);
        const monthName = date.toLocaleString('default', {month: 'short'});

        monthData.push({
          month: monthName,
          amount: spent / 100, // Convert cents to dollars
        });
      }

      setData(monthData);
    } catch (error) {
      console.error('Error loading spending trend:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Spending Trend</Text>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Spending Trend</Text>
        <Text style={styles.empty}>No data available</Text>
      </View>
    );
  }

  const chartData = data.map((d, index) => ({x: index + 1, y: d.amount}));
  const maxAmount = Math.max(...data.map(d => d.amount));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending Trend</Text>
      <VictoryChart
        width={width - 48}
        height={200}
        theme={VictoryTheme.material}
        padding={{top: 10, bottom: 40, left: 50, right: 20}}>
        <VictoryAxis
          tickValues={data.map((_, i) => i + 1)}
          tickFormat={data.map(d => d.month)}
          style={{
            tickLabels: {fontSize: 10, padding: 5},
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => `$${Math.round(t)}`}
          style={{
            tickLabels: {fontSize: 10, padding: 5},
          }}
        />
        <VictoryLine
          data={chartData}
          style={{
            data: {stroke: '#007AFF', strokeWidth: 3},
          }}
          interpolation="monotoneX"
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  loading: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 40,
  },
  empty: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 40,
  },
});
