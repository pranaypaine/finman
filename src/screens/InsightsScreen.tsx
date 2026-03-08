/**
 * Insights Screen
 * AI-generated financial insights
 */

import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl} from 'react-native';
import {InsightCard} from '@components/InsightCard';
import {Loading, EmptyState, Button} from '@components/UI';
import * as InsightsService from '@services/insights';
import type {AIInsight} from '@types';

function InsightsScreen() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      const data = await InsightsService.getAllInsights();
      setInsights(data as unknown as AIInsight[]);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  }, [loadInsights]);

  const handleGenerateInsights = useCallback(async () => {
    try {
      setGenerating(true);
      await InsightsService.generateAllInsights();
      await loadInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGenerating(false);
    }
  }, [loadInsights]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  if (loading) {
    return <Loading message="Loading insights..." />;
  }

  if (insights.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="💡"
          title="No insights yet"
          message="Generate insights to analyze your spending patterns, budgets, and credit usage"
          action={{
            label: 'Generate Insights',
            onPress: handleGenerateInsights,
          }}
        />
        {generating && <Loading message="Analyzing your finances..." />}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with summary */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Financial Insights</Text>
        <Text style={styles.headerSubtitle}>{insights.length} insights found</Text>
      </View>

      {/* Insights List */}
      <FlatList
        data={insights}
        keyExtractor={item => item.id}
        renderItem={({item}) => <InsightCard insight={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Regenerate Button */}
      <View style={styles.footer}>
        <Button
          title={generating ? 'Analyzing...' : 'Regenerate Insights'}
          onPress={handleGenerateInsights}
          loading={generating}
          disabled={generating}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default InsightsScreen;
