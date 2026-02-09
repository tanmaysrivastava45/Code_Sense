import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code, LogOut, User, Zap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getUserName = () => {
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect shadow-xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
            <Code className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">CodeSense</h1>
            <p className="text-xs text-cyan-400 flex items-center gap-1">
              <Zap size={12} />
              by Tanmay Srivastava
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-lg">
                <User className="text-cyan-400" size={18} />
                <span className="text-white text-sm font-medium hidden sm:inline">
                  {getUserName()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/50"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-white hover:text-cyan-400 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 gradient-primary text-white rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/50"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
