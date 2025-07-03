
import type { Transaction } from '@/types';
import { db } from './firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

/**
 * Retrieves all transactions from Firestore, ordered by date descending.
 * @returns A promise that resolves to an array of Transaction objects.
 */
export async function getTransactions(): Promise<Transaction[]> {
  // Ensure required config is present to avoid runtime errors on server
  if (!db.app.options.apiKey) {
      console.warn("Firebase is not configured. Skipping Firestore fetch.");
      return [];
  }
  try {
    const transactionsCol = collection(db, 'transactions');
    const q = query(transactionsCol, orderBy('date', 'desc'));
    const transactionSnapshot = await getDocs(q);
    const transactionsList = transactionSnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      
      // Defensively parse all fields to prevent crashes from malformed data
      let dateStr = '';
      if (data.date) {
        try {
          // Dates can be stored as Timestamps (correct) or strings (from older data), so we handle both.
          dateStr = data.date instanceof Timestamp 
            ? data.date.toDate().toISOString().split('T')[0] 
            : String(data.date);
          // Basic validation for YYYY-MM-DD format
          if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            dateStr = ''; // Invalid format, reset to empty
          }
        } catch {
          dateStr = ''; // Error during date conversion
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
    return transactionsList;
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    // Add a more specific error message for missing indexes
    if (error instanceof Error && error.message.includes('requires an index')) {
        console.error("Firestore index missing. Please create the required index in your Firebase console.");
        throw new Error("Database is not properly configured. A Firestore index is required to sort transactions. Please check the server logs for a link to create it.");
    }
    // Propagate other errors to be handled by the UI
    throw error;
  }
}

/**
 * Adds a new transaction to the Firestore database using a custom Order ID.
 * The date string from the transaction object is converted to a Firestore Timestamp.
 * @param transaction The transaction data to add, including a custom orderId.
 */
export async function addTransaction(transaction: Transaction) {
    // Ensure required config is present
    if (!db.app.options.apiKey) {
      console.error("Firebase is not configured. Skipping Firestore write.");
      throw new Error("Database is not configured, cannot save transaction.");
    }
    try {
        const transactionToSave = {
            ...transaction,
            // Convert date string to a proper Firestore Timestamp for correct sorting
            date: Timestamp.fromDate(new Date(transaction.date)),
        };
        const transactionRef = doc(db, 'transactions', transaction.orderId);
        await setDoc(transactionRef, transactionToSave);
    } catch (error) {
        console.error("Error adding transaction: ", error);
        throw new Error("Could not save transaction to the database.");
    }
}
