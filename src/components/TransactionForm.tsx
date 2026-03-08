/**
 * Transaction Form Component
 * Allows users to manually add or edit transactions
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {Button, Input} from './UI';
import {useForm, useAccounts} from '@hooks';
import {createTransaction, updateTransaction} from '@services/transactions';
import {Category, TransactionSource} from '@types';
import type {Transaction} from '@types';
import {formatCurrency, parseCurrency} from '@utils';

interface TransactionFormData {
  amount: string;
  merchant: string;
  category: Category;
  accountId: string;
  notes: string;
  date: Date;
}

interface TransactionFormProps {
  visible: boolean;
  transaction?: Transaction | null; // For editing
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  {value: Category.FOOD, label: '🍽️ Food'},
  {value: Category.TRANSPORT, label: '🚗 Transport'},
  {value: Category.SHOPPING, label: '🛍️ Shopping'},
  {value: Category.BILLS, label: '📄 Bills'},
  {value: Category.ENTERTAINMENT, label: '🎬 Entertainment'},
  {value: Category.HEALTH, label: '🏥 Health'},
  {value: Category.EDUCATION, label: '📚 Education'},
  {value: Category.TRAVEL, label: '✈️ Travel'},
  {value: Category.GROCERIES, label: '🛒 Groceries'},
  {value: Category.OTHERS, label: '📦 Others'},
];

export function TransactionForm({visible, transaction, onClose, onSuccess}: TransactionFormProps) {
  const {accounts, loading: accountsLoading} = useAccounts();
  const [saving, setSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const {values, errors, handleChange, setFieldError, reset, setValues} =
    useForm<TransactionFormData>({
      amount: '',
      merchant: '',
      category: Category.UNCATEGORIZED,
      accountId: '',
      notes: '',
      date: new Date(),
    });

  // Pre-fill form when editing
  useEffect(() => {
    if (transaction) {
      setValues({
        amount: (transaction.amount / 100).toFixed(2),
        merchant: transaction.merchant,
        category: transaction.category as Category,
        accountId: transaction.accountId,
        notes: transaction.notes || '',
        date: new Date(transaction.transactionDate),
      });
    } else {
      reset();
    }
  }, [transaction, visible]);

  const selectedCategory = CATEGORIES.find(c => c.value === values.category);
  const selectedAccount = accounts.find(a => a.id === values.accountId);

  const validate = (): boolean => {
    let isValid = true;

    if (!values.amount || parseFloat(values.amount) <= 0) {
      setFieldError('amount', 'Please enter a valid amount');
      isValid = false;
    }

    if (!values.merchant.trim()) {
      setFieldError('merchant', 'Please enter merchant name');
      isValid = false;
    }

    if (!values.accountId) {
      setFieldError('accountId', 'Please select an account');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      // Parse amount to cents
      const amountInCents = parseCurrency(values.amount);

      if (transaction) {
        // Update existing transaction
        await updateTransaction(transaction.id, {
          accountId: values.accountId,
          amount: amountInCents,
          merchant: values.merchant.trim(),
          category: values.category,
          transactionDate: values.date,
          notes: values.notes.trim() || undefined,
        });

        Alert.alert('Success', 'Transaction updated successfully');
      } else {
        // Create new transaction
        await createTransaction({
          accountId: values.accountId,
          amount: amountInCents,
          merchant: values.merchant.trim(),
          category: values.category,
          transactionDate: values.date,
          source: TransactionSource.MANUAL,
          notes: values.notes.trim() || undefined,
        });

        Alert.alert('Success', 'Transaction added successfully');
      }

      reset();
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : `Failed to ${transaction ? 'update' : 'add'} transaction`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.headerButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </Text>
          <View style={styles.headerButtonPlaceholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Input
            label="Amount (₹)"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={values.amount}
            onChangeText={value => handleChange('amount', value)}
            error={errors.amount}
          />

          <Input
            label="Merchant"
            placeholder="e.g., Swiggy, Amazon, Uber"
            value={values.merchant}
            onChangeText={value => handleChange('merchant', value)}
            error={errors.merchant}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={[styles.picker, errors.category ? styles.pickerError : undefined]}
              onPress={() => setShowCategoryPicker(true)}>
              <Text style={styles.pickerText}>
                {selectedCategory?.label || 'Select category'}
              </Text>
              <Text style={styles.pickerArrow}>›</Text>
            </TouchableOpacity>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Account</Text>
            <TouchableOpacity
              style={[styles.picker, errors.accountId ? styles.pickerError : undefined]}
              onPress={() => setShowAccountPicker(true)}
              disabled={accountsLoading}>
              <Text style={styles.pickerText}>
                {selectedAccount
                  ? `${selectedAccount.name} (${selectedAccount.last4})`
                  : accounts.length === 0
                    ? 'No accounts available'
                    : 'Select account'}
              </Text>
              <Text style={styles.pickerArrow}>›</Text>
            </TouchableOpacity>
            {errors.accountId && <Text style={styles.errorText}>{errors.accountId}</Text>}
          </View>

          <Input
            label="Notes (Optional)"
            placeholder="Add any notes..."
            value={values.notes}
            onChangeText={value => handleChange('notes', value)}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />

          <Button
            title={transaction ? 'Update Transaction' : 'Add Transaction'}
            onPress={handleSubmit}
            loading={saving}
            disabled={saving || accountsLoading}
            style={styles.submitButton}
          />
        </ScrollView>

        {/* Category Picker Modal */}
        <Modal
          visible={showCategoryPicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCategoryPicker(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCategoryPicker(false)}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerHeaderTitle}>Select Category</Text>
              </View>
              <ScrollView>
                {CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      handleChange('category', category.value);
                      setShowCategoryPicker(false);
                    }}>
                    <Text style={styles.pickerOptionText}>{category.label}</Text>
                    {values.category === category.value && (
                      <Text style={styles.pickerOptionCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Account Picker Modal */}
        <Modal
          visible={showAccountPicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowAccountPicker(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAccountPicker(false)}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerHeaderTitle}>Select Account</Text>
              </View>
              <ScrollView>
                {accounts.map(account => (
                  <TouchableOpacity
                    key={account.id}
                    style={styles.pickerOption}
                    onPress={() => {
                      handleChange('accountId', account.id);
                      setShowAccountPicker(false);
                    }}>
                    <View>
                      <Text style={styles.pickerOptionText}>{account.name}</Text>
                      <Text style={styles.pickerOptionSubtext}>
                        {account.bankName} •••• {account.last4}
                      </Text>
                    </View>
                    {values.accountId === account.id && (
                      <Text style={styles.pickerOptionCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
                {accounts.length === 0 && (
                  <View style={styles.emptyPicker}>
                    <Text style={styles.emptyPickerText}>No accounts added yet</Text>
                    <Text style={styles.emptyPickerSubtext}>
                      Add an account from the Cards screen
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerButtonPlaceholder: {
    width: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  pickerError: {
    borderColor: '#FF3B30',
  },
  pickerText: {
    fontSize: 16,
    color: '#000000',
  },
  pickerArrow: {
    fontSize: 24,
    color: '#8E8E93',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pickerHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  pickerOptionSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  pickerOptionCheck: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  emptyPicker: {
    padding: 32,
    alignItems: 'center',
  },
  emptyPickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  emptyPickerSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
