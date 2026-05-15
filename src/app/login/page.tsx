"use client";

import Link from "next/link";
import LoginPanel from "@/components/auth/LoginPanel";
import Footer from "@/components/landing/serenity2/Footer";
import Navbar from "@/components/landing/serenity2/Navbar";

export default function LoginPage() {
  return (
    <div className="landing-v2 min-h-screen" style={{ background: "var(--landing-page-bg)" }}>
      <Navbar />

      <main className="pb-24">
        <section className="mx-auto max-w-[1360px] px-6 pb-12 pt-12 md:px-10 md:pb-16 md:pt-16 lg:px-12 lg:pb-20 lg:pt-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_540px] lg:items-start lg:gap-16">
            <div className="space-y-8">
              <span className="landing-type-eyebrow block text-[var(--orange)]">— Connexion</span>
              <h1 className="landing-type-h1 landing-text-high display-tight max-w-[11ch]">
                Un accès propre,
                <br />
                <span className="landing-display-italic landing-text-muted">dans une vraie page.</span>
              </h1>
              <p className="landing-type-body landing-text-body max-w-[42rem]">
                L&apos;accès client et thérapeute a été sorti de la modale pour retrouver une lecture claire,
                une vraie hiérarchie et une colonne de formulaire qui respire.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="landing-surface-card rounded-[1.8rem] p-6">
                  <p className="landing-type-micro text-[var(--orange)]">Clients</p>
                  <p className="landing-type-body landing-text-high mt-4">
                    Recevez votre lien de connexion après réservation et retrouvez vos rendez-vous dans votre espace.
                  </p>
                </div>
                <div className="landing-surface-card rounded-[1.8rem] p-6">
                  <p className="landing-type-micro text-[var(--orange)]">Thérapeute</p>
                  <p className="landing-type-body landing-text-high mt-4">
                    Connexion directe avec e-mail et mot de passe pour accéder au tableau de bord praticien.
                  </p>
                </div>
              </div>

              <Link href="/booking" className="landing-type-micro inline-flex rounded-full bg-[var(--teal-deep)] px-8 py-4 text-white transition-all hover:scale-[1.01]">
                Réserver un soin →
              </Link>
            </div>

            <div className="landing-surface-card rounded-[2.2rem] p-6 md:p-8 lg:p-10">
              <LoginPanel framed={false} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
