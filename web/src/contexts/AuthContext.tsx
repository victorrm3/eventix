import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

//Clase de contexto de autentificación de React
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  profile_image?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

//Si React intenta usarlo sin Provider, lanzará un error.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//Permite usar el contexto más fácilmente y asegura que se esté usando dentro del AuthProvider.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Error de verificación');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Provider que maneja el estado de autenticación y expone helpers (login, register, logout...).
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Base URL de la API; centralizar aquí facilita cambios en distintos entornos.
  const API_URL = 'https://eventixs.es/api';

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      // Asumimos que los datos guardados son válidos y los restauramos en memoria
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Enviar credenciales al backend y almacenar token + usuario en localStorage
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al iniciar sesión');
      }

      const data = await response.json();
      
      // Guardar token y usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  // Registro de nuevo usuario: similar a login, guarda token y usuario recibido
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al registrarse');
      }

      const data = await response.json();
      
      // Guardar token y usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  // Cerrar sesión: limpiar almacenamiento local y estado en memoria
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Actualizar campos del usuario en memoria y persistir en localStorage
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
