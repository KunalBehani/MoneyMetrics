import { FiSearch } from 'react-icons/fi';
import './Components.css';

export const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search-bar">
      <FiSearch className="search-icon text-muted" size={20} />
      <input
        type="text"
        placeholder="Search transactions by title or notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
    </div>
  );
};
