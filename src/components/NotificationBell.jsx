import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { selectUser } from '../store/authSlice';
import { markAllRead, selectUnreadCount } from '../store/notificationsSlice';

const ago = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export default function NotificationBell() {
  const user = useSelector(selectUser);
  const unread = useSelector(selectUnreadCount);
  const announcements = useSelector((s) => s.notifications.announcements);
  const read = useSelector((s) => s.notifications.readByEmail[s.auth.currentEmail]) ?? [];
  const latest = announcements.slice(0, 5);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        className="btn-ghost relative !px-2.5"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-orange-600 px-1 text-xs font-semibold text-white ring-2 ring-white dark:ring-stone-950">{unread}</span>
        )}
      </button>
      {open && (
        <div className="card fixed inset-x-4 top-16 z-50 overflow-hidden p-0 shadow-(--shadow-lift) sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
          <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-800/40">
            <h2 className="font-display text-base font-semibold">Announcements</h2>
            <button className="text-xs font-semibold text-orange-600 hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-40" disabled={!unread} onClick={() => dispatch(markAllRead(user.email))}>
              Mark all read
            </button>
          </div>
          {latest.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-3xl" aria-hidden="true">🔔</p>
              <p className="muted mt-1 text-sm">You're all caught up.</p>
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-stone-100 overflow-y-auto dark:divide-stone-800">
              {latest.map((a) => (
                <li key={a.id} className="flex gap-3 px-4 py-3">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${read.includes(a.id) ? 'bg-transparent' : 'bg-orange-600'}`} aria-label={read.includes(a.id) ? undefined : 'Unread'} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="muted line-clamp-2 text-xs">{a.body}</p>
                    <p className="mt-1 text-[11px] text-stone-500">{ago(a.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/notifications" onClick={() => setOpen(false)} className="block border-t border-stone-100 px-4 py-3 text-center text-sm font-semibold text-orange-600 hover:bg-orange-50 dark:border-stone-800 dark:hover:bg-stone-800">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
