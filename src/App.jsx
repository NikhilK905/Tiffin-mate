import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { fetchCatalog } from './store/catalogSlice';
import { selectUser } from './store/authSlice';
import { useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { SkeletonGrid } from './components/PlanCard';
import RequireAdmin from './components/RequireAdmin';
import Home from './pages/Home';
import Plans from './pages/Plans';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Menu from './pages/Menu';
import Auth from './pages/Auth';
import Subscribe from './pages/Subscribe';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

function NotFound() {
  return (
    <section className="py-24 text-center">
      <p className="text-6xl" aria-hidden="true">🍽️</p>
      <h1 className="mt-4 font-display text-4xl font-bold">This page is off the menu</h1>
      <p className="muted mt-2">We couldn't find what you were looking for.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </section>
  );
}

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
      <main className="mx-auto min-h-[55vh] max-w-6xl px-4 pb-24 sm:px-6">
        {status === 'error' ? (
          <div className="card mt-10 text-center">
            <p>Could not load plans and menu.</p>
            <button className="btn-primary mt-4" onClick={() => dispatch(fetchCatalog())}>
              Try again
            </button>
          </div>
        ) : status === 'idle' ? (
          <div className="mt-10"><SkeletonGrid count={3} /></div>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/subscribe/:planId" element={<RequireAuth><Subscribe /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/billing" element={<RequireAuth><Billing /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </main>
      <Footer />
      <ToastContainer position="bottom-right" autoClose={2500} theme={theme} />
    </>
  );
}
