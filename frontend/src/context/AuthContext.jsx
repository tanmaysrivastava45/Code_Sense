import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../config/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get token and user from localStorage on mount
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('jwtToken');
        const storedSessionId = localStorage.getItem('sessionId');
        
        if (storedToken) {
          // Verify token is still valid by fetching profile
          const response = await apiClient.auth.getProfile(storedToken);
          
          if (response.user) {
            setToken(storedToken);
            setSessionId(storedSessionId);
            setUser(response.user);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('sessionId');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('sessionId');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (jwtToken, sessionId, userData) => {
    localStorage.setItem('jwtToken', jwtToken);
    localStorage.setItem('sessionId', sessionId);
    setToken(jwtToken);
    setSessionId(sessionId);
    setUser(userData);
  };

  const logout = async () => {
    try {
      if (token) {
        await apiClient.auth.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('sessionId');
      setToken(null);
      setSessionId(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    sessionId,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
