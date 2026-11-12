import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { addAnnouncement, deleteAnnouncement } from '../../store/notificationsSlice';
import { fmt } from './shared';

export default function Announcements() {
  const list = useSelector((s) => s.notifications.announcements);
  const dispatch = useDispatch();
  const [f, setF] = useState({ title: '', body: '' });

  const post = (e) => {
    e.preventDefault();
    if (!f.title.trim() || !f.body.trim()) return toast.error('Title and message are required');
    dispatch(addAnnouncement({ title: f.title.trim(), body: f.body.trim() }));
    setF({ title: '', body: '' });
    toast.success('Announcement posted');
  };
  const remove = (a) => {
    if (!window.confirm(`Delete "${a.title}"?`)) return;
    dispatch(deleteAnnouncement(a.id));
    toast.success('Announcement deleted');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={post} className="card space-y-4">
        <label className="label">Title<input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
        <label className="label">Message<textarea className="input" rows={3} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></label>
        <button className="btn-primary" type="submit">Post announcement</button>
      </form>
      {list.map((a) => (
        <div key={a.id} className="card flex items-start gap-4">
          <div className="mr-auto">
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-xs text-stone-500">{fmt(a.createdAt)}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{a.body}</p>
          </div>
          <button className="btn-ghost text-red-600 dark:text-red-400" onClick={() => remove(a)}>Delete</button>
        </div>
      ))}
      {!list.length && <p className="card text-center text-sm text-stone-500">No announcements.</p>}
    </div>
  );
}
