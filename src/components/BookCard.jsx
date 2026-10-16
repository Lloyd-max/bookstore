import ReserveCounter from './ReserveCounter';

export default function BookCard({ book }) {
  return (
    <article className="flex flex-col overflow-hidden bg-surface border border-customBorder rounded-2xl shadow-[0_4px_15px_rgba(44,41,37,0.08)] hover:shadow-[0_15px_35px_rgba(44,41,37,0.12)] transition-shadow">
      <img src={book.image} alt={book.alt} className="w-full h-auto block" />
      <div className="flex flex-col flex-grow p-4">
        {book.badge && (
          <p className="self-start mb-2 px-2.5 py-0.5 text-xs font-medium text-accentDark border border-accent rounded-md">
            {book.badge}
          </p>
        )}
        <h3 className="text-[1.15rem] font-bold mb-1">{book.title}</h3>
        <p className="text-textLight mb-1">{book.author}</p>
        <p className="font-bold mb-auto">{book.price}</p>
        <ReserveCounter />
      </div>
    </article>
  );
}