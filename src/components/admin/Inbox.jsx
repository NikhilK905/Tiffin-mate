import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { replyMessage, setMessageStatus } from '../../store/messagesSlice';
import { Badge, fmt } from './shared';

function Ticket({ m }) {
  const dispatch = useDispatch();
  const [reply, setReply] = useState(m.reply);

  const send = (e) => {
    e.preventDefault();
    if (!reply.trim()) return toast.error('Write a reply first');
    dispatch(replyMessage({ id: m.id, reply: reply.trim() }));
    toast.success('Reply sent, ticket resolved');
  };
  const reopen = () => {
    dispatch(setMessageStatus({ id: m.id, status: 'open' }));
    toast.success('Ticket reopened');
  };

  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="mr-auto font-semibold">{m.subject}</h3>
        <Badge status={m.status} />
      </div>
      <p className="mt-1 text-xs text-stone-500">{m.name} · {m.email} · {fmt(m.createdAt)}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
      {m.status === 'open' ? (
        <form onSubmit={send} className="mt-4 space-y-3">
          <label className="label">Reply<textarea className="input" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} /></label>
          <button className="btn-primary" type="submit">Send reply</button>
        </form>
      ) : (
        <div className="mt-4 rounded-xl bg-stone-100 p-3 text-sm dark:bg-stone-800">
          <p className="text-xs text-stone-500">Your reply</p>
          <p className="whitespace-pre-wrap">{m.reply || 'Marked resolved without a reply.'}</p>
          <button className="btn-ghost mt-3 px-3 py-1.5" onClick={reopen}>Reopen</button>
        </div>
      )}
    </div>
  );
}

export default function Inbox() {
  const items = useSelector((s) => s.messages.items);
  const [tab, setTab] = useState('open');
  const shown = items.filter((m) => m.status === tab);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['open', 'resolved'].map((t) => (
          <button key={t} className={`capitalize ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)}>
            {t} ({items.filter((m) => m.status === t).length})
          </button>
        ))}
      </div>
      {shown.map((m) => <Ticket key={m.id} m={m} />)}
      {!shown.length && <p className="card text-center text-sm text-stone-500">No {tab} messages.</p>}
    </div>
  );
}
