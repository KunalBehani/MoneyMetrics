import { useTransactions } from '../hooks/useTransactions';
import { useCurrency } from '../hooks/useCurrency';
import { TransactionCard } from '../components/TransactionCard';
import { BudgetCard } from '../components/BudgetCard';
import { SmartGoals } from '../components/SmartGoals';
import { IncomeExpenseBarChart } from '../components/Charts';
import { Link, useNavigate } from 'react-router-dom';
import { FiDollarSign, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import './Pages.css';

export const Dashboard = () => {
  const { transactions, deleteTransaction } = useTransactions();
  const { format } = useCurrency();
  const navigate = useNavigate();

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpense;

  const recentTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const chartData = [
    { name: 'Summary', income: totalIncome, expense: totalExpense }
  ];

  return (
    <div className="page-container dashboard">
      <h1 className="page-title mb-6">Overview</h1>
      
      <div className="metrics-grid mb-8">
        <div className="metric-card">
          <div className="icon-box primary mb-4"><FiDollarSign size={24} /></div>
          <div className="metric-label">Net Balance</div>
          <div className="metric-value">{format(netBalance)}</div>
        </div>
        <div className="metric-card">
          <div className="icon-box income mb-4"><FiTrendingUp size={24} /></div>
          <div className="metric-label">Total Income</div>
          <div className="metric-value text-income">{format(totalIncome)}</div>
        </div>
        <div className="metric-card">
          <div className="icon-box expense mb-4"><FiTrendingDown size={24} /></div>
          <div className="metric-label">Total Expenses</div>
          <div className="metric-value text-expense">{format(totalExpense)}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <BudgetCard />
          <div className="card mt-6">
            <h2 className="card-title mb-4">Income vs Expense</h2>
            <IncomeExpenseBarChart data={chartData} />
          </div>
          <SmartGoals netBalance={netBalance} />
        </div>
        
        <div className="dashboard-section card">
          <div className="flex-between mb-6">
            <h2 className="card-title">Recent Transactions</h2>
            <Link to="/transactions" className="view-all-link">View All</Link>
          </div>
          <div className="recent-list">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(txn => (
                <TransactionCard key={txn.id} transaction={txn} onDelete={deleteTransaction} onEdit={(t) => navigate(`/transactions/edit/${t.id}`)} />
              ))
            ) : (
              <p className="text-muted text-center py-8">No transactions yet. Add one to see it here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
