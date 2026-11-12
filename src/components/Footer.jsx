import { Link } from 'react-router';

const links = [['Home', '/'], ['Plans', '/plans'], ['Menu', '/menu'], ['About', '/about'], ['Contact', '/contact']];

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-xl font-bold">🍱 Dabba<span className="text-orange-600">Dost</span></p>
          <p className="muted mt-2 max-w-xs text-sm">Home-style tiffin for students, every day.</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold">Quick links</h2>
          <ul className="muted mt-3 space-y-1.5 text-sm">
            {links.map(([label, to]) => (
              <li key={to}><Link to={to} className="hover:text-orange-600">{label}</Link></li>
            ))}
          </ul>
        </nav>
        <address className="muted text-sm not-italic">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Contact</h2>
          <p className="mt-3">hello@dabbadost.example</p>
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
