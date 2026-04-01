import { BookingFlow } from '@/components/booking/booking-flow';
import { SERVICES } from '@/lib/types';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background pt-40 pb-40 px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-black/5 rounded-full mb-8">
            <div className="w-2 h-2 rounded-full bg-primary/20" />
            <span className="text-[9px] uppercase tracking-[0.4em] font-black text-muted-foreground">Expérience Privée</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-serif font-medium text-primary mb-8 tracking-tighter">Réserver un <span className="italic">moment.</span></h1>
          <p className="text-muted-foreground text-lg font-light max-w-lg mx-auto leading-relaxed italic">
            Curate your personal journey of recovery. Securing your preferred time in our sanctuary is the first step to restoration.
          </p>
        </header>

        <div className="bg-white p-1 shadow-2xl rounded-[4rem] shadow-black/[0.03]">
          <BookingFlow services={SERVICES} />
        </div>
      </div>
    </div>
  );
}