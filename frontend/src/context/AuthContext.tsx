import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'gestor';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se já existe sessão ativa ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // IMPORTANTE: credentials: 'include' envia o cookie da sessão para o Flask
        const res = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include' 
        });
        const data = await res.json();
        if (data.is_authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
        await fetch('http://localhost:5000/api/v1/auth/logout', { 
            method: 'POST',
            credentials: 'include' // Envia cookie para o servidor saber quem deslogar
        });
    } catch (error) {
        console.error("Erro ao deslogar", error);
    }
    setUser(null);
    window.location.href = '/auth'; // Redireciona para login
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
