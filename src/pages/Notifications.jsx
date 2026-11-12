import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { selectUser } from '../store/authSlice';
import { markAllRead, selectUnreadCount } from '../store/notificationsSlice';
import { selectSubscription } from '../store/subscriptionSlice';
import { todayISO } from '../lib/subscription';
import { reminders } from '../lib/tracking';

export default function Notifications() {
  const user = useSelector(selectUser);
  const sub = useSelector(selectSubscription);
  const announcements = useSelector((s) => s.notifications.announcements);
  const read = useSelector((s) => s.notifications.readByEmail[s.auth.currentEmail] ?? []);
  const unread = useSelector(selectUnreadCount);
  const dispatch = useDispatch();
  const alerts = reminders(sub, todayISO());

  return (
    <section className="mx-auto max-w-2xl space-y-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Notifications</h1>
        <button className="btn-ghost" disabled={!unread} onClick={() => dispatch(markAllRead(user.email))}>Mark all read</button>
      </div>

      {alerts.length > 0 && (
        <ul className="space-y-3" aria-label="Reminders">
          {alerts.map((r) => (
            <li key={r.id} className="card flex items-center justify-between gap-4 border-orange-300 dark:border-orange-800">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">{r.body}</p>
              </div>
              <Link to={r.to} className="btn-ghost shrink-0">Open</Link>
            </li>
          ))}
        </ul>
      )}

      <ul className="space-y-3" aria-label="Announcements">
        {announcements.map((a) => (
          <li key={a.id} className="card">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium">
                {!read.includes(a.id) && <span className="mr-2 inline-block size-2 rounded-full bg-orange-600 align-middle" aria-label="Unread" />}
                {a.title}
              </p>
              <time className="shrink-0 text-xs text-stone-500" dateTime={a.createdAt}>
                {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </time>
            </div>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{a.body}</p>
          </li>
        ))}
        {announcements.length === 0 && <li className="text-stone-500">No announcements yet.</li>}
      </ul>
    </section>
  );
}
