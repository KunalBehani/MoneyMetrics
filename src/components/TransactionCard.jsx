import { FiEdit2, FiTrash2, FiTrendingUp, FiTrendingDown, FiRefreshCcw } from 'react-icons/fi';
import { useCurrency } from '../hooks/useCurrency';
import './Components.css';

export const TransactionCard = ({ transaction, onEdit, onDelete }) => {
  const { format } = useCurrency();
  const isIncome = transaction.type === 'income';

  return (
    <div className="card transaction-card flex-between mb-4">
      <div className="flex-start gap-md">
        <div className={`icon-box ${isIncome ? 'income' : 'expense'}`}>
          {isIncome ? <FiTrendingUp size={20} /> : <FiTrendingDown size={20} />}
        </div>
        <div>
          <h3 className="txn-title">
            {transaction.title}
            {transaction.recurring && (
              <span className="recurring-badge" title="Recurring Transaction">
                <FiRefreshCcw size={12} />
              </span>
            )}
          </h3>
          <p className="txn-meta text-muted">
            {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex-start gap-lg">
        <div className={`txn-amount ${isIncome ? 'text-income' : 'text-expense'}`}>
          {isIncome ? '+' : '-'}{format(transaction.amount)}
        </div>
        <div className="txn-actions gap-sm">
          <button onClick={() => onEdit(transaction)} className="btn-icon">
            <FiEdit2 size={16} />
          </button>
          <button onClick={() => onDelete(transaction.id)} className="btn-icon text-expense hover-expense">
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
