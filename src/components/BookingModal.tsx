"use client";

import React, { useState, useEffect } from "react";
import { useBooking } from "@/context/BookingContext";

// Duplicated simple icon component for the modal if needed, or import from somewhere.
// Let's assume we can copy it or we'll just redefine the small ones we need here.
function Icon({ name, size = 24, strokeWidth = 2 }: any) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "close" && (
        <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
      )}
      {name === "chevron-left" && <polyline points="15 18 9 12 15 6"></polyline>}
      {name === "chevron-right" && <polyline points="9 18 15 12 9 6"></polyline>}
      {name === "user" && (
        <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></>
      )}
      {name === "map-pin" && (
        <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></>
      )}
      {name === "check" && <polyline points="20 6 9 17 4 12"></polyline>}
    </svg>
  );
}

const TIME_SLOTS = [
  "09:00", "10:30", "12:00",
  "14:00", "15:30", "17:00",
  "18:30"
];

export function BookingModal() {
  const { 
    isModalOpen, 
    closeModal, 
    selectedService: service, 
    step, 
    setStep, 
    bookingData, 
    updateBookingData, 
    submitBooking, 
    isSubmitting, 
    error 
  } = useBooking();
  
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  if (!isModalOpen || !service) return null;

  const getWeekInfo = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff + weekOffset * 7);

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return {
        fullDate: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
        dayNum: date.getDate(),
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0)),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      };
    });

    const midWeek = new Date(startOfWeek);
    midWeek.setDate(startOfWeek.getDate() + 3);
    const monthLabel = midWeek.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

    return { days, monthLabel };
  };

  const { days, monthLabel } = getWeekInfo();
  
  // Refined validation
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => phone.length >= 8;
  const canContinueInfo = Boolean(
    bookingData.firstName.trim() && 
    bookingData.lastName.trim() && 
    isValidPhone(bookingData.phone.trim()) && 
    isValidEmail(bookingData.email.trim())
  );
  
  const formattedDate = bookingData.date ? new Date(bookingData.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "";

  const selectDate = (date: string) => {
    updateBookingData("date", date);
    updateBookingData("time", "");
  };

  const selectTime = (time: string) => {
    updateBookingData("time", time);
    window.setTimeout(() => setStep(2), 180);
  };

  return (
    <div className="srt-modal-overlay" role="presentation">
      <button className="srt-modal-backdrop" onClick={closeModal} aria-label="Fermer" type="button" />
      <div className="srt-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <div className="srt-modal-header">
          <div>
            <p className="srt-modal-label">Réservation</p>
            <h3 id="booking-title" className="srt-modal-title">{service.title}</h3>
            <p className="srt-modal-subtitle">{service.price} · {service.duration}</p>
          </div>
          <button className="srt-close-btn" onClick={closeModal} aria-label="Fermer la réservation" type="button">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="srt-modal-body">
          {error && (
            <div style={{ padding: "12px", marginBottom: "16px", borderRadius: "8px", background: "#fee2e2", color: "#b91c1c", fontSize: "12px" }}>
              {error}
            </div>
          )}
          
          {step < 4 && (
            <div className="srt-step-bars" aria-hidden="true">
              {[1, 2, 3].map((item) => (
                <span key={item} className={`srt-step-bar ${step >= item ? "active" : ""}`} />
              ))}
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="srt-week-head">
                <span className="srt-month">{monthLabel}</span>
                <div className="srt-week-controls">
                  <button className="srt-mini-btn" onClick={() => setWeekOffset((value) => value - 1)} type="button" aria-label="Semaine précédente">
                    <Icon name="chevron-left" size={12} />
                  </button>
                  <button className="srt-mini-btn" onClick={() => setWeekOffset((value) => value + 1)} type="button" aria-label="Semaine suivante">
                    <Icon name="chevron-right" size={12} />
                  </button>
                </div>
              </div>

              <div className="srt-week-days">
                {days.map((day) => (
                  <button
                    key={day.fullDate}
                    disabled={day.isPast || day.isWeekend}
                    onClick={() => selectDate(day.fullDate)}
                    className={`srt-day-btn ${bookingData.date === day.fullDate ? "active" : ""}`}
                    type="button"
                  >
                    <span className="srt-day-name">{day.dayName}</span>
                    <span className="srt-day-num">{day.dayNum}</span>
                  </button>
                ))}
              </div>

              {bookingData.date && (
                <div className="srt-slots">
                  <span className="srt-slots-title">Horaires disponibles</span>
                  <div className="srt-time-grid">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => selectTime(slot)}
                        className={`srt-time-btn ${bookingData.time === slot ? "active" : ""}`}
                        type="button"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="srt-form-title"><Icon name="user" size={12} /> Vos informations</div>
              <div className="srt-form-grid">
                <input className="srt-input" value={bookingData.firstName} onChange={(event) => updateBookingData("firstName", event.target.value)} placeholder="Prénom *" />
                <input className="srt-input" value={bookingData.lastName} onChange={(event) => updateBookingData("lastName", event.target.value)} placeholder="Nom *" />
                <div className="srt-phone-row">
                  <select className="srt-select" value={bookingData.phonePrefix} onChange={(event) => updateBookingData("phonePrefix", event.target.value)}>
                    <option value="CH">CH +41</option>
                    <option value="FR">FR +33</option>
                    <option value="BE">BE +32</option>
                  </select>
                  <input className="srt-input" type="tel" value={bookingData.phone} onChange={(event) => updateBookingData("phone", event.target.value)} placeholder="Portable *" />
                </div>
                <input className="srt-input srt-field-full" type="email" value={bookingData.email} onChange={(event) => updateBookingData("email", event.target.value)} placeholder="Email *" />
              </div>
              <div className="srt-modal-actions">
                <button className="srt-back-btn" onClick={() => setStep(1)} type="button">Retour</button>
                <button className="srt-next-btn" disabled={!canContinueInfo} onClick={() => setStep(3)} type="button">Suivant</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="srt-form-title"><Icon name="map-pin" size={12} /> Adresse & notes</div>
              <div className="srt-form-grid address">
                <input className="srt-input srt-field-1" value={bookingData.streetNum} onChange={(event) => updateBookingData("streetNum", event.target.value)} placeholder="N°" />
                <input className="srt-input srt-field-3" value={bookingData.streetName} onChange={(event) => updateBookingData("streetName", event.target.value)} placeholder="Rue" />
                <input className="srt-input srt-field-2" value={bookingData.city} onChange={(event) => updateBookingData("city", event.target.value)} placeholder="Ville" />
                <input className="srt-input srt-field-2" value={bookingData.canton} onChange={(event) => updateBookingData("canton", event.target.value)} placeholder="Canton" />
                <input className="srt-input srt-field-4" value={bookingData.country} onChange={(event) => updateBookingData("country", event.target.value)} placeholder="Pays" />
                <textarea className="srt-textarea srt-field-4" value={bookingData.note} onChange={(event) => updateBookingData("note", event.target.value)} placeholder="Notes (facultatif)" />
              </div>

              <div className="srt-summary">
                <div className="srt-summary-row"><span>Soin</span><strong>{service.title}</strong></div>
                <div className="srt-summary-row"><span>Date</span><strong>{formattedDate} · {bookingData.time}</strong></div>
              </div>

              <div className="srt-modal-actions">
                <button className="srt-back-btn" onClick={() => setStep(2)} type="button" disabled={isSubmitting}>Retour</button>
                <button className="srt-next-btn" onClick={submitBooking} type="button" disabled={isSubmitting}>
                  {isSubmitting ? "En cours..." : "Confirmer"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="srt-success">
              <div className="srt-success-icon"><Icon name="check" size={28} strokeWidth={3} /></div>
              <div>
                <h4>C’est validé.</h4>
                <p>À bientôt au studio{bookingData.firstName ? `, ${bookingData.firstName}` : ""}.</p>
              </div>
              <button className="srt-next-btn" onClick={closeModal} type="button">Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
