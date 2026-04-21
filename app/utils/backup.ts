import { db } from '@/lib/db';

export const exportDataToJSON = async () => {
  try {
    const transactions = await db.transactions.toArray();
    const debts = await db.debts.toArray();
    const savingsGoals = await db.savingsGoals.toArray();
    const reminders = await db.reminders.toArray();
    const settings = await db.settings.toArray();
    const recurringTransactions = await db.recurringTransactions.toArray();

    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        transactions,
        debts,
        savingsGoals,
        reminders,
        settings,
        recurringTransactions
      }
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzapp-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
};

export const importDataFromJSON = async (jsonString: string) => {
  try {
    const backup = JSON.parse(jsonString);
    
    if (!backup.data) throw new Error('Invalid backup format');

    const { data } = backup;

    await db.transaction('rw', [
      db.transactions, 
      db.debts, 
      db.savingsGoals, 
      db.reminders, 
      db.settings,
      db.recurringTransactions
    ], async () => {
      // Clear existing data? Or merge? 
      // User requested "copying data", usually means replacing or merging.
      // For simplicity and safety, we'll clear and replace to avoid duplicates/conflicts.
      
      await db.transactions.clear();
      await db.debts.clear();
      await db.savingsGoals.clear();
      await db.reminders.clear();
      await db.settings.clear();
      await db.recurringTransactions.clear();

      if (data.transactions) await db.transactions.bulkAdd(data.transactions);
      if (data.debts) await db.debts.bulkAdd(data.debts);
      if (data.savingsGoals) await db.savingsGoals.bulkAdd(data.savingsGoals);
      if (data.reminders) await db.reminders.bulkAdd(data.reminders);
      if (data.settings) await db.settings.bulkAdd(data.settings);
      if (data.recurringTransactions) await db.recurringTransactions.bulkAdd(data.recurringTransactions);
    });

    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
};
