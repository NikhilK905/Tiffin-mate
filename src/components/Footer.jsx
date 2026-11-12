import { Link } from 'react-router';

const links = [['Home', '/'], ['Plans', '/plans'], ['Menu', '/menu'], ['About', '/about'], ['Contact', '/contact']];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-stone-200 dark:border-stone-800">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold text-orange-600">DabbaDost</p>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">Home-style tiffin for students, every day.</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold">Quick links</h2>
          <ul className="mt-2 space-y-1 text-sm text-stone-600 dark:text-stone-400">
            {links.map(([label, to]) => (
              <li key={to}><Link to={to} className="hover:text-orange-600">{label}</Link></li>
            ))}
          </ul>
        </nav>
        <address className="text-sm not-italic text-stone-600 dark:text-stone-400">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Contact</h2>
          <p className="mt-2">hello@dabbadost.example</p>
          <p>+91 90000 00000</p>
          <p>12 Example Lane, Sample Nagar, Demo City</p>
        </address>
      </div>
      <p className="border-t border-stone-200 py-4 text-center text-xs text-stone-500 dark:border-stone-800">
        © {new Date().getFullYear()} DabbaDost. A college project; all details are fictional.
      </p>
    </footer>
  );
}
