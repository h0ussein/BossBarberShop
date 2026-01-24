const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="mb-2 text-lg font-bold tracking-tight text-black">BOSS</h3>
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-black/50">Barbershop</p>
            <p className="text-sm text-black/60">
              Premium grooming experiences with expert barbers who take pride in their craft.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-black">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-sm text-black/60 transition hover:text-black">
                  Home
                </a>
              </li>
              <li>
                <a href="#booking" className="text-sm text-black/60 transition hover:text-black">
                  Book Appointment
                </a>
              </li>
              <li>
                <a href="#services" className="text-sm text-black/60 transition hover:text-black">
                  Services
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-black/60 transition hover:text-black">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-black">Contact</h4>
            <ul className="space-y-2 text-sm text-black/60">
              <li>Mon - Sat: 9:00 AM - 9:00 PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-black/10 pt-6 text-center">
          <p className="text-xs text-black/50">
            © {currentYear} BOSS Barbershop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
