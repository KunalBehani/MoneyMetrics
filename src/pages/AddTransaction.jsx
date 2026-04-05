import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { useBudget } from '../hooks/useBudget';
import { toast } from 'react-toastify';
import './Pages.css';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  amount: yup.number().positive('Amount must be positive').required('Amount is required'),
  category: yup.string().required('Category is required'),
  date: yup.string().required('Date is required'),
  type: yup.string().oneOf(['income', 'expense']).required('Type is required'),
  notes: yup.string(),
  recurring: yup.boolean()
}).required();

const CATEGORIES = ['Food', 'Travel', 'Rent', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Subscriptions', 'Salary', 'Freelance', 'Other'];

export const AddTransaction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { transactions, addTransaction, updateTransaction } = useTransactions();
  const { budget, currentMonthExpenses, currentMonthIncome, categorySpent } = useBudget();
  
  const isEditing = Boolean(id);
  const editingTxn = isEditing ? transactions.find(t => t.id === id) : null;
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { type: 'expense', date: new Date().toISOString().split('T')[0], recurring: false }
  });

  useEffect(() => {
    if (isEditing && editingTxn) {
      reset({
        ...editingTxn,
        date: new Date(editingTxn.date).toISOString().split('T')[0]
      });
    } else if (isEditing && !editingTxn) {
      toast.error('Transaction not found!');
      navigate('/transactions');
    }
  }, [isEditing, editingTxn, reset, navigate]);

  const onSubmit = (data) => {
    if (data.type === 'expense') {
      const amount = Number(data.amount);
      const prevAmount = isEditing && editingTxn?.type === 'expense' ? Number(editingTxn.amount) : 0;
      const netChange = amount - prevAmount;
      const newTotal = currentMonthExpenses + netChange;
      const newNetBalance = currentMonthIncome - newTotal;
      
      if (newTotal > newNetBalance) {
        toast.warning(`⚠️ Heads up: Your total expenses (₹${newTotal}) now exceed your remaining net balance (₹${newNetBalance})!`, { autoClose: 6000 });
      }

      if (budget.monthlyBudget && newTotal > budget.monthlyBudget) {
        toast.error(`⚠️ Overall Monthly Budget Exceeded! (Limit: ₹${budget.monthlyBudget})`, { autoClose: 6000 });
      } else if (budget.monthlyBudget && newTotal > budget.monthlyBudget * 0.9 && !isEditing) {
        toast.warning(`⚠️ Warning: Nearing Overall Monthly Budget!`);
      }
      
      const catLimit = budget.categoryBudgets?.[data.category];
      if (catLimit) {
        const prevCatSpent = isEditing && editingTxn?.category === data.category ? Number(editingTxn.amount) : 0;
        const newCatTotal = (categorySpent[data.category] || 0) - prevCatSpent + amount;
        
        if (newCatTotal > catLimit) {
          toast.error(`⚠️ ${data.category} Budget Exceeded! (Limit: ₹${catLimit})`, { autoClose: 6000 });
        }
      }
    }

    if (isEditing) {
      updateTransaction(id, data);
      toast.success('Transaction updated successfully!');
    } else {
      addTransaction(data);
      toast.success('Transaction added successfully!');
    }
    
    navigate('/transactions');
  };

  return (
    <div className="page-container">
      <h1 className="page-title mb-6">{isEditing ? 'Edit Record' : 'Add New Record'}</h1>
      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)} className="transaction-form">
          <div className="form-group">
            <label>Title</label>
            <input {...register('title')} placeholder="e.g. Grocery" className="form-input" />
            <p className="error-text">{errors.title?.message}</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" step="0.01" {...register('amount')} className="form-input" />
              <p className="error-text">{errors.amount?.message}</p>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" {...register('date')} className="form-input" />
              <p className="error-text">{errors.date?.message}</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select {...register('type')} className="form-input">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select {...register('category')} className="form-input">
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <p className="error-text">{errors.category?.message}</p>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea {...register('notes')} placeholder="Optional notes" className="form-input" rows="3" />
          </div>

          <div className="form-group checkbox-group mt-4">
            <input type="checkbox" {...register('recurring')} id="recurring" />
            <label htmlFor="recurring">Mark as Recurring (Monthly)</label>
          </div>

          <div className="form-actions mt-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{isEditing ? 'Save Changes' : 'Save Transaction'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
