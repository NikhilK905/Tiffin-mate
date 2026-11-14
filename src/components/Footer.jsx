import { Link } from 'react-router';

const links = [['Home', '/'], ['Plans', '/plans'], ['Menu', '/menu'], ['About', '/about'], ['Contact', '/contact']];

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 dark:border-t dark:border-stone-800 dark:bg-stone-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="flex items-center gap-2 font-display text-xl font-bold text-white">
            <span aria-hidden="true" className="text-2xl">🍱</span>
            <span>Tiffin<span className="text-turmeric-400">Mate</span></span>
          </p>
          <p className="mt-3 max-w-xs text-sm">Home-style tiffin for students, every day. Fresh from local kitchens to your hostel gate.</p>
          <p className="mt-4 flex gap-2 text-xl" aria-hidden="true">🍛 🥗 🍚 🫓</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold text-white">Quick links</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {links.map(([label, to]) => (
              <li key={to}><Link to={to} className="hover:text-turmeric-400">{label}</Link></li>
            ))}
          </ul>
        </nav>
        <address className="text-sm not-italic">
          <h2 className="text-sm font-semibold text-white">Contact</h2>
          <p className="mt-3">✉️ hello@tiffinmate.example</p>
          <p className="mt-1">📞 +91 90000 00000</p>
          <p className="mt-1">📍 12 Example Lane, Sample Nagar, Demo City</p>
        </address>
      </div>
      <p className="border-t border-stone-800 py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} TiffinMate. A college project; all details are fictional.
      </p>
    </footer>
  );
}
