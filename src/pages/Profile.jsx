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

  return (
    <section className="mx-auto grid max-w-3xl gap-6 py-12">
      <form onSubmit={onSave} className="card space-y-4">
        <h1 className="font-display text-2xl font-bold">My profile</h1>
        <p className="text-sm text-stone-500">{user.email}</p>
        <label className="label">Name<input className="input" value={form.name} onChange={set('name')} required /></label>
        <label className="label">College / hostel<input className="input" value={form.college} onChange={set('college')} /></label>
        <label className="label">Phone<input className="input" type="tel" value={form.phone} onChange={set('phone')} /></label>
        <label className="label">
          Diet preference
          <select className="input" value={form.diet} onChange={set('diet')}>
            <option value="veg">Veg</option>
            <option value="nonveg">Non-veg</option>
            <option value="jain">Jain</option>
          </select>
        </label>
        <button className="btn-primary">Save profile</button>
      </form>

      <form onSubmit={onPassword} className="card space-y-4">
        <h2 className="font-display text-xl font-bold">Change password</h2>
        <label className="label">Current password<input className="input" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required /></label>
        <label className="label">New password<input className="input" type="password" autoComplete="new-password" minLength={6} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required /></label>
        <button className="btn-primary">Change password</button>
      </form>

      <div className="card">
        <h2 className="font-display text-xl font-bold">My support tickets</h2>
        {tickets.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">No tickets yet.</p>
        ) : (
          <ul className="mt-3 space-y-3 text-sm">
            {tickets.map((t) => (
              <li key={t.id} className="rounded-xl border border-stone-200 p-3 dark:border-stone-800">
                <p className="flex justify-between font-medium">{t.subject}<span className="capitalize text-stone-500">{t.status}</span></p>
                <p className="mt-1 text-stone-600 dark:text-stone-400">{t.message}</p>
                {t.reply && <p className="mt-2 rounded-lg bg-orange-50 p-2 text-orange-900 dark:bg-orange-950/40 dark:text-orange-200">Admin: {t.reply}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
