import { FiTarget } from 'react-icons/fi';
import { useBudget } from '../hooks/useBudget';
import { useCurrency } from '../hooks/useCurrency';
import './Components.css';

export const BudgetCard = () => {
  const { budget, currentMonthExpenses, remainingBudget, percentageUsed } = useBudget();
  const { format } = useCurrency();

  const isWarning = percentageUsed > 85;
  const isDanger = percentageUsed >= 100;

  return (
    <div className="card budget-card">
      <div className="flex-between mb-4">
        <div className="flex-start gap-sm">
          <div className="icon-box primary">
            <FiTarget size={20} />
          </div>
          <h2 className="card-title">Monthly Budget</h2>
        </div>
        <div className="budget-target text-lg font-bold">
          Limit: <span className="text-primary">{format(budget.monthlyBudget)}</span>
        </div>
      </div>

      <div className="budget-progress-container mb-4">
        <div className="flex-between text-sm mb-2 text-muted">
          <span>{format(currentMonthExpenses)} spent</span>
          <span>{format(Math.max(0, remainingBudget))} remaining</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className={`progress-bar-fill ${isDanger ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-success'}`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>
      </div>
    </div>
  );
};
