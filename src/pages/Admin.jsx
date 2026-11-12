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

const SECTIONS = {
  Overview,
  "Today's deliveries": Deliveries,
  Subscribers,
  Feedback,
  'Support inbox': Inbox,
  Announcements,
  Plans,
  Menu,
};

export default function Admin() {
  const [tab, setTab] = useState('Overview');
  const Section = SECTIONS[tab];
  return (
    <section className="py-12">
      <h1 className="font-display text-3xl font-bold">Admin panel</h1>
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start">
        {/* sidebar on desktop, scrolling tab row on mobile */}
        <nav role="tablist" className="flex gap-2 overflow-x-auto md:w-52 md:shrink-0 md:flex-col md:overflow-visible">
          {Object.keys(SECTIONS).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`shrink-0 whitespace-nowrap md:justify-start ${tab === t ? 'btn-primary' : 'btn-ghost'}`}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          <Section />
        </div>
      </div>
    </section>
  );
}
