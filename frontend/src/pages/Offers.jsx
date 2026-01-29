import SEO from '../components/SEO';

const Offers = () => {
  const offers = [
    {
      id: 1,
      title: 'First Visit Discount',
      description: 'Get 20% off your first haircut when you book online.',
      code: 'WELCOME20',
      validUntil: 'Mar 31, 2026',
    },
    {
      id: 2,
      title: 'Combo Deal',
      description: 'Hair + Beard combo for just $30 (save $5).',
      code: 'COMBO5',
      validUntil: 'Feb 28, 2026',
    },
    {
      id: 3,
      title: 'Refer a Friend',
      description: 'Refer a friend and both get $10 off your next visit.',
      code: 'REFER10',
      validUntil: 'Ongoing',
    },
  ];

  return (
    <div className="space-y-6">
      <SEO 
        title="Special Offers & Deals | Salon Abed Barbershop"
        description="Check out our special offers and promotions at Salon Abed. Get discounts on haircuts, combo deals, and referral bonuses. Save on premium grooming services."
        keywords="barbershop deals, haircut discount, special offers, barber promotion, combo deals, referral bonus, salon offers"
        canonicalUrl="https://bossbarbershop.onrender.com/offers"
      />
      {/* Header */}
      <section className="rounded-3xl border border-black/10 bg-black p-6 text-white md:p-8">
        <h2 className="text-[10px] uppercase tracking-[0.35em] text-white/60">Special Offers</h2>
        <h3 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Deals & Promotions</h3>
        <p className="mt-4 text-sm leading-relaxed text-white/70 md:text-base">
          Take advantage of our exclusive offers. Use the codes below when booking.
        </p>
      </section>

      {/* Offers */}
      {offers.map((offer) => (
        <section
          key={offer.id}
          className="rounded-3xl border border-black/10 bg-white p-6 md:p-8"
        >
          <h3 className="text-lg font-semibold text-black">{offer.title}</h3>
          <p className="mt-2 text-sm text-black/60">{offer.description}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-xl border border-dashed border-black/30 bg-black/[0.02] px-4 py-2.5 text-center text-sm font-mono font-semibold tracking-widest text-black">
              {offer.code}
            </div>
            <span className="text-xs text-black/50">Valid until {offer.validUntil}</span>
          </div>
        </section>
      ))}

      {/* Coming Soon */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 text-center md:p-8">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50">Coming Soon</h3>
        <p className="mt-3 text-sm text-black/60 md:text-base">
          Stay tuned for our online store featuring premium grooming products.
        </p>
        <button
          type="button"
          className="mt-4 rounded-full border border-black/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-black/60 transition hover:border-black/40 hover:bg-black/5 hover:text-black"
        >
          Notify Me
        </button>
      </section>
    </div>
  );
};

export default Offers;
