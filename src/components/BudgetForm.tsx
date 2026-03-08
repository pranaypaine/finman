/**
 * Budget Form Component
 * Form for creating or editing budgets
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {Button, Input} from '@components/UI';
import {Category} from '@types';
import type {Budget} from '@types';
import * as BudgetService from '@services/budgets';

interface BudgetFormProps {
  visible: boolean;
  budget?: Budget | null; // For editing
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_OPTIONS = [
  {value: Category.FOOD, label: '🍽️ Food', icon: '🍽️'},
  {value: Category.TRANSPORT, label: '🚗 Transport', icon: '🚗'},
  {value: Category.SHOPPING, label: '🛍️ Shopping', icon: '🛍️'},
  {value: Category.BILLS, label: '📄 Bills', icon: '📄'},
  {value: Category.ENTERTAINMENT, label: '🎬 Entertainment', icon: '🎬'},
  {value: Category.HEALTH, label: '🏥 Health', icon: '🏥'},
  {value: Category.EDUCATION, label: '📚 Education', icon: '📚'},
  {value: Category.TRAVEL, label: '✈️ Travel', icon: '✈️'},
  {value: Category.GROCERIES, label: '🛒 Groceries', icon: '🛒'},
  {value: Category.OTHERS, label: '📦 Others', icon: '📦'},
];

export function BudgetForm({visible, budget, onClose, onSuccess}: BudgetFormProps) {
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budget) {
      setCategory(budget.category as Category);
      setMonthlyLimit((budget.monthlyLimit / 100).toFixed(2));
    } else {
      setCategory(Category.FOOD);
      setMonthlyLimit('');
    }
  }, [budget, visible]);

  const handleSubmit = async () => {
    // Validation
    if (!monthlyLimit || parseFloat(monthlyLimit) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount');
      return;
    }

    try {
      setLoading(true);

      const limitInCents = Math.round(parseFloat(monthlyLimit) * 100);

      if (budget) {
        // Update existing budget
        await BudgetService.updateBudget(budget.id, {
          category,
          monthlyLimit: limitInCents,
        });
      } else {
        // Check if budget already exists for this category
        const existing = await BudgetService.getBudgetByCategory(category);
        if (existing) {
          Alert.alert(
            'Budget Exists',
            'A budget for this category already exists. Please edit it instead.',
          );
          setLoading(false);
          return;
        }

        // Create new budget
        await BudgetService.createBudget({
          category,
          monthlyLimit: limitInCents,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCategory(Category.FOOD);
    setMonthlyLimit('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{budget ? 'Edit Budget' : 'Create Budget'}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.categoryOption,
                    category === option.value && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setCategory(option.value)}>
                  <Text style={styles.categoryIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === option.value && styles.categoryLabelSelected,
                    ]}>
                    {option.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Monthly Limit</Text>
            <Input
              placeholder="0.00"
              value={monthlyLimit}
              onChangeText={setMonthlyLimit}
              keyboardType="decimal-pad"
              autoCapitalize="none"
            />
            <Text style={styles.hint}>Enter the maximum amount you want to spend per month</Text>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={budget ? 'Update Budget' : 'Create Budget'}
              onPress={handleSubmit}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    fontSize: 28,
    color: '#8E8E93',
    fontWeight: '300',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
    marginTop: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  categoryOption: {
    width: '30%',
    margin: '1.5%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryOptionSelected: {
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#000000',
    textTransform: 'capitalize',
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
});
