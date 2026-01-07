const Footer = () => {
  return (
    <footer className="bg-[#0b0b0c] border-t border-white/10 py-8">
      <div className="container mx-auto px-8 max-w-[1280px] flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-white/50">
        <span>© {new Date().getFullYear()} Origin. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white">
            Privacy
          </a>
          <a href="#" className="hover:text-white">
            Terms
          </a>
          <a href="#" className="hover:text-white">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


