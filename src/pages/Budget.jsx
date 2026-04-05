import { useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import { BudgetCard } from '../components/BudgetCard';
import { toast } from 'react-toastify';
import './Pages.css';

const CATEGORIES = ['Food', 'Travel', 'Rent', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Subscriptions'];

export const Budget = () => {
  const { budget, setBudget, categorySpent, currentMonthExpenses, netBalance } = useBudget();
  const [newBudget, setNewBudget] = useState(budget.monthlyBudget || '');
  const [catBudgets, setCatBudgets] = useState(budget.categoryBudgets || {});

  const handleUpdate = (e) => {
    e.preventDefault();
    const limit = Number(newBudget);
    
    const catSum = Object.values(budget.categoryBudgets || {}).reduce((sum, amt) => sum + (Number(amt) || 0), 0);
    if (limit > 0 && limit < catSum) {
      toast.error(`⚠️ Cannot lower overall budget to ₹${limit}! It is less than the total of your set category budgets (₹${catSum}). Please lower your category budgets first.`, { autoClose: 6000 });
      return;
    }

    setBudget({ ...budget, monthlyBudget: limit });
    
    if (limit > 0 && currentMonthExpenses > limit) {
      toast.error(`⚠️ Overall Monthly Budget Exceeded! Limit is ₹${limit} but you've spent ₹${currentMonthExpenses}.`);
    } else if (limit > 0 && netBalance < limit) {
      toast.warning(`⚠️ Warning: Your allocated budget (₹${limit}) exceeds your current available Net Balance (₹${netBalance}).`);
    } else {
      toast.success('Overall budget updated successfully!');
    }
  };

  const handleCatUpdate = (cat) => {
    const val = Number(catBudgets[cat]) || 0;
    
    const currentCatBudgets = { ...budget.categoryBudgets };
    currentCatBudgets[cat] = val;
    const newCatSum = Object.values(currentCatBudgets).reduce((sum, amt) => sum + (Number(amt) || 0), 0);

    if (budget.monthlyBudget && newCatSum > budget.monthlyBudget) {
      toast.error(`⚠️ Cannot save! Total category budgets (₹${newCatSum}) would exceed your overall monthly budget (₹${budget.monthlyBudget}).`, { autoClose: 6000 });
      return;
    }

    setBudget({
      ...budget,
      categoryBudgets: currentCatBudgets
    });
    
    const spent = categorySpent[cat] || 0;
    if (val > 0 && spent > val) {
      toast.error(`⚠️ ${cat} Budget Exceeded! Limit is ₹${val} but you've spent ₹${spent}.`);
    } else {
      toast.success(`${cat} budget updated!`);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title mb-6">Budget Management</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <BudgetCard />
          
          <div className="card mt-6">
            <h2 className="card-title mb-4">Set Monthly Target</h2>
            <form onSubmit={handleUpdate} className="transaction-form">
              <div className="form-group">
                <label>Budget Allocated from Salary (Overall ₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-actions mt-4">
                <button type="submit" className="btn-primary w-full">Update Allocated Budget</button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="dashboard-section">
          <div className="card">
            <h2 className="card-title mb-4">Category Budgets</h2>
            <div className="space-y-4">
              {CATEGORIES.map(cat => {
                const spent = categorySpent[cat] || 0;
                const limit = budget.categoryBudgets?.[cat] || 0;
                const pct = limit ? Math.min((spent / limit) * 100, 100) : 0;
                const isWarning = pct > 85;
                const isDanger = pct >= 100;

                return (
                  <div key={cat} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div className="flex-between mb-2">
                      <span style={{ fontWeight: 600 }}>{cat}</span>
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>Spent: ₹{spent} / Limit: {limit ? `₹${limit}` : 'Not set'}</span>
                    </div>
                    {limit > 0 && (
                      <div className="progress-bar-bg mb-2" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar-fill ${isDanger ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-success'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <input 
                        type="number" 
                        placeholder="Set limit" 
                        className="form-input"
                        style={{ flex: 1, padding: '8px', fontSize: '0.9rem' }}
                        value={catBudgets[cat] || ''}
                        onChange={(e) => setCatBudgets({...catBudgets, [cat]: e.target.value})}
                      />
                      <button 
                        onClick={() => handleCatUpdate(cat)}
                        className="btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
