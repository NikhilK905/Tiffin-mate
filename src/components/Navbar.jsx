import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { logout, selectUser } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition hover:text-orange-600 ${isActive ? 'text-orange-600' : 'text-stone-600 dark:text-stone-300'}`;

export default function Navbar() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const onLogout = () => {
    dispatch(logout());
    toast.info('Logged out');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/80 backdrop-blur dark:border-stone-800 dark:bg-stone-950/80">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:gap-6 sm:px-6">
        <Link to="/" className="mr-auto font-display text-xl font-bold">
          🍱 Dabba<span className="text-orange-600">Dost</span>
        </Link>
        <NavLink to="/menu" className={linkClass}>Menu</NavLink>
        {user && <NavLink to="/dashboard" className={linkClass}>My tiffin</NavLink>}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="rounded-full p-2 hover:bg-stone-200 dark:hover:bg-stone-800"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {user ? (
          <button onClick={onLogout} className="btn-ghost px-4 py-2">Log out</button>
        ) : (
          <Link to="/login" className="btn-primary px-4 py-2">Log in</Link>
        )}
      </nav>
    </header>
  );
}
