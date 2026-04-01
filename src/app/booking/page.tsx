import { BookingFlow } from '@/components/booking/booking-flow';
import { SERVICES } from '@/lib/types';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16 md:pt-32 md:pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-black/5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-muted-foreground">Expérience Privée</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-primary mb-4 md:mb-6 tracking-tighter">Réserver un <span className="italic">moment.</span></h1>
          <p className="text-sm md:text-base text-muted-foreground font-light max-w-lg mx-auto leading-relaxed italic px-4">
            Curate your personal journey of recovery. Securing your preferred time in our sanctuary is the first step to restoration.
          </p>
        </header>

        <div className="bg-white p-1 shadow-2xl rounded-[2.5rem] md:rounded-[3rem] shadow-black/[0.03]">
          <BookingFlow services={SERVICES} />
        </div>
      </div>
    </div>
  );
}
