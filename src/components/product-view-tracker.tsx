'use client';

import { useEffect } from 'react';

type ProductViewTrackerProps = {
  productId: string;
  productName: string;
};

const defaultHistory = [
  { id: '2', name: 'Relaxed Fit Blue Jeans' },
  { id: '3', name: 'Organic Cotton Tee' },
  { id: '17', name: 'Casual Zip-Up Hoodie' },
];

export function ProductViewTracker({ productId, productName }: ProductViewTrackerProps) {
  useEffect(() => {
    try {
      let historyString = sessionStorage.getItem('browsingHistory');
      
      // If no history exists, preload with default data for a better "first run" experience
      if (!historyString) {
        sessionStorage.setItem('browsingHistory', JSON.stringify(defaultHistory));
        historyString = sessionStorage.getItem('browsingHistory');
      }
      
      const history = JSON.parse(historyString || '[]');

      const MAX_HISTORY = 10;
      const productInHistory = history.find((item: { id: string }) => item.id === productId);

      if (!productInHistory) {
        const newHistory = [...history, { id: productId, name: productName }];
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift(); 
        }
        sessionStorage.setItem('browsingHistory', JSON.stringify(newHistory));
      }
    } catch (error) {
      console.error("Could not update browsing history:", error);
    }
  }, [productId, productName]);

  return null;
}
