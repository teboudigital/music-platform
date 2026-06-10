/**
 * Wrapper per route protette.
 * Redirect a /login se l'utente non è autenticato.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen">⏳</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
