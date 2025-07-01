'use client';

import { useEffect } from 'react';

type ProductViewTrackerProps = {
  productId: string;
  productName: string;
};

export function ProductViewTracker({ productId, productName }: ProductViewTrackerProps) {
  useEffect(() => {
    try {
      const historyString = sessionStorage.getItem('browsingHistory');
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
