import { ShieldCheck, Info, MapPin, Clock } from "lucide-react";

export default function Policies() {
  return (
    <section id="policies" className="relative py-20 md:py-32 bg-white border-t border-foreground/5">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-12 gap-12 lg:gap-24">
          
          {/* Practical Info Column */}
          <div className="col-span-12 lg:col-span-6 space-y-16">
            <div>
              <span className="mono-caption text-[var(--sage-deep)] mb-8 block tracking-[0.2em] uppercase">— Informations Pratiques</span>
              <h2 className="display-tight text-4xl md:text-5xl text-foreground font-serif italic mb-10">
                Préparer votre <br /> venue.
              </h2>
              
              <div className="grid gap-10 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[var(--orange)]">
                    <MapPin size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Lieu</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Chemin de Joinville 26, <br />
                    Alpha Business Center, 4ème étage <br />
                    1216 Cointrin – Genève
                  </p>
                  <p className="text-[10px] text-foreground/40 italic">
                    Séances à domicile possibles sur demande, selon disponibilité.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[var(--orange)]">
                    <Clock size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Horaires</span>
                  </div>
                  <div className="text-sm leading-relaxed text-foreground/70">
                    <p>Lun — Ven : 8h00 – 21h00</p>
                    <p>Sam — Dim : 9h30 – 21h00</p>
                    <p className="mt-2 font-bold text-foreground italic underline decoration-[var(--orange)]/30 underline-offset-4">
                      Uniquement sur rendez-vous
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-[var(--off-black)] p-10 text-background">
              <div className="flex items-center gap-3 text-[var(--neon)] mb-6">
                <Info size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Annulations</span>
              </div>
              <p className="text-lg leading-relaxed mb-6 font-medium">
                Toute annulation ou modification doit être effectuée au minimum 24h à l’avance.
              </p>
              <p className="text-sm text-background/50 leading-relaxed">
                En cas d’annulation tardive ou d’absence, la séance pourra être facturée dans son intégralité.
              </p>
            </div>
          </div>

          {/* Legal / Health Column */}
          <div className="col-span-12 lg:col-span-6 lg:pl-12">
            <div className="h-full rounded-[2.5rem] border border-foreground/5 bg-foreground/[0.02] p-10 md:p-14">
              <span className="mono-caption text-[var(--sage-deep)] mb-8 block tracking-[0.2em] uppercase">— Conditions</span>
              <h3 className="text-2xl font-bold display-tight text-foreground mb-10 flex items-center gap-4">
                <ShieldCheck size={28} className="text-[var(--orange)]" />
                Santé & Éthique
              </h3>

              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-sm font-bold uppercase tracking-widest text-foreground/40">Bien-être & Relaxation</p>
                  <p className="text-base leading-relaxed text-foreground/70">
                    Les prestations proposées sont exclusivement dédiées au bien-être et à la relaxation. Elles ne remplacent en aucun cas un avis ou un traitement médical.
                  </p>
                </div>

                <div className="h-px w-full bg-foreground/5" />

                <div className="space-y-4">
                  <p className="text-sm font-bold uppercase tracking-widest text-foreground/40">Condition Physique</p>
                  <p className="text-base leading-relaxed text-foreground/70">
                    En réservant une séance, vous confirmez être en bonne condition physique et ne pas avoir de contre-indication au massage.
                  </p>
                  <p className="text-sm italic text-foreground/40 font-serif">
                    En cas de doute, n’hésitez pas à demander l’avis de votre médecin.
                  </p>
                </div>
              </div>

              <div className="mt-16 pt-10 border-t border-foreground/5">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[var(--orange)] animate-pulse" />
                  <span className="text-xs font-medium text-foreground/60 tracking-tight">
                    Votre confort et votre intimité sont notre priorité absolue.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
