import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { logout, selectIsAdmin, selectUser } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const linkClass = ({ isActive }) =>
  `block border-b-2 py-2 text-sm font-medium transition hover:text-orange-600 md:py-1 ${
    isActive ? 'border-orange-600 text-orange-700 dark:text-orange-400' : 'border-transparent text-stone-700 dark:text-stone-300'
  }`;

export default function Navbar() {
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const links = [
    ['/plans', 'Plans'],
    ['/menu', 'Menu'],
    ['/about', 'About'],
    ['/contact', 'Contact'],
    ...(user && !isAdmin ? [['/dashboard', 'My tiffin']] : []), // admins reach /admin through the avatar
  ];

  const onLogout = () => {
    dispatch(logout());
    setOpen(false);
    toast.info('Logged out');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/90 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" onClick={() => setOpen(false)} className="mr-auto flex items-center gap-2 font-display text-xl font-bold">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-lg shadow-sm">🍱</span>
          <span>Dabba<span className="text-orange-600">Dost</span></span>
        </Link>
        {user && !isAdmin && <NotificationBell />}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="rounded-full p-2 hover:bg-stone-200 md:order-last dark:hover:bg-stone-800"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Menu"
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm md:hidden dark:border-stone-700"
        >
          {open ? '✕' : '☰'}
        </button>
        <div className={`${open ? 'flex' : 'hidden'} w-full flex-col md:flex md:w-auto md:flex-row md:items-center md:gap-6`}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={linkClass}>
              {label}
            </NavLink>
          ))}
          {user ? (
            <div className="mt-2 flex items-center gap-3 md:mt-0">
              <Link to={isAdmin ? '/admin' : '/profile'} onClick={() => setOpen(false)} title="My profile" className="flex items-center gap-2 text-sm font-medium hover:text-orange-600">
                <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-turmeric-300 font-bold text-stone-900 dark:bg-turmeric-400 dark:text-orange-300">
                  {user.name[0].toUpperCase()}
                </span>
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={onLogout} className="btn-ghost px-4 py-2">Log out</button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="btn-primary mt-2 px-4 py-2 md:mt-0">Log in</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
