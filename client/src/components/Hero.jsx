export default function Hero() {
  return (
    <section className="py-[4.5rem] bg-surface border-b border-customBorder">
      <div className="max-w-[1200px] mx-auto px-5">
        <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[1.2] mb-3 max-w-[18ch] text-customText">
          Good books, chosen by people who read them
        </h1>
        <p className="text-[1.1rem] text-textLight max-w-[55ch] mb-6">
          An independent bookshop with shelves we curate ourselves, a reading chair by the window, and a book club that always has room for one more.
        </p>
        <a href="#staff-picks" className="inline-block px-5 py-2.5 bg-accent text-surface rounded-lg font-medium hover:bg-accentDark transition-colors no-underline">
          See staff picks
        </a>
      </div>
    </section>
  );
}