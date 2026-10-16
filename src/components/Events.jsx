export default function Events() {
  const eventsList = [
    {
      day: '17',
      month: 'Oct',
      title: 'Reading: Ana Mirelles',
      description: 'The author reads from The Quiet Harbour, followed by questions. 18:30 in the shop.',
    },
    {
      day: '24',
      month: 'Oct',
      title: 'Fiction book club',
      description: 'This month we are discussing Salt and Ash. New members are welcome. 17:00.',
    },
    {
      day: '07',
      month: 'Nov',
      title: 'Nonfiction morning',
      description: 'Bring a book you could not stop talking about and swap it for one of ours. 10:00.',
    },
  ];

  return (
    <section id="events" className="py-14 bg-surface-dark text-background">
      <div className="max-w-[1200px] mx-auto px-5">
        <h2 className="text-[clamp(1.6rem,4vw,2.2rem)] font-bold mb-6">Upcoming events</h2>
        <ul className="grid gap-4 md:grid-cols-3 m-0 p-0 list-none">
          {eventsList.map((event, index) => (
            <li key={index} className="flex flex-col md:flex-row items-start gap-5 p-5 border border-textLight rounded-2xl">
              <div className="flex flex-col items-center shrink-0 min-w-[4rem] p-2 bg-accent text-surface rounded-lg">
                <span className="text-2xl font-bold leading-none">{event.day}</span>
                <span className="text-sm">{event.month}</span>
              </div>
              <div>
                <h3 className="text-[1.15rem] font-bold mb-1">{event.title}</h3>
                <p className="m-0 text-customBorder text-sm">{event.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}