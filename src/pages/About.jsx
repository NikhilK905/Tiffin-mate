const kitchens = [
  ['Local home kitchens', 'We partner with home cooks near campus who prepare small batches every morning and evening.'],
  ['Packed and tracked', 'Meals are packed in steel tiffins, labelled by plan, and sent out in one delivery round.'],
  ['Delivered hot', 'Riders reach your hostel or PG gate by 1 pm for lunch and 8 pm for dinner.'],
];

const team = ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Project Lead'];

export default function About() {
  return (
    <section className="py-12">
      <h1 className="section-title">About DabbaDost</h1>

      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">Our mission</h2>
        <p className="muted mt-2 max-w-2xl">
          Students should not have to choose between canteen food and skipping meals. DabbaDost brings affordable,
          home-style tiffin to your door on a simple monthly plan.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">How our kitchens work</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {kitchens.map(([title, body]) => (
            <div key={title} className="card card-hover">
              <h3 className="font-semibold">{title}</h3>
              <p className="muted mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">Team</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((role, i) => (
            <div key={role} className="card card-hover text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 font-display text-2xl font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                {String.fromCharCode(65 + i)}
              </div>
              <h3 className="mt-3 font-semibold">Team Member {i + 1}</h3>
              <p className="text-sm text-stone-500">{role}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
