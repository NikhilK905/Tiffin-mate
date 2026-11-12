import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { selectUser } from '../store/authSlice';
import { markAllRead, selectUnreadCount } from '../store/notificationsSlice';
import { selectSubscription } from '../store/subscriptionSlice';
import { todayISO } from '../lib/subscription';
import { reminders } from '../lib/tracking';

const ICON = { renew: '⏳', due: '💳', paused: '⏸️' };

export default function Notifications() {
  const user = useSelector(selectUser);
  const sub = useSelector(selectSubscription);
  const announcements = useSelector((s) => s.notifications.announcements);
  const read = useSelector((s) => s.notifications.readByEmail[s.auth.currentEmail]) ?? [];
  const unread = useSelector(selectUnreadCount);
  const dispatch = useDispatch();
  const alerts = reminders(sub, todayISO());

  return (
    <section className="mx-auto max-w-2xl py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1 className="page-title mt-1">Notifications</h1>
          <p className="muted mt-2">{unread ? `${unread} unread announcement${unread > 1 ? 's' : ''}` : "You're all caught up."}</p>
        </div>
        <button className="btn-ghost" disabled={!unread} onClick={() => dispatch(markAllRead(user.email))}>Mark all read</button>
      </header>

      {alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="eyebrow mb-3">Needs your attention</h2>
          <ul className="space-y-3">
            {alerts.map((r) => (
              <li key={r.id} className="card flex items-center gap-4 border-orange-300 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/30">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-xl shadow-sm dark:bg-stone-800" aria-hidden="true">{ICON[r.id]}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{r.title}</p>
                  <p className="muted text-sm">{r.body}</p>
                </div>
                <Link to={r.to} className="btn-primary shrink-0">Open</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="eyebrow mb-3">Announcements</h2>
      {announcements.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-5xl" aria-hidden="true">🔔</p>
          <h3 className="mt-3 font-display text-xl font-semibold">Nothing here yet</h3>
          <p className="muted mt-1 text-sm">Announcements from the DabbaDost team will show up here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {announcements.map((a) => {
            const isNew = !read.includes(a.id);
            return (
              <li key={a.id} className="card flex gap-4 p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-orange-100 text-xl dark:bg-orange-900/40" aria-hidden="true">📣</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold">
                      {a.title}
                      {isNew && <span className="badge-brand ml-2 align-middle">New</span>}
                    </p>
                    <time className="shrink-0 text-xs text-stone-500" dateTime={a.createdAt}>
                      {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </time>
                  </div>
                  <p className="muted mt-1 text-sm">{a.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
