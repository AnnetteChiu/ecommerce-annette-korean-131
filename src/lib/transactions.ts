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
      // Firestore Timestamps need to be converted to JS Date objects then to string
      const date = data.date instanceof Timestamp ? data.date.toDate().toISOString().split('T')[0] : data.date;
      return {
        // Spread the data from the document
        customer: data.customer,
        email: data.email,
        subtotal: data.subtotal,
        shipping: data.shipping,
        taxes: data.taxes,
        total: data.total,
        // Add the orderId from the document id
        orderId: docSnapshot.id,
        // Add the converted date
        date: date,
      } as Transaction;
    });
    return transactionsList;
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    return [];
  }
}

/**
 * Adds a new transaction to the Firestore database using a custom Order ID.
 * @param transaction The transaction data to add, including a custom orderId.
 */
export async function addTransaction(transaction: Transaction) {
    // Ensure required config is present
    if (!db.app.options.apiKey) {
      console.error("Firebase is not configured. Skipping Firestore write.");
      throw new Error("Database is not configured, cannot save transaction.");
    }
    try {
        const transactionRef = doc(db, 'transactions', transaction.orderId);
        await setDoc(transactionRef, transaction);
    } catch (error) {
        console.error("Error adding transaction: ", error);
        throw new Error("Could not save transaction to the database.");
    }
}
