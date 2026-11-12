import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { saveMenu } from '../../store/catalogSlice';

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
    <div className="card space-y-4">
      {draft.map((row, i) => (
        <div key={row.day} className="grid gap-3 sm:grid-cols-[7rem_1fr_1fr] sm:items-end">
          <p className="font-semibold sm:pb-2.5">{row.day}</p>
          <label className="label">Lunch<input className="input" value={row.lunch} onChange={set(i, 'lunch')} /></label>
          <label className="label">Dinner<input className="input" value={row.dinner} onChange={set(i, 'dinner')} /></label>
        </div>
      ))}
      <button className="btn-primary" onClick={save}>Save menu</button>
    </div>
  );
}
