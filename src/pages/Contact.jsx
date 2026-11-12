import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addMessage } from '../store/messagesSlice';

const SUBJECTS = ['Delivery issue', 'Billing', 'Food quality', 'General'];
const empty = { name: '', email: '', subject: 'General', message: '' };

const faqs = [
  ['Can I skip a day?', 'Yes. Skip from your dashboard and the day is added to the end of your month.'],
  ['How do I cancel?', 'Cancel any time from your dashboard; you are not billed for the next month.'],
  ['Where do you deliver?', 'Hostels and PGs in our delivery areas, at the gate by 1 pm and 8 pm.'],
  ['Is the food really home-made?', 'Yes, every meal comes from a local home kitchen.'],
];

function validate({ name, email, message }) {
  const e = {};
  if (!name.trim()) e.name = 'Please enter your name.';
  if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Please enter a valid email.';
  if (message.trim().length < 10) e.message = 'Message must be at least 10 characters.';
  return e;
}

export default function Contact() {
  const dispatch = useDispatch();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    dispatch(addMessage({ ...form, email: form.email.trim().toLowerCase() }));
    toast.success('Message sent! We will get back to you soon.');
    setForm(empty);
  };

  const err = (key) => errors[key] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[key]}</p>;

  return (
    <section className="py-10">
      <header>
        <p className="eyebrow">Get in touch</p>
        <h1 className="page-title mt-1">Contact us</h1>
        <p className="muted mt-2">Questions, feedback or a problem with your tiffin? We reply within a day.</p>
      </header>
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {[['✉️', 'hello@dabbadost.example'], ['📞', '+91 90000 00000'], ['📍', 'Sample Nagar, Demo City']].map(([icon, text]) => (
          <li key={text} className="flex items-center gap-3 rounded-2xl bg-turmeric-100 px-4 py-3 text-sm font-medium dark:bg-stone-900">
            <span aria-hidden="true" className="text-xl">{icon}</span>{text}
          </li>
        ))}
      </ul>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <form onSubmit={submit} noValidate className="card space-y-4">
          <div>
            <label htmlFor="name" className="label">Name</label>
            <input id="name" name="name" className="input" value={form.name} onChange={change} aria-invalid={!!errors.name} />
            {err('name')}
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" className="input" value={form.email} onChange={change} aria-invalid={!!errors.email} />
            {err('email')}
          </div>
          <div>
            <label htmlFor="subject" className="label">Subject</label>
            <select id="subject" name="subject" className="input" value={form.subject} onChange={change}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="message" className="label">Message</label>
            <textarea id="message" name="message" rows={5} className="input" value={form.message} onChange={change} aria-invalid={!!errors.message} />
            {err('message')}
          </div>
          <button type="submit" className="btn-primary w-full">Send message</button>
        </form>

        <div>
          <h2 className="font-display text-2xl font-bold">FAQ</h2>
          <div className="mt-4 space-y-3">
            {faqs.map(([q, a]) => (
              <details key={q} className="card py-4">
                <summary className="cursor-pointer font-medium">{q}</summary>
                <p className="muted mt-2 text-sm">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
