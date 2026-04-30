'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function BookDateTimePage() {
  const router = useRouter();

  // Selected state for interactivity
  const [selectedDate, setSelectedDate] = useState<number>(12);
  const [selectedTime, setSelectedTime] = useState<string>('12:00 PM');

  const days = [
    { num: 1 }, { num: 2 }, { num: 3 }, { num: 4 }, { num: 5 }, { num: 6 }, { num: 7 },
    { num: 8 }, { num: 9 }, { num: 10 }, { num: 11 }, { num: 12 }, { num: 13 }, { num: 14 },
    { num: 15 }, { num: 16 }, { num: 17 }, { num: 18 }, { num: 19 }, { num: 20 }, { num: 21 },
    { num: 22 }, { num: 23 }, { num: 24 }, { num: 25 }, { num: 26 }, { num: 27 }, { num: 28 },
    { num: 29 }, { num: 30 }, { num: 31 },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen pb-20">
      {/* TopAppBar */}
      <header className="bg-[#faf9f7]/80 dark:bg-stone-950/80 backdrop-blur-lg border-b border-stone-200/40 dark:border-stone-800/40 shadow-sm sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium tracking-[0.1em] uppercase text-[#435544] dark:text-[#b8ccb6] font-headline">Sanctuary</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a onClick={() => router.push('/client/dashboard')} className="cursor-pointer text-[#747872] dark:text-stone-500 hover:text-[#435544] transition-colors duration-300 font-label text-sm uppercase tracking-wider">Home</a>
          <a className="cursor-pointer text-[#747872] dark:text-stone-500 hover:text-[#435544] transition-colors duration-300 font-label text-sm uppercase tracking-wider">Rituals</a>
          <a className="cursor-pointer text-[#435544] dark:text-[#b8ccb6] font-semibold font-label text-sm uppercase tracking-wider">Bookings</a>
          <a onClick={() => router.push('/client/profil')} className="cursor-pointer text-[#747872] dark:text-stone-500 hover:text-[#435544] transition-colors duration-300 font-label text-sm uppercase tracking-wider">Profile</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-[#435544] dark:text-[#b8ccb6] p-2 hover:bg-stone-100 rounded-full transition-colors">notifications</button>
          <button className="md:hidden material-symbols-outlined text-[#435544]">menu</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Progress Indicator */}
        <nav className="flex items-center justify-center mb-16 max-w-2xl mx-auto">
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <div className="h-[2px] flex-1 bg-primary"></div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-base">check</span>
              </div>
              <div className="h-[2px] flex-1 bg-primary"></div>
            </div>
            <span className="mt-3 text-xs font-label font-semibold text-primary uppercase tracking-widest">Select Treatment</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <div className="h-[2px] flex-1 bg-primary"></div>
              <div className="w-10 h-10 rounded-full ring-4 ring-on-primary-container bg-primary flex items-center justify-center text-white shadow-md">
                <span className="font-headline font-semibold">2</span>
              </div>
              <div className="h-[2px] flex-1 bg-outline-variant"></div>
            </div>
            <span className="mt-3 text-xs font-label font-bold text-primary uppercase tracking-widest">Date & Time</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <div className="h-[2px] flex-1 bg-outline-variant"></div>
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-outline shadow-sm">
                <span className="font-headline font-semibold">3</span>
              </div>
              <div className="h-[2px] flex-1 bg-outline-variant"></div>
            </div>
            <span className="mt-3 text-xs font-label font-medium text-outline uppercase tracking-widest">Details</span>
          </div>
        </nav>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Calendar & Time Section */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Hero Image Card */}
            <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden shadow-sm group">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="A serene, high-end massage therapy room within a luxury wellness sanctuary." 
                src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-8">
                <h1 className="text-white font-headline text-3xl font-light tracking-tight">Schedule Your Sanctuary</h1>
                <p className="text-white/80 font-body text-sm mt-1">Select a space for your personal restoration ritual.</p>
              </div>
            </div>

            {/* Calendar */}
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-8 px-2">
                <div>
                  <h2 className="font-headline text-xl text-primary font-medium">October 2023</h2>
                  <p className="text-xs text-outline font-label uppercase tracking-widest mt-1">Local Time: GMT +02:00</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full border border-outline-variant hover:bg-surface-container transition-colors material-symbols-outlined text-primary">chevron_left</button>
                  <button className="p-2 rounded-full border border-outline-variant hover:bg-surface-container transition-colors material-symbols-outlined text-primary">chevron_right</button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 text-center mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <span key={day} className="text-[10px] font-bold text-outline uppercase tracking-widest py-2">{day}</span>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {/* Padding days */}
                {[25, 26, 27, 28, 29, 30].map(day => (
                  <div key={`prev-${day}`} className="aspect-square flex items-center justify-center text-outline-variant text-sm font-body">{day}</div>
                ))}
                
                {/* Current Month Days */}
                {days.map(day => (
                  <button 
                    key={day.num}
                    onClick={() => setSelectedDate(day.num)}
                    className={`aspect-square flex items-center justify-center rounded-lg transition-all text-sm font-body ${
                      selectedDate === day.num 
                        ? 'bg-primary text-white shadow-md font-bold' 
                        : 'hover:bg-surface-container'
                    }`}
                  >
                    {day.num}
                  </button>
                ))}
              </div>
            </section>

            {/* Time Slot Selection */}
            <section className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary">wb_sunny</span>
                  <h3 className="font-headline text-lg text-on-surface font-medium">Morning</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['09:00 AM', '10:00 AM', '11:30 AM'].map(time => (
                    <button 
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-4 rounded-lg border font-body text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-primary-container/10 border-primary text-primary font-bold shadow-md'
                          : 'border-outline-variant text-on-surface hover:border-primary hover:bg-on-primary-container/20'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                  
                  {/* Selected Time example with loader */}
                  <button 
                    onClick={() => setSelectedTime('12:00 PM')}
                    className={`py-4 rounded-lg font-body text-sm font-medium transition-all ${
                      selectedTime === '12:00 PM'
                        ? 'bg-primary text-white border-none shadow-md'
                        : 'border border-outline-variant text-on-surface hover:border-primary hover:bg-on-primary-container/20'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      12:00 PM 
                      {selectedTime === '12:00 PM' && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary">light_mode</span>
                  <h3 className="font-headline text-lg text-on-surface font-medium">Afternoon</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['01:30 PM', '02:00 PM', '03:30 PM', '04:45 PM'].map(time => (
                    <button 
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-4 rounded-lg border font-body text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-primary text-white border-none shadow-md'
                          : 'border-outline-variant text-on-surface hover:border-primary hover:bg-on-primary-container/20'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary">dark_mode</span>
                  <h3 className="font-headline text-lg text-on-surface font-medium">Evening</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['06:00 PM', '07:15 PM', '08:00 PM'].map(time => (
                    <button 
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-4 rounded-lg border font-body text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-primary text-white border-none shadow-md'
                          : 'border-outline-variant text-on-surface hover:border-primary hover:bg-on-primary-container/20'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                  <button className="py-4 rounded-lg border border-outline-variant opacity-40 cursor-not-allowed font-body text-sm font-medium" disabled>
                    09:30 PM
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Reservation Summary */}
          <aside className="lg:col-span-4 sticky top-28">
            <div className="bg-surface-container p-8 rounded-xl border border-outline-variant/30 space-y-8">
              <h2 className="font-headline text-xl text-primary font-medium">Reservation Summary</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">spa</span>
                  </div>
                  <div>
                    <p className="text-xs font-label text-outline uppercase tracking-widest">Selected Ritual</p>
                    <p className="font-headline font-medium text-on-surface text-lg">Deep Forest Aromatherapy</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/60 text-[10px] font-bold text-primary uppercase tracking-tighter">90 Minutes</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                  <div>
                    <p className="text-xs font-label text-outline uppercase tracking-widest">Date & Time</p>
                    <p className="font-headline font-medium text-on-surface">Thursday, Oct {selectedDate}, 2023</p>
                    <p className="text-on-surface-variant text-sm font-body">{selectedTime}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-on-surface-variant font-body">Ritual Fee</span>
                    <span className="text-on-surface font-semibold">$180.00</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-on-surface-variant font-body">Facility Access</span>
                    <span className="text-on-surface font-semibold">Included</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-outline-variant/50">
                    <span className="text-primary font-headline font-semibold">Total</span>
                    <span className="text-primary font-headline text-xl font-bold">$180.00</span>
                  </div>
                </div>
                
                <button className="w-full mt-6 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-center gap-3 transition-colors hover:bg-primary/10">
                  <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                  <p className="text-xs font-label text-primary uppercase tracking-widest font-semibold">Processing Selection...</p>
                </button>
              </div>

              <p className="text-[11px] text-center text-outline font-label leading-relaxed px-4">
                Selection will be confirmed automatically.<br/>
                Free cancellation up to 24 hours before your ritual. Taxes included.
              </p>
            </div>

            {/* Assistance Card */}
            <div className="mt-6 p-6 rounded-xl border border-outline-variant/20 bg-white/40 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Concierge" 
                  src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" 
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary font-headline">Need assistance?</p>
                <p className="text-xs text-on-surface-variant font-body">Our concierge is online.</p>
              </div>
              <button className="ml-auto material-symbols-outlined text-outline hover:text-primary">chat_bubble</button>
            </div>
          </aside>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-2 pb-6 bg-[#faf9f7]/90 dark:bg-stone-950/90 backdrop-blur-xl border-t border-stone-200/50 dark:border-stone-800/50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50">
        <a onClick={() => router.push('/client/dashboard')} className="flex flex-col items-center justify-center text-[#747872] dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 transition-all rounded-xl px-3 py-1 cursor-pointer">
          <span className="material-symbols-outlined">home_health</span>
          <span className="font-['Manrope'] text-[10px] font-medium tracking-wider uppercase mt-1">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#747872] dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 transition-all rounded-xl px-3 py-1 cursor-pointer">
          <span className="material-symbols-outlined">spa</span>
          <span className="font-['Manrope'] text-[10px] font-medium tracking-wider uppercase mt-1">Rituals</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#435544] dark:text-[#b8ccb6] bg-[#daeed8]/50 dark:bg-[#435544]/20 rounded-xl px-3 py-1 transition-transform duration-200 cursor-pointer">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>calendar_today</span>
          <span className="font-['Manrope'] text-[10px] font-medium tracking-wider uppercase mt-1">Bookings</span>
        </a>
        <a onClick={() => router.push('/client/profil')} className="flex flex-col items-center justify-center text-[#747872] dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 transition-all rounded-xl px-3 py-1 cursor-pointer">
          <span className="material-symbols-outlined">person</span>
          <span className="font-['Manrope'] text-[10px] font-medium tracking-wider uppercase mt-1">Profile</span>
        </a>
      </nav>
    </div>
  );
}
