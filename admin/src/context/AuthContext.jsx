import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('winvel_admin_token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('winvel_admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify token validity on load
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Session expired');
          return res.json();
        })
        .then((data) => {
          const userData = data.data || data.user || data;
          setUser(userData);
          localStorage.setItem('winvel_admin_user', JSON.stringify(userData));
        })
        .catch((err) => {
          console.warn('Auth verification failed:', err.message);
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Invalid email or password');
    }

    const authToken = data.token || data.accessToken || data.data?.token;
    const userData = data.user || data.data?.user;

    setToken(authToken);
    setUser(userData);
    localStorage.setItem('winvel_admin_token', authToken);
    localStorage.setItem('winvel_admin_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('winvel_admin_token');
    localStorage.removeItem('winvel_admin_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
