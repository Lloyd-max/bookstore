export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-surface border-b border-customBorder">
      <div className="max-w-[1200px] mx-auto px-5 py-3 flex flex-wrap items-center justify-between gap-y-2 gap-x-6">
        <a href="#top" className="text-xl font-bold text-accent no-underline">Dog-Ear Books</a>
        <nav aria-label="Main navigation">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 m-0 p-0 list-none">
            <li><a href="#fiction" className="text-textLight hover:text-accent hover:underline">Fiction</a></li>
            <li><a href="#nonfiction" className="text-textLight hover:text-accent hover:underline">Nonfiction</a></li>
            <li><a href="#staff-picks" className="text-textLight hover:text-accent hover:underline">Staff picks</a></li>
            <li><a href="#events" className="text-textLight hover:text-accent hover:underline">Events</a></li>
            <li><a href="#visit" className="text-textLight hover:text-accent hover:underline">Visit</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}