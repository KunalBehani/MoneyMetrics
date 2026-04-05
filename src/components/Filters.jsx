import './Components.css';

export const Filters = ({ filters, setFilters, categories }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="filters-container flex-start gap-md">
      <select name="type" value={filters.type} onChange={handleChange} className="filter-select">
        <option value="all">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      
      <select name="category" value={filters.category} onChange={handleChange} className="filter-select">
        <option value="all">All Categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      
      <select name="sort" value={filters.sort} onChange={handleChange} className="filter-select">
        <option value="date-desc">Newest First</option>
        <option value="date-asc">Oldest First</option>
        <option value="amount-desc">Highest Amount</option>
        <option value="amount-asc">Lowest Amount</option>
      </select>
    </div>
  );
};
