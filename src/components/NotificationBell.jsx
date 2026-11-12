import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { selectUser } from '../store/authSlice';
import { markAllRead, selectUnreadCount } from '../store/notificationsSlice';

export default function NotificationBell() {
  const user = useSelector(selectUser);
  const unread = useSelector(selectUnreadCount);
  const latest = useSelector((s) => s.notifications.announcements.slice(0, 5));
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
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-orange-600 px-1 text-xs font-semibold text-white">{unread}</span>
        )}
      </button>
      {open && (
        <div className="card absolute right-0 z-50 mt-2 w-80 max-w-[90vw] space-y-3 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Announcements</h2>
            <button className="text-xs font-medium text-orange-600 hover:underline disabled:opacity-40" disabled={!unread} onClick={() => dispatch(markAllRead(user.email))}>
              Mark all read
            </button>
          </div>
          {latest.length === 0 && <p className="text-sm text-stone-500">Nothing new.</p>}
          <ul className="space-y-3">
            {latest.map((a) => (
              <li key={a.id}>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-stone-600 dark:text-stone-400">{a.body}</p>
              </li>
            ))}
          </ul>
          <Link to="/notifications" onClick={() => setOpen(false)} className="block text-sm font-medium text-orange-600 hover:underline">
            View all →
          </Link>
        </div>
      )}
    </div>
  );
}
