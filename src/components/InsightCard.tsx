/**
 * Insight Card Component
 * Displays a single financial insight
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {InsightType} from '@types';
import type {AIInsight} from '@types';

interface InsightCardProps {
  insight: AIInsight;
}

const INSIGHT_CONFIG = {
  [InsightType.SPEND_SPIKE]: {
    icon: '📈',
    color: '#FF9500',
    backgroundColor: '#FFF4E6',
    title: 'Spending Alert',
  },
  [InsightType.BUDGET_OVERRUN]: {
    icon: '⚠️',
    color: '#FF3B30',
    backgroundColor: '#FFEBEE',
    title: 'Budget Alert',
  },
  [InsightType.CREDIT_UTILIZATION]: {
    icon: '💳',
    color: '#FF9500',
    backgroundColor: '#FFF4E6',
    title: 'Credit Alert',
  },
  [InsightType.SUBSCRIPTION_DETECTED]: {
    icon: '🔄',
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    title: 'Subscription Found',
  },
  [InsightType.SAVING_OPPORTUNITY]: {
    icon: '💰',
    color: '#34C759',
    backgroundColor: '#E8F5E9',
    title: 'Saving Tip',
  },
};

export function InsightCard({insight}: InsightCardProps) {
  const config = INSIGHT_CONFIG[insight.type as InsightType] || {
    icon: '💡',
    color: '#8E8E93',
    backgroundColor: '#F2F2F7',
    title: 'Insight',
  };

  return (
    <View style={[styles.card, {backgroundColor: config.backgroundColor}]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.title, {color: config.color}]}>{config.title}</Text>
          <Text style={styles.date}>
            {new Date(insight.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>
      <Text style={styles.message}>{insight.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
  },
});
