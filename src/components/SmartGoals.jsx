import { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import { GoalCard } from './GoalCard';
import { FiPlus } from 'react-icons/fi';

export const SmartGoals = ({ netBalance }) => {
  const { goals, addGoal, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', targetAmount: '', deadline: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;

    addGoal({
      name: formData.name,
      targetAmount: Number(formData.targetAmount),
      deadline: formData.deadline || null
    });

    setFormData({ name: '', targetAmount: '', deadline: '' });
    setShowForm(false);
  };

  const sortedGoals = [...goals].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  let remainingBalance = Math.max(netBalance, 0);
  const goalProgressMap = {};

  sortedGoals.forEach(goal => {
    const allocation = Math.min(goal.targetAmount, remainingBalance);
    goalProgressMap[goal.id] = allocation;
    remainingBalance -= allocation;
  });

  return (
    <div className="card mt-6">
      <div className="flex-between mb-4">
        <h2 className="card-title">Smart Goals</h2>
        <button 
          className="btn-icon primary" 
          onClick={() => setShowForm(!showForm)}
          title="Add New Goal"
        >
          <FiPlus />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4" style={{ background: 'var(--bg-color)', borderRadius: '8px' }}>
          <div className="form-group mb-3">
            <label>Goal Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. New Laptop"
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Target Amount</label>
            <input 
              type="number" 
              className="form-control" 
              value={formData.targetAmount}
              onChange={e => setFormData({...formData, targetAmount: e.target.value})}
              placeholder="0.00"
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <div className="form-group mb-3">
            <label>Deadline (Optional)</label>
            <input 
              type="date" 
              className="form-control" 
              value={formData.deadline}
              onChange={e => setFormData({...formData, deadline: e.target.value})}
            />
          </div>
          <div className="flex" style={{ gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Goal</button>
          </div>
        </form>
      )}

      <div className="goals-list">
        {sortedGoals.length > 0 ? (
          sortedGoals.map(goal => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              allocatedAmount={goalProgressMap[goal.id]} 
              onDelete={deleteGoal} 
            />
          ))
        ) : (
          <p className="text-muted text-sm text-center py-4">No goals added yet. Start planning for your future!</p>
        )}
      </div>
    </div>
  );
};
