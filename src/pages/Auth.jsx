import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { login, register } from '../store/authSlice';

export default function Auth({ mode }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '' });
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const from = useLocation().state?.from;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await dispatch(isRegister ? register(form) : login(form)).unwrap();
      toast.success(`Welcome${isRegister ? '' : ' back'}, ${user.name.split(' ')[0]}!`);
      // `from` can be a student page left over from someone else's logout, so admins always go to /admin.
      navigate(user.role === 'admin' ? '/admin' : (from ?? '/dashboard'), { replace: true });
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Something went wrong, please try again');
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-md py-12">
      <form onSubmit={onSubmit} className="card space-y-4">
        <h1 className="font-display text-3xl font-bold">{isRegister ? 'Create your account' : 'Log in'}</h1>
        {isRegister && (
          <label className="label">
            Full name
            <input className="input" value={form.name} onChange={set('name')} autoComplete="name" required />
          </label>
        )}
        <label className="label">
          Email
          <input className="input" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
        </label>
        <label className="label">
          Password
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={set('password')}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={isRegister ? 6 : undefined}
            required
          />
        </label>
        {isRegister && (
          <label className="label">
            College / hostel <span className="text-stone-400">(optional)</span>
            <input className="input" value={form.college} onChange={set('college')} placeholder="e.g. IIT Delhi, Kumaon Hostel" />
          </label>
        )}
        <button className="btn-primary w-full" disabled={busy}>
          {isRegister ? 'Sign up' : 'Log in'}
        </button>
        <p className="text-center text-sm text-stone-600 dark:text-stone-400">
          {isRegister ? 'Already have an account? ' : 'New here? '}
          <Link to={isRegister ? '/login' : '/register'} state={{ from }} className="font-semibold text-orange-600 hover:underline">
            {isRegister ? 'Log in' : 'Create an account'}
          </Link>
        </p>
      </form>
    </section>
  );
}
