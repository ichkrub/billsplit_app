import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-white border-t border-slate-200">
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link to="/" className="text-xl font-extrabold text-gray-900">
            SplitFair
          </Link>
          <p className="text-sm text-gray-500">
            Split bills with friends — instantly and fairly.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex gap-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link to="/quicksplit" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
              Quick Split
            </Link>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} SplitFair. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;