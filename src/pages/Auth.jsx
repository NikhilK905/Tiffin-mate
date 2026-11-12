import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { login, register } from '../store/authSlice';
import Photo from '../components/Photo';
import { images } from '../lib/images';

export default function Auth({ mode }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '' });
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
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
    <section className="mx-auto my-8 grid max-w-4xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-(--shadow-soft) md:grid-cols-2 dark:border-stone-800 dark:bg-stone-900">
      <aside className="flex flex-col bg-gradient-to-br from-orange-600 via-orange-500 to-turmeric-400 p-8 text-white md:p-10">
        <p className="font-display text-2xl font-bold">🍱 DabbaDost</p>
        <h2 className="mt-8 font-display text-2xl font-bold">Home-style meals, every day.</h2>
        <ul className="mt-5 space-y-2 text-sm text-white">
          {['Fresh from local home kitchens', 'Delivered to your hostel gate', 'Skip days when you are away'].map((b) => (
            <li key={b} className="flex gap-2"><span aria-hidden="true">✓</span>{b}</li>
          ))}
        </ul>
        <Photo image={images.thali} className="mt-6 hidden h-40 w-full rounded-2xl border-4 border-white/80 shadow-lg md:block" />
      </aside>
      <form onSubmit={onSubmit} className="space-y-4 p-8 md:p-10">
        <h1 className="font-display text-3xl font-bold">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
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
        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input
              id="password"
              className="input pr-16"
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={isRegister ? 6 : undefined}
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-pressed={show}
              className="absolute inset-y-0 right-3 mt-1 text-xs font-semibold text-orange-600 hover:underline"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        {isRegister && (
          <label className="label">
            College / hostel <span className="text-stone-400">(optional)</span>
            <input className="input" value={form.college} onChange={set('college')} placeholder="e.g. Sample Hostel, Block B" />
          </label>
        )}
        <button className="btn-primary w-full" disabled={busy}>
          {isRegister ? 'Sign up' : 'Log in'}
        </button>
        <p className="muted text-center text-sm">
          {isRegister ? 'Already have an account? ' : 'New here? '}
          <Link to={isRegister ? '/login' : '/register'} state={{ from }} className="font-semibold text-orange-600 hover:underline">
            {isRegister ? 'Log in' : 'Create an account'}
          </Link>
        </p>
      </form>
    </section>
  );
}
