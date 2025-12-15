import React, { createContext, useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const fetchUser = async () => {
      const stored = authService.getCurrentUser();
      setLoading(true);
      if (stored && stored.token) {
        const profile = await authService.fetchProfile();
        setUser(profile || stored.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    history.push('/login'); // Redirect to login after logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);