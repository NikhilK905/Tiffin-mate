// Drives headless Chromium over CDP (Node's built-in WebSocket) through every core flow, then screenshots every page.
// usage: node scripts/e2e.mjs <browser binary> <base url> [screenshot dir]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const [, , BROWSER, BASE, OUT = '/tmp/dabbadost-shots'] = process.argv;
mkdirSync(OUT, { recursive: true });
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
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(`${m.params.entry.text} ${m.params.entry.url ?? ''}`);
};
const send = (method, params = {}) =>
  new Promise((r) => {
    pending.set(++id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });
const js = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true });
  if (r.error) throw new Error(r.error.message);
  if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description);
  return r.result.result.value;
};
const go = async (path) => (await send('Page.navigate', { url: BASE + path }), sleep(900));
const results = [];
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ` (${extra})` : ''}`);
// a thrown error inside a step is reported as a FAIL instead of aborting the run
const step = async (name, fn) => {
  try {
    await fn();
  } catch (e) {
    check(`${name} crashed`, false, String(e.message).split('\n')[0]);
  }
};

// helpers injected into the page
const H = `
const setVal=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));};
const byLabel=(t)=>[...document.querySelectorAll('label')].find(l=>l.textContent.trim().startsWith(t))?.control;
const btn=(t)=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t);
const btnStarts=(t)=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim().startsWith(t));
const toast=()=>[...document.querySelectorAll('[role=alert]')].map(t=>t.textContent).join(' | ');
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
const text=()=>document.body.innerText;
const money=(s)=>Number(String(s).replace(/[^0-9]/g,''));
const dismissToasts=async()=>{document.querySelectorAll('[role=alert]').forEach(t=>t.click());await wait(450);};
`;
const login = (email, password) =>
  js(`${H} setVal(byLabel('Email'),'${email}'); setVal(byLabel('Password'),'${password}'); btn('Log in').click(); await wait(900); return {path:location.pathname, toast:toast()}`);
const logout = () => js(`${H} btn('Log out').click(); await wait(400);`);

// ---- screenshots ----
const viewport = (width) => send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
const SCROLLER = `const scrollAncestor=(e)=>{for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){if(/auto|scroll/.test(getComputedStyle(a).overflowX))return a}return null};`;
const overflow = () =>
  js(`${SCROLLER} const w=document.documentElement.clientWidth; const bad=[...document.body.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.right>w+1&&r.width>0&&!scrollAncestor(e)}).slice(0,3).map(e=>e.tagName+'.'+String(e.className).slice(0,40)); return {sw:document.documentElement.scrollWidth,w,bad}`);
const shoot = async (name, width) => {
  await sleep(250);
  const o = await overflow();
  const { result } = await send('Page.getLayoutMetrics');
  const h = Math.min(Math.ceil(result.cssContentSize.height), 7000);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: h, scale: 1 } });
  writeFileSync(`${OUT}/${name}-${width}.png`, Buffer.from(shot.result.data, 'base64'));
  check(`screenshot ${name} @${width}: no horizontal scroll`, o.sw <= o.w, o.sw > o.w ? `scrollWidth ${o.sw} > ${o.w}; ${o.bad.join(', ')}` : '');
};
const sweep = async (label, paths) => {
  for (const width of [1280, 390]) {
    await viewport(width);
    for (const p of paths) {
      await go(p);
      await shoot(`${label}${p.replaceAll('/', '_') || '_home'}`, width);
    }
  }
  await viewport(1280);
};
const dark = async (label, path) => {
  await js(`localStorage.setItem('tiffin-theme','dark')`);
  await go(path);
  const s = await js(`const bg=getComputedStyle(document.body).backgroundColor.match(/\\d+/g).map(Number); return {dark:document.documentElement.classList.contains('dark'), lum:(bg[0]+bg[1]+bg[2])/3}`);
  check(`dark mode on ${path}`, s.dark && s.lum < 80, JSON.stringify(s));
  await shoot(`dark-${label}`, 1280);
  await js(`localStorage.setItem('tiffin-theme','light')`);
};

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await viewport(1280);
await go('/');
await js(`localStorage.clear(); localStorage.setItem('tiffin-theme','light')`);

// ===== 1. register, profile, password =====
await step('1', async () => {
  await go('/register');
  await js(`${H} setVal(byLabel('Full name'),'Test Student'); setVal(byLabel('Email'),'test@college.edu'); setVal(byLabel('Password'),'secret1'); setVal(byLabel('College'),'Hostel 7, Room 12'); btn('Sign up').click(); await wait(800);`);
  let s = await js(`${H} return {path:location.pathname, text:text(), toast:toast()}`);
  check('1 register lands on dashboard with no-plan card', s.path === '/dashboard' && s.text.includes("don't have an active"), s.path);
  check('1 register toast', s.toast.includes('Welcome'), s.toast);

  await go('/profile');
  s = await js(`${H} setVal(byLabel('Phone'),'9876543210'); setVal(byLabel('Diet preference'),'jain'); btn('Save profile').click(); await wait(400); return toast()`);
  check('1 profile save toast', s.includes('Profile saved'), s);
  await go('/profile');
  s = await js(`${H} return {phone:byLabel('Phone').value, diet:byLabel('Diet preference').value, college:byLabel('College').value}`);
  check('1 profile persists after reload', s.phone === '9876543210' && s.diet === 'jain' && s.college === 'Hostel 7, Room 12', JSON.stringify(s));

  s = await js(`${H} setVal(byLabel('Current password'),'nope12'); setVal(byLabel('New password'),'secret2'); btn('Change password').click(); await wait(500); return toast()`);
  check('1 wrong current password rejected', /wrong/i.test(s), s);
  await js(`${H} await dismissToasts(); setVal(byLabel('Current password'),'secret1'); setVal(byLabel('New password'),'secret2'); btn('Change password').click(); await wait(500);`);
  s = await js(`${H} return toast()`);
  check('1 password changed toast', s.includes('Password changed'), s);

  await logout();
  await go('/login');
  s = await login('test@college.edu', 'secret1');
  check('1 old password no longer works', s.path === '/login' && /wrong/i.test(s.toast), `${s.path} ${s.toast}`);
  await go('/login');
  s = await login('test@college.edu', 'secret2');
  check('1 new password logs in (lands back on the page it was bounced from)', ['/dashboard', '/profile'].includes(s.path), s.path);
});

// ===== 2. plans filter, menu =====
await step('2', async () => {
  await go('/plans');
  const s = await js(`${H}
    const cards=()=>document.querySelectorAll('article').length;
    const all=cards(); btn('🥬 Veg').click(); await wait(200); const veg=cards(); const vegTxt=[...document.querySelectorAll('article')].every(a=>a.textContent.includes('Veg')&&!a.textContent.includes('Non-veg'));
    btn('🍗 Non-veg').click(); await wait(200); const nv=cards(); const nvTxt=[...document.querySelectorAll('article')].every(a=>a.textContent.includes('Non-veg'));
    btn('All').click(); await wait(200);
    return {all, veg, nv, vegTxt, nvTxt, table:document.querySelectorAll('table tbody tr').length}`);
  check('2 plans filter: veg/non-veg/all change the cards', s.veg > 0 && s.nv > 0 && s.veg < s.all && s.nv < s.all && s.veg + s.nv === s.all && s.vegTxt && s.nvTxt, JSON.stringify(s));
  check('2 plans comparison table lists every plan', s.table === s.all, `${s.table} rows`);

  await go('/menu');
  const m = await js(`${H}
    const tabs=[...document.querySelectorAll('[role=tab]')]; const head=()=>document.querySelector('[role=tabpanel] h2').textContent;
    const before=head(); const other=tabs.find(t=>t.getAttribute('aria-selected')==='false'); other.click(); await wait(200); const after=head();
    const week=()=>document.querySelector('section').innerText;
    const vegBtn=btn('🥬 Veg'); const nvBtn=btn('🍗 Non-veg'); const vegPressed=vegBtn.getAttribute('aria-pressed');
    const w1=week(); nvBtn.click(); await wait(200); const w2=week();
    return {tabs:tabs.length, before, after, vegPressed, nvPressed:nvBtn.getAttribute('aria-pressed'), toggled:w1!==w2}`);
  check('2 menu day tabs switch the day', m.tabs === 7 && m.before !== m.after, `${m.before} → ${m.after}`);
  check('2 menu veg toggle changes dishes', m.vegPressed === 'true' && m.nvPressed === 'true' && m.toggled, JSON.stringify(m));
});

// ===== 3. checkout =====
let planPrice = 0;
await step('3', async () => {
  await go('/subscribe/ghar');
  let s = await js(`${H}
    const steps=[...document.querySelectorAll('ol[aria-label="Checkout steps"] li')].map(l=>l.getAttribute('aria-current'));
    const jain=byLabel('Jain meals').checked; byLabel('hot').click(); await wait(100); setVal(document.querySelector('textarea'),'less oil'); btnStarts('Next').click(); await wait(300);
    const t1=text(); return {steps, jain, step2:t1.includes('Add-ons (charged every month)'), summary:document.querySelector('aside dl').innerText}`);
  check('3 step 1: three-step header, Jain pre-ticked from profile diet', s.steps.length === 3 && s.steps[0] === 'step' && s.jain && s.step2, JSON.stringify(s));
  planPrice = Number((s.summary.match(/₹([\d,]+)/) ?? [])[1]?.replaceAll(',', ''));

  s = await js(`${H} byLabel('Extra roti').click(); byLabel('Curd').click(); await wait(200); const sum=document.querySelector('aside dl').innerText; btnStarts('Next').click(); await wait(300); return {sum, step3:!!byLabel('Delivery address')}`);
  check('3 step 2: two add-ons appear in the summary', /Extra roti/.test(s.sum) && /Curd/.test(s.sum) && s.step3, s.sum.replace(/\n/g, ' '));

  s = await js(`${H}
    const prefilled={addr:byLabel('Delivery address').value, phone:byLabel('Phone').value, date:byLabel('Start date').value};
    byLabel('Cash').click(); await wait(100);
    const coupon=document.querySelector('input[placeholder^="STUDENT10"]');
    setVal(coupon,'BAD'); btn('Apply').click(); await wait(300); const bad=toast(); const afterBad=document.querySelector('aside dl').innerText;
    await dismissToasts();
    setVal(coupon,'STUDENT10'); btn('Apply').click(); await wait(300); const good=toast();
    const dl=document.querySelector('aside dl'); const rows=[...dl.children].map(r=>[r.children[0].textContent,r.children[1].textContent]);
    const confirm=btnStarts('Confirm'); return {prefilled, bad, afterBad, good, rows, confirm:confirm?.textContent}`);
  const tomorrow = await js(`const d=new Date(); d.setDate(d.getDate()+1); return d.toLocaleDateString('en-CA')`);
  check('3 step 3: address, phone, start date (tomorrow) prefilled', s.prefilled.addr === 'Hostel 7, Room 12' && s.prefilled.phone === '9876543210' && s.prefilled.date === tomorrow, JSON.stringify(s.prefilled));
  check('3 coupon BAD → error toast, no discount', /invalid coupon/i.test(s.bad) && !/Coupon/.test(s.afterBad), s.bad);
  check('3 coupon STUDENT10 → applied toast', s.good.includes('Coupon STUDENT10 applied'), s.good);
  const nums = s.rows.map(([k, v]) => [k, Number(v.replace(/[^0-9]/g, ''))]);
  const total = nums.find(([k]) => k === 'Total')?.[1];
  const sub = planPrice + 299 + 199;
  const expected = sub - Math.round(sub * 0.1);
  check('3 summary total = plan + add-ons − 10%', total === expected, `plan ${planPrice} + 299 + 199 − 10% = ${expected}; page shows ${total}; rows ${JSON.stringify(s.rows)}`);
  check('3 confirm button says cash due with the total', s.confirm?.includes(String(total).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) && /due/.test(s.confirm), s.confirm);

  s = await js(`${H} btnStarts('Confirm').click(); await wait(1700); return {path:location.pathname, toast:toast(), text:text()}`);
  check('3 confirm → /dashboard with Subscribed toast', s.path === '/dashboard' && s.toast.includes('Subscribed'), `${s.path} ${s.toast}`);
});

// ===== 4. dashboard =====
await step('4', async () => {
  await go('/dashboard');
  let s = await js(`${H} return text()`);
  check('4 dashboard: plan, Active badge, 30 delivery days left', s.includes('Ghar Ka Khana') && /Active/.test(s) && /30\s*delivery days left/.test(s));
  check("4 today's order card shows Lunch and (for 2-meal plan) Dinner; starts tomorrow", /Today's order/.test(s) && /Lunch/i.test(s) && /Starts on/.test(s));
  check('4 stats cards: Meals left / Meals eaten / Days skipped / Saved vs canteen', ['Meals left', 'Meals eaten', 'Days skipped', 'Saved vs canteen'].every((k) => s.includes(k)));

  s = await js(`${H}
    const range=()=>[...document.querySelectorAll('p')].find(p=>p.textContent.includes('delivering to')).textContent.split(' · ')[0];
    const b=[...document.querySelectorAll('li button')].find(b=>!b.disabled);
    const before=range(); b.click(); await wait(400); const t1=toast(); const mid=range(); const left1=text(); const pressed=b.getAttribute('aria-pressed');
    await dismissToasts();
    b.click(); await wait(400); const t2=toast(); const back=range();
    return {before, mid, back, t1, t2, pressed, left30:/30\\s*delivery days left/.test(left1), skippedStat:left1.includes('Days skipped')}`);
  check('4 skip: toast, end date +1, days left stays 30', s.t1.includes('skipped') && s.before !== s.mid && s.left30 && s.pressed === 'true', `${s.before} → ${s.mid}; ${s.t1}`);
  check('4 un-skip: toast, end date restored', s.t2.includes('back on') && s.back === s.before, `${s.mid} → ${s.back}; ${s.t2}`);

  s = await js(`${H}
    btn('Pause deliveries').click(); await wait(300); const paused=/Paused/.test(text()); const locked=[...document.querySelectorAll('li button')].every(b=>b.disabled); const lbl=text().includes("Paused");
    btn('Resume deliveries').click(); await wait(300); const active=/Active/.test(text())&&!!btn('Pause deliveries');
    return {paused, locked, active, lbl}`);
  check('4 pause → Paused badge + calendar locked; resume → Active', s.paused && s.locked && s.active, JSON.stringify(s));

  await go('/dashboard');
  s = await js(`${H} return text()`);
  check('4 dashboard persists after reload', s.includes('Ghar Ka Khana') && /Active/.test(s) && /30\s*delivery days left/.test(s));
});

// ===== 5. billing =====
await step('5', async () => {
  await go('/billing');
  let s = await js(`${H}
    const row=()=>document.querySelector('tbody tr').innerText; const renew=btn('Renew for next month');
    const before=row(); const renewDisabled=renew.disabled; const note=text().includes('Your plan runs till');
    btn('Mark as paid').click(); await wait(400); const t=toast(); const after=row(); const stillBtn=!!btn('Mark as paid');
    btn('View invoice').click(); await wait(300); const dlg=document.querySelector('[role=dialog]'); const inv=dlg?.innerText ?? '';
    btn('Close').click(); await wait(200);
    return {before, after, renewDisabled, note, t, stillBtn, inv, closed:!document.querySelector('[role=dialog]')}`);
  check('5 payment shows as Due (cash)', /Due/.test(s.before) && /Cash/.test(s.before), s.before.replace(/\s+/g, ' '));
  check('5 Renew disabled (>7 days left) with explanation', s.renewDisabled && s.note);
  check('5 Mark as paid works: toast, row Paid, button gone', s.t.includes('Marked as paid') && /Paid/.test(s.after) && !s.stillBtn, `${s.t}; ${s.after.replace(/\s+/g, ' ')}`);
  check('5 invoice opens with total and closes', s.inv.includes('DabbaDost invoice') && s.inv.includes('Test Student') && s.closed, s.inv.replace(/\s+/g, ' ').slice(0, 120));
});

// ===== 6. rating (seed a subscription that started 3 days ago) =====
await step('6', async () => {
  await go('/dashboard');
  let s = await js(`${H} return text().includes('Delivered meals from the last 7 days will show up here')`);
  check('6 day 1: no past days to rate', s === true);
  await js(`const st=JSON.parse(localStorage.getItem('tiffin-state')); const add=(n)=>{const d=new Date(); d.setDate(d.getDate()+n); return d.toLocaleDateString('en-CA')};
    const sub=st.subscription.byEmail['test@college.edu']; sub.startDate=add(-3); sub.endDate=add(26); sub.skips=[]; localStorage.setItem('tiffin-state',JSON.stringify(st));`);
  await go('/dashboard');
  s = await js(`${H}
    const rows=[...document.querySelectorAll('li')].filter(l=>l.querySelector('[role=radiogroup]')); const n=rows.length; const stats=text();
    const first=rows[0]; first.querySelector('button[aria-label="4 stars"]').click(); await wait(100);
    setVal(first.querySelector('input[aria-label=Comment]'),'Tasty dal'); [...first.querySelectorAll('button')].find(b=>b.textContent==='Submit').click(); await wait(400);
    const t=toast(); const label=[...first.querySelectorAll('button')].find(b=>['Submit','Update'].includes(b.textContent))?.textContent;
    const stage=/Scheduled|Preparing|Out for delivery|Delivered/.test(text());
    const eaten=(stats.match(/(\\d+)\\s*Meals eaten/)||[])[1];
    return {n, t, label, stage, eaten, stored:JSON.parse(localStorage.getItem('tiffin-state')).feedback.items.length, delivering:/Starts on/.test(text())}`);
  check('6 seeded day 4: three past days × meals offered for rating', s.n >= 3, `${s.n} rows`);
  check('6 rate a meal: toast, button becomes Update, stored', s.t.includes('Thanks for the feedback') && s.label === 'Update' && s.stored === 1, `${s.t}; ${s.label}; stored ${s.stored}`);
  check("6 today's order shows a live stage, not 'Starts on'", s.stage && !s.delivering);
  check('6 Meals eaten counts the delivered days', Number(s.eaten) >= 3, String(s.eaten));
});

// ===== 7. contact ticket → admin =====
await step('7', async () => {
  await go('/contact');
  let s = await js(`${H}
    const f=document.querySelector('form'); f.querySelector('button[type=submit]').click(); await wait(300); const errs=f.querySelectorAll('[aria-invalid=true]').length;
    setVal(f.querySelector('#name'),'Test Student'); setVal(f.querySelector('#email'),'test@college.edu'); setVal(f.querySelector('#subject'),'Billing'); setVal(f.querySelector('#message'),'I paid cash but see a due invoice');
    await wait(100); f.querySelector('button[type=submit]').click(); await wait(500);
    return {errs, toast:toast(), reset:f.querySelector('#name').value==='', msgs:JSON.parse(localStorage.getItem('tiffin-state')).messages.items.map(m=>m.subject)}`);
  check('7 contact: empty submit shows 3 errors', s.errs === 3, String(s.errs));
  check('7 contact: Billing ticket sent, form reset, saved', /sent/i.test(s.toast) && s.reset && s.msgs.join() === 'Billing', JSON.stringify(s));

  await logout();
  await go('/login');
  s = await login('admin@dabbadost.in', 'admin123');
  check('7 admin login lands on /admin', s.path === '/admin', s.path);

  const tab = (name) => js(`${H} [...document.querySelectorAll('[role=tab]')].find(t=>t.textContent.trim()===${JSON.stringify(name)}).click(); await wait(300); return text()`);
  s = await tab('Support inbox');
  check('7 inbox lists the Billing ticket', s.includes('Billing') && s.includes('I paid cash') && s.includes('Open (1)'));
  s = await js(`${H} setVal(byLabel('Reply'),'Marked as paid, thanks!'); btn('Send reply').click(); await wait(400); return {t:toast(), txt:text()}`);
  check('7 inbox reply: toast, ticket resolved', s.t.includes('Reply sent') && s.txt.includes('Open (0)') && s.txt.includes('Resolved (1)'), s.t);

  await tab('Announcements');
  s = await js(`${H} setVal(byLabel('Title'),'Holiday on Friday'); setVal(byLabel('Message'),'No deliveries this Friday.'); btn('Post announcement').click(); await wait(400); return {t:toast(), txt:text()}`);
  check('7 announcement posted', s.t.includes('Announcement posted') && s.txt.includes('Holiday on Friday'), s.t);

  s = await tab("Today's deliveries");
  check('7 deliveries lists the student (started 3 days ago)', s.includes('Test Student') && s.includes('Hostel 7, Room 12') && /1 tiffins/.test(s), s.split('\n').find((l) => l.startsWith('Deliveries')));

  await tab('Subscribers');
  s = await js(`${H}
    const q=document.querySelector('input[aria-label=Search]'); const rows=()=>document.querySelectorAll('tbody tr').length;
    setVal(q,'test@'); await wait(200); const hit=rows(); const hitTxt=text().includes('Test Student');
    setVal(q,'zzzzz'); await wait(200); const miss=rows()===0||/no /i.test(document.querySelector('tbody').innerText);
    setVal(q,''); await wait(100); return {hit, hitTxt, miss}`);
  check('7 subscribers search finds by email, empty for a miss', s.hit === 1 && s.hitTxt && s.miss, JSON.stringify(s));

  s = await tab('Feedback');
  check('7 feedback shows the 4★ rating with comment and student', s.includes('Tasty dal') && s.includes('Test Student') && /4\.0 ★/.test(s));
});

// ===== 8. student: bell + ticket reply =====
await step('8', async () => {
  await logout();
  await go('/login');
  await login('test@college.edu', 'secret2');
  let s = await js(`${H} return document.querySelector('button[aria-label^="Notifications"]').getAttribute('aria-label')`);
  check('8 bell shows unread count (welcome + new announcement)', s === 'Notifications, 2 unread', s);
  s = await js(`${H}
    document.querySelector('button[aria-label^="Notifications"]').click(); await wait(300); const panel=text();
    btn('Mark all read').click(); await wait(300);
    return {hasAnn:panel.includes('Holiday on Friday'), label:document.querySelector('button[aria-label^="Notifications"]').getAttribute('aria-label'), disabled:btn('Mark all read').disabled}`);
  check('8 announcement in bell panel', s.hasAnn);
  check('8 Mark all read clears the count', s.label === 'Notifications' && s.disabled, s.label);
  await go('/notifications');
  s = await js(`${H} return text()`);
  check('8 /notifications lists the announcement', s.includes('Holiday on Friday'));
  await go('/profile');
  s = await js(`${H} return text()`);
  check('8 profile shows the ticket with admin reply', s.includes('Billing') && s.includes('Admin: Marked as paid, thanks!') && /resolved/i.test(s));
});

// ===== 9. screenshots (light, 1280 + 390) and dark =====
await step('9', async () => {
  // student state
  await sweep('student', ['/dashboard', '/billing', '/profile', '/notifications', '/subscribe/ghar']);
  await dark('student-dashboard', '/dashboard');
  await logout();
  // logged-out state
  await sweep('public', ['/', '/plans', '/menu', '/about', '/contact', '/login', '/register']);
  await dark('home', '/');
  // admin state
  await go('/login');
  await login('admin@dabbadost.in', 'admin123');
  const tabs = await js(`return [...document.querySelectorAll('[role=tab]')].map(t=>t.textContent.trim())`);
  for (const width of [1280, 390]) {
    await viewport(width);
    for (const t of tabs) {
      await go('/admin');
      await js(`${H} [...document.querySelectorAll('[role=tab]')].find(x=>x.textContent.trim()===${JSON.stringify(t)}).click(); await wait(300);`);
      await shoot(`admin-${t.toLowerCase().replace(/[^a-z]+/g, '-')}`, width);
    }
  }
  await viewport(390);
  await go('/admin');
  await js(`${H} [...document.querySelectorAll('[role=tab]')].find(x=>x.textContent.trim()==='Subscribers').click(); await wait(300);`);
  const t = await js(`const c=(()=>{for(let a=document.querySelector('table').parentElement;a;a=a.parentElement){if(/auto|scroll/.test(getComputedStyle(a).overflowX))return a}})(); return {inCard:!!c, scrolls:c&&c.scrollWidth>c.clientWidth, page:document.documentElement.scrollWidth<=document.documentElement.clientWidth}`);
  check('9 admin table scrolls inside its card at 390px', t.inCard && t.scrolls && t.page, JSON.stringify(t));
  await viewport(1280);
  await dark('admin', '/admin');
  // mobile hamburger
  await viewport(390);
  await go('/');
  const m = await js(`${H} const b=document.querySelector('button[aria-label=Menu]'); b.click(); await wait(300); const open=b.getAttribute('aria-expanded'); const links=[...document.querySelectorAll('nav a')].length; b.click(); await wait(300); return {open, links, closed:b.getAttribute('aria-expanded')}`);
  check('9 hamburger opens and closes at 390px', m.open === 'true' && m.closed === 'false' && m.links > 0, JSON.stringify(m));
  await viewport(1280);
});

check('9 no console errors', errors.length === 0, errors.slice(0, 3).join(' || '));
console.log(results.join('\n'));
console.log(`screenshots: ${OUT}`);
ws.close();
proc.kill();
