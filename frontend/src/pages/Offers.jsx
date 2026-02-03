import { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { dealsAPI } from '../services/api';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await dealsAPI.getAll();
        setOffers(res.data.deals || []);
      } catch {
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  return (
    <div className="space-y-6">
      <SEO 
        title="Special Offers & Deals | Salon Abed Barbershop"
        description="Check out our special offers and promotions at Salon Abed. Get discounts on haircuts, combo deals, and referral bonuses. Save on premium grooming services."
        keywords="barbershop deals, haircut discount, special offers, barber promotion, combo deals, referral bonus, salon offers"
        canonicalUrl="https://salonabed.hair/offers"
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
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
        </div>
      ) : offers.length > 0 ? (
        offers.map((offer) => (
          <section
            key={offer._id}
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
        ))
      ) : (
        <section className="rounded-3xl border border-black/10 bg-white p-6 text-center md:p-8">
          <p className="text-sm text-black/60">No offers at the moment. Check back soon!</p>
        </section>
      )}

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
