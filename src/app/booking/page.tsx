import { BookingFlow } from '@/components/booking/booking-flow';
import { SERVICES } from '@/lib/types';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-black/5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
            <span className="text-[8px] uppercase tracking-[0.4em] font-black text-muted-foreground">Expérience Privée</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-primary mb-6 tracking-tighter">Réserver un <span className="italic">moment.</span></h1>
          <p className="text-muted-foreground text-base font-light max-w-lg mx-auto leading-relaxed italic">
            Curate your personal journey of recovery. Securing your preferred time in our sanctuary is the first step to restoration.
          </p>
        </header>

        <div className="bg-white p-1 shadow-2xl rounded-[3rem] shadow-black/[0.03]">
          <BookingFlow services={SERVICES} />
        </div>
      </div>
    </div>
  );
}