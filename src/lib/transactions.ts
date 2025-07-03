
import type { Transaction, GetTransactionsResult } from '@/types';
import { db } from './firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

/**
 * Retrieves all transactions from Firestore, ordered by date descending.
 * @returns A promise that resolves to an object with transactions or an error.
 */
export async function getTransactions(): Promise<GetTransactionsResult> {
  if (!db.app.options.apiKey) {
      console.warn("Firebase is not configured. Skipping Firestore fetch.");
      return { transactions: [] };
  }
  try {
    const transactionsCol = collection(db, 'transactions');
    const q = query(transactionsCol, orderBy('date', 'desc'));
    const transactionSnapshot = await getDocs(q);
    const transactionsList = transactionSnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      
      let dateStr = '';
      if (data.date) {
        try {
          dateStr = data.date instanceof Timestamp 
            ? data.date.toDate().toISOString().split('T')[0] 
            : String(data.date);
          if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            dateStr = '';
          }
        } catch {
          dateStr = '';
        }
      }

      return {
        orderId: docSnapshot.id,
        customer: String(data.customer || 'N/A'),
        email: String(data.email || 'N/A'),
        date: dateStr,
        subtotal: Number(data.subtotal) || 0,
        shipping: Number(data.shipping) || 0,
        taxes: Number(data.taxes) || 0,
        total: Number(data.total) || 0,
      } as Transaction;
    });
    return { transactions: transactionsList };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    
    if (errorMessage.includes('PERMISSION_DENIED')) {
        return { transactions: [], error: { message: errorMessage, code: 'PERMISSION_DENIED' } };
    }
    
    if (errorMessage.includes('requires an index')) {
        const indexCreationMessage = "Database is not properly configured. A Firestore index is required to sort transactions. Please check the server logs for a link to create it.";
        return { transactions: [], error: { message: indexCreationMessage, code: 'INDEX_MISSING' } };
    }
    
    return { transactions: [], error: { message: errorMessage, code: 'UNKNOWN' } };
  }
}

/**
 * Adds a new transaction to the Firestore database using a custom Order ID.
 * The date string from the transaction object is converted to a Firestore Timestamp.
 * @param transaction The transaction data to add, including a custom orderId.
 */
export async function addTransaction(transaction: Transaction) {
    if (!db.app.options.apiKey) {
      console.error("Firebase is not configured. Skipping Firestore write.");
      throw new Error("Database is not configured, cannot save transaction.");
    }
    try {
        const transactionToSave = {
            ...transaction,
            date: Timestamp.fromDate(new Date(transaction.date)),
        };
        const transactionRef = doc(db, 'transactions', transaction.orderId);
        await setDoc(transactionRef, transactionToSave);
    } catch (error) {
        console.error("Error adding transaction: ", error);
        throw new Error("Could not save transaction to the database.");
    }
}
