'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar as CalendarIcon, 
  Check, 
  Sparkle, 
  ArrowRight,
  Sun,
  Sunrise,
  Moon,
  Info,
  Loader2
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function BookDateTimePage() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);

  // Generate days for the grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust for Monday start (JS getDay is 0 for Sunday)
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const timeSlots = {
    morning: ['09:00', '10:00', '11:30'],
    afternoon: ['13:30', '14:30', '15:45', '17:00'],
    evening: ['18:30', '19:45']
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;
    setIsLoading(true);
    // Simulate prep time
    setTimeout(() => {
      router.push(`/client/book/details?date=${selectedDate}&month=${currentMonth}&year=${currentYear}&time=${selectedTime}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-50/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-amber-50/30 rounded-full blur-[120px]" />
      </div>

      <main className="relative pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-12 bg-neutral-200" />
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-neutral-400">Étape 2 sur 3</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-serif font-bold leading-[1.1] mb-6"
            >
              Choisissez votre<br />
              <span className="text-neutral-400 italic font-light">instant de paix</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-500 font-sans text-xl italic max-w-2xl"
            >
              Sélectionnez la date et l'heure qui s'harmonisent le mieux avec votre emploi du temps.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Calendar Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-7 space-y-12"
            >
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-neutral-200/50 border border-neutral-100">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-neutral-900">{MONTHS[currentMonth]} {currentYear}</h2>
                    <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 mt-2">Disponibilités en temps réel</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="p-4 rounded-full border border-neutral-100 hover:bg-neutral-50 transition-all text-neutral-400 hover:text-neutral-900 group">
                      <ChevronLeft className="w-5 h-5 group-active:-translate-x-1 transition-transform" />
                    </button>
                    <button className="p-4 rounded-full border border-neutral-100 hover:bg-neutral-50 transition-all text-neutral-400 hover:text-neutral-900 group">
                      <ChevronRight className="w-5 h-5 group-active:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-y-8">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="text-center">
                      <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-300">{day}</span>
                    </div>
                  ))}
                  
                  {Array.from({ length: offset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isSelected = selectedDate === day;
                    const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth();
                    
                    return (
                      <div key={day} className="flex justify-center">
                        <button
                          onClick={() => setSelectedDate(day)}
                          className={`
                            relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300
                            ${isSelected 
                              ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-900/20 scale-110 z-10' 
                              : 'hover:bg-neutral-50 text-neutral-600'
                            }
                          `}
                        >
                          <span className="text-lg font-serif font-bold">{day}</span>
                          {isToday && !isSelected && (
                            <div className="absolute bottom-2 w-1 h-1 rounded-full bg-neutral-900" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Section */}
              <AnimatePresence mode="wait">
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-12"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-neutral-100" />
                      <span className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-neutral-300">Horaires disponibles pour le {selectedDate} {MONTHS[currentMonth]}</span>
                      <div className="h-px flex-1 bg-neutral-100" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Matin */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                          <Sunrise className="w-4 h-4 text-amber-500" />
                          <h3 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Matin</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {timeSlots.morning.map(time => (
                            <TimeButton 
                              key={time} 
                              time={time} 
                              selected={selectedTime === time} 
                              onClick={() => setSelectedTime(time)} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Après-midi */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                          <Sun className="w-4 h-4 text-emerald-500" />
                          <h3 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Après-midi</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {timeSlots.afternoon.map(time => (
                            <TimeButton 
                              key={time} 
                              time={time} 
                              selected={selectedTime === time} 
                              onClick={() => setSelectedTime(time)} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Soirée */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                          <Moon className="w-4 h-4 text-indigo-400" />
                          <h3 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-400">Soirée</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {timeSlots.evening.map(time => (
                            <TimeButton 
                              key={time} 
                              time={time} 
                              selected={selectedTime === time} 
                              onClick={() => setSelectedTime(time)} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Reservation Summary Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-5 lg:sticky lg:top-36"
            >
              <div className="bg-neutral-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-neutral-900/20 overflow-hidden relative">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                
                <h2 className="text-3xl font-serif font-bold mb-10 relative z-10">Résumé de votre séance</h2>
                
                <div className="space-y-8 relative z-10">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                      <Sparkle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-white/40 mb-1">Rituel Sélectionné</p>
                      <p className="text-xl font-serif font-bold">Massage aux Bambous</p>
                      <p className="text-sm font-sans text-white/60 mt-1 italic">60 Minutes de restauration</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-white/40 mb-1">Date & Heure</p>
                      {selectedDate ? (
                        <>
                          <p className="text-xl font-serif font-bold">Le {selectedDate} {MONTHS[currentMonth]}</p>
                          <p className="text-sm font-sans text-white/60 mt-1 italic">{selectedTime || 'Heure à définir'}</p>
                        </>
                      ) : (
                        <p className="text-xl font-serif font-bold text-white/20 italic">En attente de sélection...</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-white/40">Total</span>
                      <span className="text-4xl font-serif font-bold">160 CHF</span>
                    </div>
                    
                    <button
                      onClick={handleContinue}
                      disabled={!selectedDate || !selectedTime || isLoading}
                      className={`
                        w-full rounded-full py-6 flex items-center justify-center gap-3 transition-all duration-500
                        ${selectedDate && selectedTime 
                          ? 'bg-white text-neutral-900 hover:bg-neutral-100 shadow-xl shadow-white/10 scale-100 active:scale-95' 
                          : 'bg-white/5 text-white/20 cursor-not-allowed'
                        }
                      `}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em]">Continuer vers les détails</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-8 p-8 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50 flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-emerald-700 mb-1">Sécurité Garantie</p>
                  <p className="text-sm font-sans text-emerald-800/60 leading-relaxed">Annulation gratuite jusqu'à 24h avant la séance. Paiement sécurisé.</p>
                </div>
              </div>

              {/* Help Center */}
              <div className="mt-6 p-8 bg-white rounded-[2rem] border border-neutral-100 shadow-xl shadow-neutral-200/20 flex items-center gap-6 group hover:border-neutral-200 transition-all cursor-pointer">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-neutral-900 transition-colors">
                    <Info className="w-6 h-6" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-300 group-hover:text-neutral-500 transition-colors">Besoin d'aide ?</p>
                  <p className="text-sm font-serif font-bold text-neutral-900 italic">Notre concierge est à votre écoute</p>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-200 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function TimeButton({ time, selected, onClick }: { time: string, selected: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative px-6 py-5 rounded-[1.5rem] border-2 transition-all duration-500 flex items-center justify-between
        ${selected 
          ? 'bg-neutral-900 border-neutral-900 text-white shadow-2xl shadow-neutral-900/20' 
          : 'bg-white border-neutral-50 text-neutral-600 hover:border-neutral-200 hover:shadow-xl hover:shadow-neutral-200/40'
        }
      `}
    >
      <div className="flex items-center gap-4">
        <Clock className={`w-4 h-4 ${selected ? 'text-emerald-400' : 'text-neutral-300 group-hover:text-neutral-500'} transition-colors`} />
        <span className="text-xl font-serif font-bold tracking-tight">{time}</span>
      </div>
      {selected ? (
        <Check className="w-5 h-5 text-emerald-400" />
      ) : (
        <div className="w-2 h-2 rounded-full bg-neutral-100 group-hover:bg-neutral-200 transition-colors" />
      )}
    </button>
  );
}
