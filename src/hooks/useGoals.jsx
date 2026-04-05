import { useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';

export const useGoals = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useGoals must be used within a FinanceProvider');
  }
  return {
    goals: context.goals,
    addGoal: context.addGoal,
    updateGoal: context.updateGoal,
    deleteGoal: context.deleteGoal
  };
};
