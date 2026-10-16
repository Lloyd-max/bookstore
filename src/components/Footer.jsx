export default function Footer() {
  return (
    <footer id="visit" className="pt-12 pb-6 bg-surface border-t border-customBorder">
      <div className="max-w-[1200px] mx-auto px-5 flex flex-wrap gap-x-16 gap-y-8">
        <div>
          <h2 className="text-[1.2rem] font-bold mb-2">Visit us</h2>
          <p className="text-textLight mb-2">12 Africa Street, Melville, Johannesburg</p>
          <p className="text-textLight mb-2">Tuesday to Saturday, 09:00 to 17:00</p>
        </div>
        <div>
          <h2 className="text-[1.2rem] font-bold mb-2">Get in touch</h2>
          <p className="text-textLight mb-2">hello@dogearbooks.com</p>
          <p className="text-textLight mb-2">011 555 0123</p>
        </div>
      </div>
      <p className="max-w-[1200px] mx-auto px-5 mt-8 text-textLight text-sm">
        &copy; 2026 Dog-Ear Books
      </p>
    </footer>
  );
}