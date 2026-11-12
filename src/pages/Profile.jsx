import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { changePassword, selectUser, updateProfile } from '../store/authSlice';
import { selectMyMessages } from '../store/messagesSlice';

export default function Profile() {
  const user = useSelector(selectUser);
  const tickets = useSelector(selectMyMessages);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: user.name, college: user.college ?? '', phone: user.phone ?? '', diet: user.diet ?? 'veg' });
  const [pw, setPw] = useState({ current: '', next: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Please enter your name');
    dispatch(updateProfile({ ...form, name: form.name.trim() }));
    toast.success('Profile saved');
  };

  const onPassword = async (e) => {
    e.preventDefault();
    try {
      await dispatch(changePassword(pw)).unwrap();
      setPw({ current: '', next: '' });
      toast.success('Password changed');
    } catch (msg) {
      toast.error(typeof msg === 'string' ? msg : 'Could not change password');
    }
  };

  const badge = { open: 'badge-warn', resolved: 'badge-veg' };

  return (
    <section className="mx-auto max-w-3xl space-y-6 py-10">
      <header className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-orange-600 font-display text-2xl font-bold text-white shadow-(--shadow-soft)" aria-hidden="true">
          {user.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="page-title truncate">{user.name}</h1>
          <p className="muted truncate text-sm">{user.email}</p>
        </div>
      </header>

      <form onSubmit={onSave} className="card space-y-4">
        <h2 className="font-display text-xl font-semibold">Personal details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="label">Name<input className="input" value={form.name} onChange={set('name')} required /></label>
          <label className="label">Phone<input className="input" type="tel" value={form.phone} onChange={set('phone')} /></label>
          <label className="label sm:col-span-2">College / hostel<input className="input" value={form.college} onChange={set('college')} /></label>
          <label className="label sm:col-span-2">
            Diet preference
            <select className="input" value={form.diet} onChange={set('diet')}>
              <option value="veg">Veg</option>
              <option value="nonveg">Non-veg</option>
              <option value="jain">Jain</option>
            </select>
          </label>
        </div>
        <button className="btn-primary">Save profile</button>
      </form>

      <form onSubmit={onPassword} className="card space-y-4">
        <h2 className="font-display text-xl font-semibold">Change password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="label">Current password<input className="input" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required /></label>
          <label className="label">New password<input className="input" type="password" autoComplete="new-password" minLength={6} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required /></label>
        </div>
        <button className="btn-ghost">Change password</button>
      </form>

      <div className="card">
        <h2 className="font-display text-xl font-semibold">My support tickets</h2>
        {tickets.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-4xl" aria-hidden="true">💬</p>
            <p className="muted mt-1 text-sm">No tickets yet.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {tickets.map((t) => (
              <li key={t.id} className="rounded-xl border border-stone-200 p-4 dark:border-stone-800">
                <p className="flex items-center justify-between gap-2 font-semibold">{t.subject}<span className={badge[t.status] ?? 'badge'}>{t.status}</span></p>
                <p className="muted mt-1">{t.message}</p>
                {t.reply && <p className="mt-3 rounded-lg bg-green-50 p-3 text-green-900 dark:bg-green-900/20 dark:text-green-200"><b>Admin reply:</b> {t.reply}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
