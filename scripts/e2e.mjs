// Drives headless Chromium over CDP (Node's built-in WebSocket) through the main flows.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const [, , BROWSER, BASE] = process.argv;
const proc = spawn(BROWSER, ['--remote-debugging-port=9333', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });
let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  await sleep(200);
  try {
    const list = await (await fetch('http://127.0.0.1:9333/json')).json();
    wsUrl = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {}
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
const errors = [];
ws.onmessage = ({ data }) => {
  const m = JSON.parse(data);
  if (m.id) pending.get(m.id)?.(m), pending.delete(m.id);
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
};
const send = (method, params = {}) =>
  new Promise((r) => {
    pending.set(++id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });
const js = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true });
  if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description);
  return r.result.result.value;
};
const go = async (path) => (await send('Page.navigate', { url: BASE + path }), sleep(900));
const results = [];
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ` (${extra})` : ''}`);

// helpers injected into the page
const H = `
const setVal=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};
const byLabel=(t)=>[...document.querySelectorAll('label')].find(l=>l.textContent.trim().startsWith(t))?.querySelector('input,textarea');
const btn=(t)=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t);
const toast=()=>[...document.querySelectorAll('.Toastify__toast')].map(t=>t.textContent).join(' | ');
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
`;

await send('Page.enable');
await send('Runtime.enable');
await go('/');
await js(`localStorage.clear()`);

// 1. register
await go('/register');
await js(`${H} setVal(byLabel('Full name'),'Test Student'); setVal(byLabel('Email'),'test@college.edu'); setVal(byLabel('Password'),'secret1'); setVal(byLabel('College'),'Hostel 7, Room 12'); btn('Sign up').click(); await wait(800);`);
let s = await js(`${H} return {path:location.pathname, text:document.body.innerText, toast:toast()}`);
check('register lands on dashboard', s.path === '/dashboard' && s.text.includes("don't have an active"), s.path);
check('register toast', s.toast.includes('Welcome'), s.toast);

// 2. subscribe
await go('/subscribe/ghar');
s = await js(`${H} const a=byLabel('Delivery address'); const v=a.value; btn('Confirm subscription').click(); await wait(800); return {v, path:location.pathname, text:document.body.innerText, toast:toast()}`);
check('address prefilled from college', s.v === 'Hostel 7, Room 12', s.v);
check('subscribe → dashboard, 30 days left', s.path === '/dashboard' && /30\s*delivery days left/.test(s.text), s.path);
check('subscribe toast', s.toast.includes('Subscribed'), s.toast);

// 3. skip a day
s = await js(`${H} const range=()=>document.querySelector('h1').parentElement.querySelector('p:nth-of-type(2)').textContent; const before=range(); const b=[...document.querySelectorAll('li button')].find(b=>!b.disabled); b.click(); await wait(400); return {before, after:range(), pressed:b.getAttribute('aria-pressed'), text:document.body.innerText, toast:toast()}`);
check('skip moves end date', s.before !== s.after, `${s.before} → ${s.after}`);
check('skip keeps 30 days left', /30\s*delivery days left/.test(s.text));
check('skip toast + pressed', s.toast.includes('skipped') && s.pressed === 'true', s.toast);

// 4. pause / resume
s = await js(`${H} btn('Pause deliveries').click(); await wait(300); const p=document.body.innerText.includes('Resume deliveries'); const dis=[...document.querySelectorAll('li button')].every(b=>b.disabled); btn('Resume deliveries').click(); await wait(300); return {p, dis, r:!!btn('Pause deliveries')}`);
check('pause then resume', s.p && s.r);
check('calendar locked while paused', s.dis);

// 5. reload persists
await go('/dashboard');
s = await js(`return document.body.innerText`);
check('persists after reload', s.includes('Ghar Ka Khana') && /Active/.test(s) && /30\s*delivery days left/.test(s));

// 6. logout, bad login, admin login
await js(`${H} btn('Log out').click(); await wait(300);`);
await go('/login');
s = await js(`${H} setVal(byLabel('Email'),'test@college.edu'); setVal(byLabel('Password'),'wrong'); btn('Log in').click(); await wait(600); return {path:location.pathname, toast:toast()}`);
check('wrong password rejected', s.path === '/login' && s.toast.includes('Wrong'), s.toast);
await go('/login');
s = await js(`${H} setVal(byLabel('Email'),'admin@dabbadost.in'); setVal(byLabel('Password'),'admin123'); btn('Log in').click(); await wait(900); return {path:location.pathname, text:document.body.innerText}`);
check('admin lands on /admin', s.path === '/admin', s.path);
check('admin sees the student', s.text.includes('test@college.edu') || s.text.includes('Test Student'));
check('navbar shows Admin link', [...s.text.matchAll(/Admin/g)].length > 0);

// 7. contact form
await go('/contact');
s = await js(`${H} const form=document.querySelector('form'); form.querySelector('button[type=submit]').click(); await wait(300); const errs=form.querySelectorAll('.text-red-600').length; setVal(form.querySelector('#name'),'Test'); setVal(form.querySelector('#email'),'t@x.edu'); setVal(form.querySelector('#message'),'Need a Jain option please'); await wait(100); form.querySelector('button[type=submit]').click(); await wait(500); return {errs, toast:toast(), reset: form.querySelector('#name').value==='', saved: JSON.parse(localStorage.getItem('tiffin-messages')||'[]').length}`);
check('contact shows errors when empty', s.errs === 3, String(s.errs));
check('contact submit: toast, reset, saved', /sent|thank/i.test(s.toast) && s.reset && s.saved === 1, JSON.stringify(s));

check('no console errors', errors.length === 0, errors.slice(0, 3).join(' || '));
console.log(results.join('\n'));
ws.close();
proc.kill();
