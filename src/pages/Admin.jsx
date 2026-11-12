import { useState } from 'react';
import RequireAdmin from '../components/RequireAdmin';
import Overview from '../components/admin/Overview';
import Deliveries from '../components/admin/Deliveries';
import Subscribers from '../components/admin/Subscribers';
import Feedback from '../components/admin/Feedback';
import Inbox from '../components/admin/Inbox';
import Announcements from '../components/admin/Announcements';
import Plans from '../components/admin/Plans';
import Menu from '../components/admin/Menu';

export { RequireAdmin };

const SECTIONS = [
  ['Overview', '📊', Overview],
  ["Today's deliveries", '🚚', Deliveries],
  ['Subscribers', '🎓', Subscribers],
  ['Feedback', '⭐', Feedback],
  ['Support inbox', '💬', Inbox],
  ['Announcements', '📣', Announcements],
  ['Plans', '📋', Plans],
  ['Menu', '🍛', Menu],
];

export default function Admin() {
  const [tab, setTab] = useState('Overview');
  const Section = SECTIONS.find(([name]) => name === tab)[2];
  return (
    <section className="py-8 md:flex md:items-start md:gap-6">
      {/* cream sidebar on desktop, scrolling chip row on mobile */}
      <nav
        role="tablist"
        aria-label="Admin sections"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 md:sticky md:top-20 md:mx-0 md:w-60 md:shrink-0 md:flex-col md:gap-1 md:overflow-visible md:rounded-(--radius-card) md:border md:border-stone-200 md:bg-orange-50 md:p-3 md:dark:border-stone-800 md:dark:bg-stone-900"
      >
        <p className="eyebrow hidden px-3 pt-2 pb-1 md:block">Admin</p>
        {SECTIONS.map(([name, icon]) => (
          <button
            key={name}
            role="tab"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            className="chip md:rounded-xl md:border-transparent md:bg-transparent md:px-3 md:py-2.5 md:text-left md:aria-selected:bg-orange-600 md:aria-selected:shadow-sm dark:md:bg-transparent"
          >
            <span aria-hidden="true">{icon}</span> {name}
          </button>
        ))}
      </nav>
      <div className="min-w-0 flex-1">
        <Section />
      </div>
    </section>
  );
}
