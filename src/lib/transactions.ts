
import transactionsData from '@/data/transactions.json';
import type { Transaction } from '@/types';

// In a real application, this data would come from a database.
const transactions: Transaction[] = transactionsData;

/**
 * Retrieves a static list of historical transactions.
 * @returns An array of Transaction objects.
 */
export function getHistoricalTransactions(): Transaction[] {
  return transactions;
}
