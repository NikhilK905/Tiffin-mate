import { useSelector } from 'react-redux';
import { Empty, PageHead, Stars, Stat, TableCard, Td, avg, fmt } from './shared';

export default function Feedback() {
  const items = useSelector((s) => s.feedback.items);
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const cards = [
    ['Overall', '⭐', items],
    ['Lunch', '🍛', items.filter((f) => f.meal === 'lunch')],
    ['Dinner', '🌙', items.filter((f) => f.meal === 'dinner')],
  ];

  return (
    <div>
      <PageHead eyebrow="Feedback" title="What students think" hint="Ratings are one per student, per meal, per day." />
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {cards.map(([label, icon, list]) => (
          <Stat key={label} icon={icon} tone="yellow" label={label} value={list.length ? avg(list).toFixed(1) : '—'} hint={`${list.length} ratings`} />
        ))}
      </div>
      <div className="mt-6">
        <TableCard
          cols={['Date', 'Student', 'Meal', 'Rating', 'Comment']}
          min="40rem"
          empty={!sorted.length && <Empty icon="💬" title="No ratings yet" hint="Students rate meals from their dashboard." />}
        >
          {sorted.map((f) => (
            <tr key={f.id}>
              <Td className="whitespace-nowrap">{fmt(f.date)}</Td>
              <Td className="font-medium">{f.name}</Td>
              <Td className="capitalize">{f.meal}</Td>
              <Td><Stars n={f.rating} /></Td>
              <Td className="muted">{f.comment || '—'}</Td>
            </tr>
          ))}
        </TableCard>
      </div>
    </div>
  );
}
