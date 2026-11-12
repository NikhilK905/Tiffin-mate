import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { fetchCatalog } from './store/catalogSlice';
import { selectUser } from './store/authSlice';
import { useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Auth from './pages/Auth';
import Subscribe from './pages/Subscribe';
import Dashboard from './pages/Dashboard';

function RequireAuth({ children }) {
  const user = useSelector(selectUser);
  const location = useLocation();
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export default function App() {
  const dispatch = useDispatch();
  const status = useSelector((s) => s.catalog.status);
  const { theme } = useTheme();

  useEffect(() => {
    if (status === 'idle') dispatch(fetchCatalog());
  }, [status, dispatch]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {status === 'error' ? (
          <div className="card mt-10 text-center">
            <p>Could not load plans and menu.</p>
            <button className="btn-primary mt-4" onClick={() => dispatch(fetchCatalog())}>
              Try again
            </button>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/subscribe/:planId" element={<RequireAuth><Subscribe /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
      <ToastContainer position="bottom-right" autoClose={2500} theme={theme} />
    </>
  );
}
