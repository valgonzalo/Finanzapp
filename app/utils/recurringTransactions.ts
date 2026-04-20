import { db, RecurringTransaction } from '@/lib/db';

/**
 * Procesa las transacciones recurrentes pendientes y las inserta en la tabla de transacciones.
 */
export const processRecurringTransactions = async (): Promise<number> => {
  const today = new Date().toISOString().split('T')[0];
  
  // Buscar recurrentes activos cuya próxima ejecución sea hoy o antes
  // Usamos el índice de is_active para filtrar rápidamente
  const pending = await db.recurringTransactions
    .where('is_active').equals(1)
    .filter(r => !r.next_execution || r.next_execution <= today)
    .toArray();

  if (pending.length === 0) return 0;

  for (const rec of pending) {
    // Insertar transacción en la tabla principal
    await db.transactions.add({
      type: rec.type,
      amount: rec.amount,
      category: rec.category,
      description: `${rec.description} (automático)`,
      date: today,
      created_at: new Date().toISOString(),
    });

    // Calcular próxima ejecución
    const nextExecution = calculateNextExecution(rec);

    // Actualizar registro recurrente
    await db.recurringTransactions.update(rec.id!, {
      last_executed: today,
      next_execution: nextExecution,
    });
  }

  return pending.length;
};

/**
 * Calcula la fecha de la próxima ejecución basada en la recurrencia.
 */
const calculateNextExecution = (rec: RecurringTransaction): string => {
  const now = new Date();
  
  // Si la próxima ejecución ya estaba seteada y era en el pasado, partimos de ahí para no saltar ejecuciones
  // Pero para simplicidad y evitar bucles infinitos en ejecuciones muy viejas, usamos el día de hoy como base
  // si es que estamos procesando hoy.
  
  if (rec.recurrence === 'daily') {
    now.setDate(now.getDate() + 1);
  } else if (rec.recurrence === 'weekly') {
    const dayOfWeek = rec.day_of_week ?? 1; // Default Lunes
    const daysUntil = (dayOfWeek - now.getDay() + 7) % 7 || 7;
    now.setDate(now.getDate() + daysUntil);
  } else if (rec.recurrence === 'monthly') {
    now.setMonth(now.getMonth() + 1);
    now.setDate(rec.day_of_month ?? 1);
  }
  
  return now.toISOString().split('T')[0];
};

/**
 * Calcula la primera ejecución al momento de crear un recurrente.
 */
export const calculateFirstExecution = (recurrence: string, dayOfMonth?: number, dayOfWeek?: number): string => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (recurrence === 'daily') {
    return todayStr;
  } else if (recurrence === 'weekly') {
    const targetDay = dayOfWeek ?? 1;
    const currentDay = now.getDay();
    if (currentDay === targetDay) return todayStr;
    const daysUntil = (targetDay - currentDay + 7) % 7;
    now.setDate(now.getDate() + daysUntil);
  } else if (recurrence === 'monthly') {
    const targetDay = dayOfMonth ?? 1;
    const currentDay = now.getDate();
    if (currentDay <= targetDay) {
      now.setDate(targetDay);
    } else {
      now.setMonth(now.getMonth() + 1);
      now.setDate(targetDay);
    }
  }
  
  return now.toISOString().split('T')[0];
};
