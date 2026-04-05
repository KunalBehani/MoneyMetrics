/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('finance_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('finance_budget');
    return saved ? JSON.parse(saved) : { monthlyBudget: 0 };
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('finance_goals');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance_budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('finance_goals', JSON.stringify(goals));
  }, [goals]);

  const addTransaction = (txn) => {
    setTransactions(prev => [{ id: uuidv4(), ...txn }, ...prev]);
  };

  const updateTransaction = (id, updatedTxn) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedTxn } : t));
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addGoal = (goal) => {
    setGoals(prev => [{ id: uuidv4(), ...goal }, ...prev]);
  };

  const updateGoal = (id, updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updatedGoal } : g));
  };

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <FinanceContext.Provider value={{
      transactions, addTransaction, updateTransaction, deleteTransaction,
      budget, setBudget,
      goals, addGoal, updateGoal, deleteGoal
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
