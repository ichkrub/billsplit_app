import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/splitfair-logo.png';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src={logo} alt="SplitFair Logo" className="h-8 w-8 rounded shadow-sm" />
          <span className="text-xl font-extrabold text-gray-900">SplitFair</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors ${
              isHome ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            Home
          </Link>
          <Link
            to="/quicksplit"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium shadow-sm hover:bg-primary-700 transition-colors"
          >
            Quick Split
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;