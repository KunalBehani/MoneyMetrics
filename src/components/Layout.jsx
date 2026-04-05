import { Outlet, NavLink } from 'react-router-dom';
import { FiHome, FiList, FiPlusCircle, FiPieChart, FiTarget } from 'react-icons/fi';

export const Layout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome /> },
    { name: 'Transactions', path: '/transactions', icon: <FiList /> },
    { name: 'Add Record', path: '/transactions/new', icon: <FiPlusCircle /> },
    { name: 'Budget', path: '/budget', icon: <FiTarget /> },
    { name: 'Analytics', path: '/analytics', icon: <FiPieChart /> },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">M</div>
          <h1 className="brand-title">MoneyMetrics</h1>
        </div>
        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
