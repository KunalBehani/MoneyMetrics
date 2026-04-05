import { useContext, useMemo } from 'react';
import { FinanceContext } from '../context/FinanceContext';

export const useBudget = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useBudget must be used within a FinanceProvider');
  }

  const { transactions, budget, setBudget } = context;

  const currentMonthExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const remainingBudget = useMemo(() => {
    return (budget.monthlyBudget || 0) - currentMonthExpenses;
  }, [budget.monthlyBudget, currentMonthExpenses]);

  const percentageUsed = useMemo(() => {
    if (!budget.monthlyBudget) return 0;
    return Math.min((currentMonthExpenses / budget.monthlyBudget) * 100, 100);
  }, [budget.monthlyBudget, currentMonthExpenses]);

  const categorySpent = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {});
  }, [transactions]);

  const netBalance = useMemo(() => {
    const totalInc = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExp = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    return totalInc - totalExp;
  }, [transactions]);

  return {
    budget,
    setBudget,
    currentMonthExpenses,
    remainingBudget,
    percentageUsed,
    categorySpent,
    netBalance
  };
};
