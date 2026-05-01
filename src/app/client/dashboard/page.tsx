import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Bell, 
  Leaf, 
  Calendar, 
  Star, 
  History, 
  FileText, 
  Home, 
  Sparkles, 
  HeartHandshake, 
  Headset,
  Edit2
} from 'lucide-react';

export default function ClientDashboardPage() {
  return (
    <div className="bg-background text-on-background min-h-screen pb-24 md:pb-0">
      {/* TopAppBar */}
      <header className="absolute top-0 left-0 bg-[#faf9f7]/80 dark:bg-[#1a1c1b]/80 backdrop-blur-md border-b border-[#efeeec] dark:border-[#434842] docked full-width z-50 shadow-sm opacity-40">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <Link href="/">
            <h1 className="text-xl font-normal tracking-wide text-[#435544] dark:text-[#b8ccb6] font-['Public_Sans']">
              Serenity Relax Therapy
            </h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[#435544] font-semibold hover:text-[#5b6d5b] transition-colors font-body text-sm">
              Home
            </Link>
            <Link href="/client/rituals" className="text-[#747872] hover:text-[#5b6d5b] transition-colors font-body text-sm">
              Rituals
            </Link>
            <Link href="#" className="text-[#747872] hover:text-[#5b6d5b] transition-colors font-body text-sm">
              Sanctuary
            </Link>
            <Link href="#" className="text-[#747872] hover:text-[#5b6d5b] transition-colors font-body text-sm">
              Concierge
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="text-[#435544] hover:text-[#5b6d5b] transition-transform scale-95 active:scale-100">
              <Bell className="w-6 h-6" />
            </button>
            <button className="text-[#435544] hover:text-[#5b6d5b] transition-transform scale-95 active:scale-100">
              <Leaf className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant relative">
              <Image 
                alt="Client profile avatar" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDXvIu383AJ8s2aD03mQo1e4K_FgMt1Tg9KPaVhOKsre6Dchzlxk7ZFvyQP9dDGYXyrZuUZMWA-8vaJC9GkC0xL-5jbpsmwuLxYNV8_PxV2oUkQt086w4fhkxhrNJGEJrFIVJVuPdLSp7BvPVx3U7KbauH6U0zqAs1U_83Wm6DfOJb0xRrHYOFw81pts5hNVMFWgU3-6ZgHIQt2Nja8D4qmRTwMHe-jndGLOth735adq9QKu93CsWEH3BjPVkowWgG9cgHw1V1tSo"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-12 space-y-12">
        {/* Welcome Hero */}
        <section className="relative overflow-hidden rounded-[2rem] h-[320px] flex flex-col justify-end p-12 group shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          <div className="absolute inset-0 z-0">
            <Image 
              alt="Sanctuary atmosphere" 
              className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuWqT9s1RIarAvOvso-lqbU2ODCmhtOfOcSPEZANLoCCGQaxxZkcEIKQxUh8wzAq1GxW8wbY8SRfpoGOpCFxiSRxjNPWDLW53O9-qqNsA0w3CVOKOMErzYB_rSvjBzpSJSNcPzzwC5aaJVfVVcBy15rGUsWnIqFU9kYVU-4ZovhvANz0N4_in7ZDS4WdbnPj1DMjni8AFOhy_PMM5xvp4xzwV_9P4avDsCVheemiJX8hh9sN6-IwqZhofGqfdKv6PLYEXcCNMfLc4"
              fill
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c1b]/60 to-transparent"></div>
          </div>
          <div className="relative z-10 space-y-2">
            <h2 className="text-white font-display text-4xl md:text-5xl font-light tracking-tight">Welcome back, Alexandra</h2>
            <p className="text-white/80 font-body text-lg">Your next moment of restoration awaits.</p>
          </div>
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-10">
            {/* Upcoming Rituals */}
            <div className="bg-surface-container-low rounded-[1.5rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-headline text-xl text-primary">Upcoming Rituals</h3>
                <span className="text-primary-container">
                  <Calendar className="w-6 h-6" />
                </span>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center gap-6">
                <div className="bg-primary-fixed w-16 h-16 rounded-xl flex flex-col items-center justify-center text-on-primary-fixed">
                  <span className="text-xs font-bold uppercase tracking-wider">Oct</span>
                  <span className="text-2xl font-bold">24</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-headline text-lg font-medium">Signature Serenity Massage</h4>
                  <p className="text-outline text-sm font-body">Thursday • 2:30 PM • 90 Minutes</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-5 py-2.5 rounded-full border border-outline text-outline font-label text-xs hover:bg-surface-container transition-colors">Reschedule</button>
                  <button className="px-5 py-2.5 rounded-full bg-primary-container text-on-primary font-label text-xs hover:opacity-90 transition-opacity">Cancel</button>
                </div>
              </div>
            </div>

            {/* Sanctuary Status (Loyalty) */}
            <div className="bg-surface-container-low rounded-[1.5rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-8 items-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-outline-variant/30" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-primary-container" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="66" strokeWidth="8"></circle>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-headline text-2xl font-bold text-primary">8,450</span>
                  <span className="font-label text-[10px] uppercase tracking-widest text-outline">Points</span>
                </div>
              </div>
              <div className="space-y-4 text-center md:text-left flex-grow">
                <div className="space-y-1">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-secondary text-sm">
                      <Star className="w-5 h-5 fill-current" />
                    </span>
                    <h3 className="font-headline text-xl text-primary">Elite Tier Status</h3>
                  </div>
                  <p className="text-outline font-body text-sm">You are 1,550 points away from the 'Serenity Master' tier.</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-label uppercase rounded-full">Priority Booking</span>
                  <span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-label uppercase rounded-full">Monthly Complimentary Ritual</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-10">
            {/* Past Sessions */}
            <div className="bg-surface-container-high rounded-[1.5rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline text-xl text-primary">Past Sessions</h3>
                <button className="text-primary text-xs font-label uppercase tracking-widest border-b border-primary/20 hover:border-primary">View All</button>
              </div>
              <div className="space-y-6">
                {/* Session 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30">
                    <HeartHandshake className="text-primary w-5 h-5" />
                  </div>
                  <div className="flex-grow pb-4 border-b border-outline-variant/20">
                    <div className="flex justify-between">
                      <h4 className="font-body font-bold text-on-surface">Deep Tissue Recovery</h4>
                      <span className="text-outline text-xs">Sep 12</span>
                    </div>
                    <p className="text-outline text-sm mt-1">Therapist: Elena Vance</p>
                    <button className="mt-2 flex items-center gap-1 text-primary-container text-xs font-semibold">
                      <Edit2 className="w-3 h-3" /> Rebook
                    </button>
                  </div>
                </div>
                {/* Session 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30">
                    <Leaf className="text-primary w-5 h-5" />
                  </div>
                  <div className="flex-grow pb-4 border-b border-outline-variant/20">
                    <div className="flex justify-between">
                      <h4 className="font-body font-bold text-on-surface">Aromatherapy Session</h4>
                      <span className="text-outline text-xs">Aug 28</span>
                    </div>
                    <p className="text-outline text-sm mt-1">Therapist: Julian Reed</p>
                    <button className="mt-2 flex items-center gap-1 text-primary-container text-xs font-semibold">
                      <Edit2 className="w-3 h-3" /> Rebook
                    </button>
                  </div>
                </div>
                {/* Session 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30">
                    <Sparkles className="text-primary w-5 h-5" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h4 className="font-body font-bold text-on-surface">Swedish Serenity</h4>
                      <span className="text-outline text-xs">Aug 05</span>
                    </div>
                    <p className="text-outline text-sm mt-1">Therapist: Elena Vance</p>
                    <button className="mt-2 flex items-center gap-1 text-primary-container text-xs font-semibold">
                      <Edit2 className="w-3 h-3" /> Rebook
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Invoices Table */}
        <section className="bg-surface-container rounded-[1.5rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <h3 className="font-headline text-xl text-primary mb-8">My Invoices</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b border-outline-variant/40">
                  <th className="pb-4 font-label text-[10px] uppercase tracking-widest text-outline">Date</th>
                  <th className="pb-4 font-label text-[10px] uppercase tracking-widest text-outline">Reference</th>
                  <th className="pb-4 font-label text-[10px] uppercase tracking-widest text-outline">Session / Ritual</th>
                  <th className="pb-4 font-label text-[10px] uppercase tracking-widest text-outline">Amount</th>
                  <th className="pb-4 font-label text-[10px] uppercase tracking-widest text-outline text-right">Action</th>
                </tr>
              </thead>
              <tbody className="font-body text-sm divide-y divide-outline-variant/20">
                <tr className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-5 text-on-surface">Oct 24, 2023</td>
                  <td className="py-5 text-outline">INV-2023-084</td>
                  <td className="py-5 text-on-surface">
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Signature Serenity Massage</span>
                      <button className="text-primary-container text-[10px] font-bold uppercase tracking-wider text-left flex items-center gap-1 hover:underline mt-1">
                        <History className="w-3 h-3" /> View Session
                      </button>
                    </div>
                  </td>
                  <td className="py-5 font-bold text-primary">$185.00</td>
                  <td className="py-5 text-right">
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-primary-container text-xs font-bold hover:bg-white transition-all">
                      <FileText className="w-4 h-4" /> Download PDF
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-5 text-on-surface">Sep 12, 2023</td>
                  <td className="py-5 text-outline">INV-2023-071</td>
                  <td className="py-5 text-on-surface">
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Deep Tissue Recovery</span>
                      <button className="text-primary-container text-[10px] font-bold uppercase tracking-wider text-left flex items-center gap-1 hover:underline mt-1">
                        <History className="w-3 h-3" /> View Session
                      </button>
                    </div>
                  </td>
                  <td className="py-5 font-bold text-primary">$160.00</td>
                  <td className="py-5 text-right">
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-primary-container text-xs font-bold hover:bg-white transition-all">
                      <FileText className="w-4 h-4" /> Download PDF
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-5 text-on-surface">Aug 28, 2023</td>
                  <td className="py-5 text-outline">INV-2023-062</td>
                  <td className="py-5 text-on-surface">
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">Aromatherapy Session</span>
                      <button className="text-primary-container text-[10px] font-bold uppercase tracking-wider text-left flex items-center gap-1 hover:underline mt-1">
                        <History className="w-3 h-3" /> View Session
                      </button>
                    </div>
                  </td>
                  <td className="py-5 font-bold text-primary">$145.00</td>
                  <td className="py-5 text-right">
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-primary-container text-xs font-bold hover:bg-white transition-all">
                      <FileText className="w-4 h-4" /> Download PDF
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#faf9f7] dark:bg-[#1a1c1b] rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-50 border-t border-[#efeeec] dark:border-[#434842]">
        <Link href="/" className="flex flex-col items-center justify-center bg-[#5b6d5b] text-[#ffffff] rounded-xl px-4 py-1.5 transition-all duration-300 ease-out active:scale-98">
          <Home className="w-6 h-6" />
          <span className="font-['Manrope'] text-[10px] font-medium tracking-wider uppercase mt-1">Home</span>
        </Link>
        <Link href="/client/rituals" className="flex flex-col items-center justify-center text-[#747872] px-4 py-1.5 hover:bg-[#f4f3f1] dark:hover:bg-[#2f3130] rounded-xl transition-all duration-300 ease-out active:scale-98">
          <Sparkles className="w-6 h-6" />
          <span className="font-['Manrope'] text-[10px] font-medium tracking-wider uppercase mt-1">Rituals</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-[#747872] px-4 py-1.5 hover:bg-[#f4f3f1] dark:hover:bg-[#2f3130] rounded-xl transition-all duration-300 ease-out active:scale-98">
          <Star className="w-6 h-6" />
          <span className="font-['Manrope'] text-[10px] font-medium tracking-wider uppercase mt-1">Sanctuary</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-[#747872] px-4 py-1.5 hover:bg-[#f4f3f1] dark:hover:bg-[#2f3130] rounded-xl transition-all duration-300 ease-out active:scale-98">
          <Headset className="w-6 h-6" />
          <span className="font-['Manrope'] text-[10px] font-medium tracking-wider uppercase mt-1">Concierge</span>
        </Link>
      </nav>
    </div>
  );
}
