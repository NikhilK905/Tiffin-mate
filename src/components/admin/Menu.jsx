import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { saveMenu } from '../../store/catalogSlice';
import { PageHead } from './shared';

export default function Menu() {
  const menu = useSelector((s) => s.catalog.menu);
  const dispatch = useDispatch();
  const [draft, setDraft] = useState(menu);

  const set = (i, k) => (e) => setDraft(draft.map((row, j) => (j === i ? { ...row, [k]: e.target.value } : row)));
  const save = () => {
    if (draft.some((r) => !r.lunch.trim() || !r.dinner.trim())) return toast.error('Fill in lunch and dinner for every day');
    dispatch(saveMenu(draft.map((r) => ({ ...r, lunch: r.lunch.trim(), dinner: r.dinner.trim() }))));
    toast.success('Menu saved');
  };

  return (
    <div>
      <PageHead eyebrow="Menu" title="Weekly menu" hint="Lunch and dinner for each day of the week.">
        <button className="btn-primary" onClick={save}>💾 Save menu</button>
      </PageHead>
      <div className="card divide-y divide-stone-100 p-0 dark:divide-stone-800">
        {draft.map((row, i) => (
          <div key={row.day} className="grid gap-3 p-4 sm:grid-cols-[6rem_1fr_1fr] sm:items-end">
            <p className="font-display text-lg font-semibold sm:pb-2">{row.day}</p>
            <label className="label text-xs">Lunch<input className="input" value={row.lunch} onChange={set(i, 'lunch')} /></label>
            <label className="label text-xs">Dinner<input className="input" value={row.dinner} onChange={set(i, 'dinner')} /></label>
          </div>
        ))}
      </div>
    </div>
  );
}
