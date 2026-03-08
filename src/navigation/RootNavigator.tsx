/**
 * Root Navigator
 * Main navigation structure with bottom tabs
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet, Text} from 'react-native';

// Import screens
import DashboardScreen from '@screens/DashboardScreen';
import TransactionsScreen from '@screens/TransactionsScreen';
import BudgetsScreen from '@screens/BudgetsScreen';
import CardsScreen from '@screens/CardsScreen';
import InsightsScreen from '@screens/InsightsScreen';
import SettingsScreen from '@screens/SettingsScreen';

export type RootTabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Budgets: undefined;
  Cards: undefined;
  Insights: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({color}) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: 'Transactions',
          tabBarIcon: ({color}) => <TabIcon name="list" color={color} />,
        }}
      />
      <Tab.Screen
        name="Budgets"
        component={BudgetsScreen}
        options={{
          title: 'Budgets',
          tabBarIcon: ({color}) => <TabIcon name="target" color={color} />,
        }}
      />
      <Tab.Screen
        name="Cards"
        component={CardsScreen}
        options={{
          title: 'Cards',
          tabBarIcon: ({color}) => <TabIcon name="card" color={color} />,
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: 'Insights',
          tabBarIcon: ({color}) => <TabIcon name="lightbulb" color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({color}) => <TabIcon name="settings" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Simple icon placeholder - replace with actual icon library later
function TabIcon({name, color}: {name: string; color: string}) {
  const iconMap: Record<string, string> = {
    home: '🏠',
    list: '📝',
    target: '🎯',
    card: '💳',
    lightbulb: '💡',
    settings: '⚙️',
  };

  return <Text style={{fontSize: 24}}>{iconMap[name] || '•'}</Text>;
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RootNavigator;
