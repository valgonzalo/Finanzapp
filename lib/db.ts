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
  recurrence: 'once' | 'weekly' | 'monthly';
  is_active: number;
  notification_id?: string;
  created_at?: string;
  type?: 'payment' | 'collection' | 'general';
}

export interface UserSettings {
  id?: number;
  userName: string;
  onboardingCompleted: number;
}

export class FinanzAppDB extends Dexie {
  transactions!: Table<Transaction>;
  debts!: Table<Debt>;
  debt_installments!: Table<DebtInstallment>;
  reminders!: Table<Reminder>;
  settings!: Table<UserSettings>;

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
  }
}

export const db = new FinanzAppDB();
