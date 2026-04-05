import { useTransactions } from '../hooks/useTransactions';
import { CategoryPieChart, TrendLineChart } from '../components/Charts';
import { format, parseISO } from 'date-fns';
import { FiDownload } from 'react-icons/fi';
import { generateMonthlyReport } from '../utils/exportReport';
import './Pages.css';

export const Analytics = () => {
  const { transactions } = useTransactions();

  const expenses = transactions.filter(t => t.type === 'expense');
  
  const categoryData = expenses.reduce((acc, t) => {
    const existing = acc.find(item => item.name === t.category);
    if (existing) {
      existing.value += Number(t.amount);
    } else {
      acc.push({ name: t.category, value: Number(t.amount) });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value);

  const trendDataMap = expenses.reduce((acc, t) => {
    const monthYear = format(parseISO(t.date), 'MMM yyyy');
    if (acc[monthYear]) {
      acc[monthYear] += Number(t.amount);
    } else {
      acc[monthYear] = Number(t.amount);
    }
    return acc;
  }, {});

  const trendData = Object.keys(trendDataMap).map(date => ({
    date,
    expense: trendDataMap[date]
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="page-container">
      <div className="flex-between mb-6">
        <h1 className="page-title">Financial Analytics</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => generateMonthlyReport(transactions)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiDownload /> Export PDF
        </button>
      </div>
      
      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title mb-6">Spending by Category</h2>
          {categoryData.length > 0 ? (
            <CategoryPieChart data={categoryData} />
          ) : (
            <p className="text-muted text-center py-8">No expense data available.</p>
          )}
        </div>
        
        <div className="card">
          <h2 className="card-title mb-6">Monthly Spending Trend</h2>
          {trendData.length > 0 ? (
            <TrendLineChart data={trendData} />
          ) : (
            <p className="text-muted text-center py-8">No expense data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};
