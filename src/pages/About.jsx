import Photo from '../components/Photo';
import { images } from '../lib/images';

const stats = [['2,000+', 'students fed'], ['12', 'areas served'], ['40+', 'home cooks'], ['4.8★', 'average rating']];
const kitchens = [
  ['Local home kitchens', 'We partner with home cooks near campus who prepare small batches every morning and evening.'],
  ['Packed and tracked', 'Meals are packed in steel tiffins, labelled by plan, and sent out in one delivery round.'],
  ['Delivered hot', 'Riders reach your hostel or PG gate by 1 pm for lunch and 8 pm for dinner.'],
];

const team = ['Lucky Singh', 'Ankit Yadav', 'Nikhil Kumar'];

export default function About() {
  return (
    <section className="py-10">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="eyebrow">About us</p>
          <h1 className="page-title mt-1">Food that feels like home</h1>
          <h2 className="mt-6 font-display text-xl font-bold">Our mission</h2>
          <p className="muted mt-2">
            Students should not have to choose between canteen food and skipping meals. TiffinMate brings affordable,
            home-style tiffin to your door on a simple monthly plan.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-turmeric-100 p-3 text-center dark:bg-stone-900">
                <dt className="font-display text-2xl font-bold">{v}</dt>
                <dd className="text-xs text-stone-600 dark:text-stone-400">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Photo image={images.kitchen} className="h-64 w-full rounded-3xl shadow-(--shadow-lift) sm:h-80" />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">How our kitchens work</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {kitchens.map(([title, body]) => (
            <div key={title} className="card card-hover">
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="muted mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">Team</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {team.map((name) => (
            <div key={name} className="card card-hover text-center">
              <h3 className="font-semibold">{name}</h3>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
