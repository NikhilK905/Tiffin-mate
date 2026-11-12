import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';
import { selectIsAdmin } from '../store/authSlice';

export default function RequireAdmin({ children }) {
  return useSelector(selectIsAdmin) ? children : <Navigate to="/" replace />;
}
