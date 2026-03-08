import { BookingFlow } from '@/components/booking/booking-flow';
import { SERVICES } from '@/lib/types';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-20">
          <span className="text-secondary font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Private Session</span>
          <h1 className="text-6xl font-headline font-light text-primary mb-6 italic">Reserve Your Silence</h1>
          <p className="text-muted-foreground text-lg font-light max-w-lg mx-auto leading-relaxed">
            Curate your personal journey of recovery. Choose your therapy and secure your preferred time.
          </p>
        </header>

        <div className="bg-white p-1 shadow-2xl">
          <BookingFlow services={SERVICES} />
        </div>
      </div>
    </div>
  );
}