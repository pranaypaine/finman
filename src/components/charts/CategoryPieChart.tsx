/**
 * Category Pie Chart
 * Pie chart showing spending breakdown by category for current month
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {VictoryPie, VictoryLegend} from 'victory-native';
import * as TransactionService from '@services/transactions';
import {Category} from '@types';

const {width} = Dimensions.get('window');

interface CategoryData {
  x: string;
  y: number;
  color: string;
}

const CATEGORY_COLORS: Partial<Record<Category, string>> = {
  [Category.FOOD]: '#FF6B6B',
  [Category.TRANSPORT]: '#4ECDC4',
  [Category.SHOPPING]: '#45B7D1',
  [Category.ENTERTAINMENT]: '#FFA07A',
  [Category.BILLS]: '#98D8C8',
  [Category.HEALTH]: '#F7DC6F',
  [Category.EDUCATION]: '#BB8FCE',
  [Category.TRAVEL]: '#85C1E2',
  [Category.GROCERIES]: '#52C41A',
  [Category.OTHERS]: '#95A5A6',
  [Category.UNCATEGORIZED]: '#8E8E93',
};

export function CategoryPieChart() {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const transactions = await TransactionService.getTransactionsByDateRange(start, end);

      // Group by category
      const categoryTotals: Record<string, number> = {};
      let total = 0;

      transactions.forEach(t => {
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += t.amount;
        total += t.amount;
      });

      // Convert to chart data
      const chartData: CategoryData[] = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          x: category,
          y: amount / 100, // Convert to dollars
          color: CATEGORY_COLORS[category as Category] || CATEGORY_COLORS[Category.OTHERS] || '#95A5A6',
        }))
        .sort((a, b) => b.y - a.y);

      setData(chartData);
      setTotalSpent(total / 100);
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Category Breakdown</Text>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Category Breakdown</Text>
        <Text style={styles.empty}>No transactions this month</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Category Breakdown</Text>
      <Text style={styles.subtitle}>This Month: ${totalSpent.toFixed(2)}</Text>

      <View style={styles.chartContainer}>
        <VictoryPie
          data={data}
          width={width - 48}
          height={250}
          colorScale={data.map(d => d.color)}
          innerRadius={50}
          labelRadius={({ innerRadius }) => (innerRadius as number) + 30}
          style={{
            labels: {fontSize: 12, fill: '#000'},
          }}
          labels={({datum}) => `${datum.x}\n$${datum.y.toFixed(0)}`}
        />
      </View>

      <View style={styles.legend}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, {backgroundColor: item.color}]} />
            <Text style={styles.legendText}>
              {item.x}: ${item.y.toFixed(2)} ({((item.y / totalSpent) * 100).toFixed(1)}%)
            </Text>
          </View>
        ))}
      </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
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
  legend: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#000',
  },
});
