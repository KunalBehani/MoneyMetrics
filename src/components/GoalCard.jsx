import { motion } from 'framer-motion';
import { useCurrency } from '../hooks/useCurrency';
import { FiTrash2, FiTarget } from 'react-icons/fi';
import './Components.css'; // reusing existing common styles or page styles

const MotionDiv = motion.div;

export const GoalCard = ({ goal, allocatedAmount, onDelete }) => {
  const { format } = useCurrency();
  const percentage = Math.min(Math.max((allocatedAmount / goal.targetAmount) * 100, 0), 100);

  return (
    <div className="card mb-4" style={{ position: 'relative' }}>
      <div className="flex-between mb-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="icon-box primary" style={{ width: '32px', height: '32px' }}>
            <FiTarget size={16} />
          </div>
          <h3 className="card-title text-base">{goal.name}</h3>
        </div>
        <button className="btn-icon text-muted" onClick={() => onDelete(goal.id)}>
          <FiTrash2 />
        </button>
      </div>

      <div className="flex-between mb-2 text-sm">
        <span className="text-muted">Progress</span>
        <span style={{ fontWeight: '500' }}>
          {format(Math.min(allocatedAmount, goal.targetAmount))} / {format(goal.targetAmount)}
        </span>
      </div>

      <div style={{ background: 'var(--border-color)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
        <MotionDiv
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            height: '100%',
            background: percentage >= 100 ? 'var(--income-color)' : 'var(--accent-primary)',
            borderRadius: '4px'
          }}
        />
      </div>
      
      {goal.deadline && (
        <div className="mt-2 text-xs text-muted text-right">
          Target Date: {new Date(goal.deadline).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};
