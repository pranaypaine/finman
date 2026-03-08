/**
 * Account Form Component
 * Add or edit bank accounts and credit cards
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
  Switch,
} from 'react-native';
import {Button, Input} from './UI';
import {useForm} from '@hooks';
import {createAccount, updateAccount} from '@services/accounts';
import {AccountType} from '@types';
import type {Account} from '@types';

interface AccountFormData {
  name: string;
  type: AccountType;
  bankName: string;
  last4: string;
  creditLimit: string;
  statementDay: string;
  dueDay: string;
}

interface AccountFormProps {
  visible: boolean;
  account?: Account | null; // For editing
  onClose: () => void;
  onSuccess: () => void;
}

export function AccountForm({visible, account, onClose, onSuccess}: AccountFormProps) {
  const [saving, setSaving] = useState(false);
  const [isCreditCard, setIsCreditCard] = useState(false);

  const {values, errors, handleChange, setFieldError, reset, setValues} =
    useForm<AccountFormData>({
      name: '',
      type: AccountType.BANK,
      bankName: '',
      last4: '',
      creditLimit: '',
      statementDay: '',
      dueDay: '',
    });

  // Pre-fill form when editing
  useEffect(() => {
    if (account) {
      const isCC = account.type === AccountType.CREDIT_CARD;
      setIsCreditCard(isCC);
      setValues({
        name: account.name,
        type: account.type,
        bankName: account.bankName,
        last4: account.last4,
        creditLimit: account.creditLimit ? (account.creditLimit / 100).toFixed(0) : '',
        statementDay: account.statementDay ? account.statementDay.toString() : '',
        dueDay: account.dueDay ? account.dueDay.toString() : '',
      });
    } else {
      reset();
      setIsCreditCard(false);
    }
  }, [account, visible]);

  const validate = (): boolean => {
    let isValid = true;

    if (!values.name.trim()) {
      setFieldError('name', 'Please enter account name');
      isValid = false;
    }

    if (!values.bankName.trim()) {
      setFieldError('bankName', 'Please enter bank name');
      isValid = false;
    }

    if (!values.last4 || values.last4.length !== 4) {
      setFieldError('last4', 'Please enter last 4 digits');
      isValid = false;
    }

    if (isCreditCard) {
      if (!values.creditLimit || parseFloat(values.creditLimit) <= 0) {
        setFieldError('creditLimit', 'Please enter credit limit');
        isValid = false;
      }

      const stmtDay = parseInt(values.statementDay);
      if (!stmtDay || stmtDay < 1 || stmtDay > 31) {
        setFieldError('statementDay', 'Please enter day (1-31)');
        isValid = false;
      }

      const due = parseInt(values.dueDay);
      if (!due || due < 1 || due > 31) {
        setFieldError('dueDay', 'Please enter day (1-31)');
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const accountData = {
        name: values.name.trim(),
        type: isCreditCard ? AccountType.CREDIT_CARD : AccountType.BANK,
        bankName: values.bankName.trim(),
        last4: values.last4.trim(),
        creditLimit: isCreditCard ? Math.round(parseFloat(values.creditLimit) * 100) : undefined,
        statementDay: isCreditCard ? parseInt(values.statementDay) : undefined,
        dueDay: isCreditCard ? parseInt(values.dueDay) : undefined,
      };

      if (account) {
        // Update existing account
        await updateAccount(account.id, accountData);
        Alert.alert('Success', 'Account updated successfully');
      } else {
        // Create new account
        await createAccount(accountData);
        Alert.alert('Success', 'Account added successfully');
      }

      reset();
      setIsCreditCard(false);
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : `Failed to ${account ? 'update' : 'add'} account`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsCreditCard(false);
    onClose();
  };

  const handleTypeToggle = (value: boolean) => {
    setIsCreditCard(value);
    handleChange('type', value ? AccountType.CREDIT_CARD : AccountType.BANK);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.headerButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{account ? 'Edit Account' : 'Add Account'}</Text>
          <View style={styles.headerButtonPlaceholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Credit Card</Text>
            <Switch
              value={isCreditCard}
              onValueChange={handleTypeToggle}
              trackColor={{false: '#E5E5EA', true: '#34C759'}}
              thumbColor="#FFFFFF"
            />
          </View>

          <Input
            label="Account Name"
            placeholder="e.g., My HDFC Account"
            value={values.name}
            onChangeText={value => handleChange('name', value)}
            error={errors.name}
          />

          <Input
            label="Bank Name"
            placeholder="e.g., HDFC, SBI, ICICI"
            value={values.bankName}
            onChangeText={value => handleChange('bankName', value)}
            error={errors.bankName}
          />

          <Input
            label="Last 4 Digits"
            placeholder="1234"
            keyboardType="number-pad"
            maxLength={4}
            value={values.last4}
            onChangeText={value => handleChange('last4', value)}
            error={errors.last4}
          />

          {isCreditCard && (
            <>
              <Input
                label="Credit Limit (₹)"
                placeholder="100000"
                keyboardType="decimal-pad"
                value={values.creditLimit}
                onChangeText={value => handleChange('creditLimit', value)}
                error={errors.creditLimit}
              />

              <Input
                label="Statement Day (1-31)"
                placeholder="1"
                keyboardType="number-pad"
                maxLength={2}
                value={values.statementDay}
                onChangeText={value => handleChange('statementDay', value)}
                error={errors.statementDay}
              />

              <Input
                label="Payment Due Day (1-31)"
                placeholder="20"
                keyboardType="number-pad"
                maxLength={2}
                value={values.dueDay}
                onChangeText={value => handleChange('dueDay', value)}
                error={errors.dueDay}
              />
            </>
          )}

          <Button
            title={account ? 'Update Account' : 'Add Account'}
            onPress={handleSubmit}
            loading={saving}
            disabled={saving}
            style={styles.submitButton}
          />
        </ScrollView>
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});
