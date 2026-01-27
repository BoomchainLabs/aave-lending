'use client';

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

export interface TransactionStatus {
  id: string;
  status: 'pending' | 'success' | 'failed';
  hash?: string;
  error?: string;
  timestamp: number;
}

interface UseTransactionMonitorReturn {
  transactions: TransactionStatus[];
  addTransaction: (id: string, status: TransactionStatus['status'], hash?: string) => void;
  updateTransaction: (id: string, status: TransactionStatus['status'], hash?: string, error?: string) => void;
  removeTransaction: (id: string) => void;
  clearTransactions: () => void;
}

export function useTransactionMonitor(): UseTransactionMonitorReturn {
  const [transactions, setTransactions] = useState<Map<string, TransactionStatus>>(new Map());

  const addTransaction = useCallback(
    (id: string, status: TransactionStatus['status'], hash?: string) => {
      const transaction: TransactionStatus = {
        id,
        status,
        hash,
        timestamp: Date.now(),
      };

      setTransactions((prev) => {
        const next = new Map(prev);
        next.set(id, transaction);
        return next;
      });

      logger.info('Transaction added', { id, status, hash });
    },
    []
  );

  const updateTransaction = useCallback(
    (id: string, status: TransactionStatus['status'], hash?: string, error?: string) => {
      setTransactions((prev) => {
        const next = new Map(prev);
        const existing = next.get(id);

        if (existing) {
          next.set(id, {
            ...existing,
            status,
            hash: hash || existing.hash,
            error,
            timestamp: Date.now(),
          });
        }

        return next;
      });

      logger.info('Transaction updated', { id, status, hash, error });
    },
    []
  );

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

    logger.info('Transaction removed', { id });
  }, []);

  const clearTransactions = useCallback(() => {
    setTransactions(new Map());
    logger.info('All transactions cleared');
  }, []);

  return {
    transactions: Array.from(transactions.values()),
    addTransaction,
    updateTransaction,
    removeTransaction,
    clearTransactions,
  };
}
