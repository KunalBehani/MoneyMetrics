import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useDebounce } from '../hooks/useDebounce';
import { TransactionCard } from '../components/TransactionCard';
import { SearchBar } from '../components/SearchBar';
import { Filters } from '../components/Filters';
import { useNavigate } from 'react-router-dom';
import { DataImport } from '../components/DataImport';
import './Pages.css';

const CATEGORIES = ['Food', 'Travel', 'Rent', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Subscriptions', 'Salary', 'Freelance', 'Other'];

export const Transactions = () => {
  const { transactions, deleteTransaction } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    sort: 'date-desc'
  });

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(lowerSearch) || 
        (t.notes && t.notes.toLowerCase().includes(lowerSearch))
      );
    }

    if (filters.type !== 'all') {
      result = result.filter(t => t.type === filters.type);
    }

    if (filters.category !== 'all') {
      result = result.filter(t => t.category === filters.category);
    }

    result.sort((a, b) => {
      switch (filters.sort) {
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'amount-desc': return b.amount - a.amount;
        case 'amount-asc': return a.amount - b.amount;
        case 'date-desc':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    return result;
  }, [transactions, debouncedSearch, filters]);

  return (
    <div className="page-container">
      <div className="flex-between mb-6">
        <h1 className="page-title">Transactions</h1>
        <DataImport />
      </div>

      <div className="card mb-6" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <Filters filters={filters} setFilters={setFilters} categories={CATEGORIES} />
      </div>

      <div className="transactions-list space-y-4">
        {filteredAndSortedTransactions.length > 0 ? (
          filteredAndSortedTransactions.map(txn => (
            <TransactionCard 
              key={txn.id} 
              transaction={txn} 
              onDelete={deleteTransaction} 
              onEdit={(t) => navigate(`/transactions/edit/${t.id}`)} 
            />
          ))
        ) : (
          <div className="card text-center py-12 text-muted">
            <p>No transactions found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
