import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (!auth) {
        throw new Error('Firebase authentication is not initialized');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // More user-friendly error messages
      const errorMessage = error.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : error.code === 'auth/too-many-requests'
        ? 'Too many failed attempts. Please try again later'
        : error.code === 'auth/invalid-email'
        ? 'Please enter a valid email address'
        : error.code === 'auth/api-key-not-valid'
        ? 'Authentication service is temporarily unavailable. Please try again later.'
        : 'Failed to login. Please check your credentials';
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      if (!auth) {
        throw new Error('Firebase authentication is not initialized');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? 'Email already in use'
        : error.code === 'auth/weak-password'
        ? 'Password should be at least 6 characters'
        : error.code === 'auth/invalid-email'
        ? 'Please enter a valid email address'
        : 'Failed to create account';
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase authentication is not initialized');
      }

      await signOut(auth);
      setCurrentUser(null);
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}