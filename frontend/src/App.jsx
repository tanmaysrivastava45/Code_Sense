import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CollaborationProvider } from './context/CollaborationContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CollaborationRoom from './pages/CollaborationRoom';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/register" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/home" />;
};

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/' || 
                     location.pathname === '/register' || 
                     location.pathname === '/login' ||
                     location.pathname === '/forgot-password' ||
                     location.pathname === '/reset-password';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        
        <Route path="/reset-password" element={
          <ResetPassword />
        } />
        
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="/collaborate/:roomId" element={
          <ProtectedRoute>
            <CollaborationRoom />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CollaborationProvider>
          <div className="min-h-screen bg-slate-950">
            <AppContent />
          </div>
        </CollaborationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
