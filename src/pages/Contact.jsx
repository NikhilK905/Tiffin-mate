import { useState } from 'react';
import { toast } from 'react-toastify';

const empty = { name: '', email: '', message: '' };

const faqs = [
  ['Can I skip a day?', 'Yes. Skip from your dashboard and the day is added to the end of your month.'],
  ['How do I cancel?', 'Cancel any time from your dashboard; you are not billed for the next month.'],
  ['Where do you deliver?', 'Hostels and PGs near our partner campuses, at the gate by 1 pm and 8 pm.'],
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
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      const saved = JSON.parse(localStorage.getItem('tiffin-messages')) || [];
      localStorage.setItem('tiffin-messages', JSON.stringify([...saved, { ...form, sentAt: new Date().toISOString() }]));
    } catch {
      // storage unavailable or corrupt; the toast still confirms the submit
    }
    toast.success('Message sent! We will get back to you soon.');
    setForm(empty);
  };

  return (
    <>
      <h1 className="font-display text-4xl font-bold">Contact us</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <form onSubmit={submit} noValidate className="card space-y-4">
          {[['name', 'Name', 'text'], ['email', 'Email', 'email']].map(([key, label, type]) => (
            <div key={key}>
              <label htmlFor={key} className="label">{label}</label>
              <input id={key} name={key} type={type} className="input" value={form[key]} onChange={change} />
              {errors[key] && <p className="mt-1 text-sm text-red-600">{errors[key]}</p>}
            </div>
          ))}
          <div>
            <label htmlFor="message" className="label">Message</label>
            <textarea id="message" name="message" rows={5} className="input" value={form.message} onChange={change} />
            {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
          </div>
          <button type="submit" className="btn-primary">Send message</button>
        </form>

        <section>
          <h2 className="font-display text-2xl font-bold">FAQ</h2>
          <div className="mt-4 space-y-3">
            {faqs.map(([q, a]) => (
              <details key={q} className="card py-4">
                <summary className="cursor-pointer font-medium">{q}</summary>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
