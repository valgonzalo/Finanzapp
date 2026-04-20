import Dexie, { Table } from 'dexie';

export interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  created_at?: string;
}

export interface Debt {
  id?: number;
  person_name: string;
  total_amount: number;
  paid_amount: number;
  has_installments: number;
  installments_count?: number;
  installment_amount?: number;
  due_date?: string;
  notes?: string;
  status: 'pending' | 'partial' | 'paid';
  created_at?: string;
}

export interface DebtInstallment {
  id?: number;
  debt_id: number;
  installment_number: number;
  amount: number;
  due_date?: string;
  paid: number;
  paid_date?: string;
}

export interface Reminder {
  id?: number;
  title: string;
  description?: string;
  amount?: number;
  date: string;
  time: string;
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly';
  is_active: number;
  notification_id?: string;
  created_at?: string;
  type?: 'payment' | 'collection' | 'general';
  total_installments?: number;
  current_installment?: number;
}

export interface UserSettings {
  id?: number;
  userName: string;
  onboardingCompleted: number;
  currency?: string;
  language?: string;
  isSecurityEnabled: number;
  isNotificationsEnabled: number;
  pin?: string;
}

export interface RecurringTransaction {
  id?: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  recurrence: 'daily' | 'weekly' | 'monthly';
  day_of_month?: number;
  day_of_week?: number;
  is_active: number;
  last_executed?: string;
  next_execution?: string;
  created_at: string;
}

export interface SavingsGoal {
  id?: number;
  name: string;
  emoji: string;
  target_amount: number;
  current_amount: number;
  color: string;
  deadline?: string;
  notes?: string;
  is_completed: number;
  created_at: string;
}

export interface SavingsContribution {
  id?: number;
  goal_id: number;
  amount: number;
  note?: string;
  date: string;
}

export class FinanzAppDB extends Dexie {
  transactions!: Table<Transaction>;
  debts!: Table<Debt>;
  debt_installments!: Table<DebtInstallment>;
  reminders!: Table<Reminder>;
  settings!: Table<UserSettings>;
  recurringTransactions!: Table<RecurringTransaction>;
  savingsGoals!: Table<SavingsGoal>;
  savingsContributions!: Table<SavingsContribution>;

  constructor() {
    super('FinanzAppDB');
    this.version(1).stores({
      transactions: '++id, type, date',
      debts: '++id, status',
      debt_installments: '++id, debt_id',
      reminders: '++id, date, is_active'
    });
    this.version(2).stores({
      reminders: '++id, date, is_active, type'
    }).upgrade(tx => {
      return tx.table('reminders').toCollection().modify(reminder => {
        reminder.type = 'general';
      });
    });
    this.version(3).stores({
      settings: '++id'
    });
    this.version(4).stores({
      reminders: '++id, date, is_active, type'
    });
    this.version(5).stores({
      settings: '++id'
    });
    this.version(6).stores({
      settings: '++id'
    });
    this.version(7).stores({
      recurringTransactions: '++id, type, recurrence, is_active, next_execution'
    });
    this.version(8).stores({
      savingsGoals: '++id, is_completed',
      savingsContributions: '++id, goal_id'
    });
    this.version(10).stores({
      transactions: '++id, type, date, category',
      debts: '++id, status, due_date',
      debt_installments: '++id, debt_id',
      reminders: '++id, date, is_active, type',
      recurringTransactions: '++id, type, recurrence, is_active, next_execution',
      savingsGoals: '++id, is_completed',
      savingsContributions: '++id, goal_id, date',
      settings: '++id'
    });
  }
}

export const db = new FinanzAppDB();
