export type Service = {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  image?: string;
};

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'NoShow';

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressStreet: string;
  addressCity: string;
  addressPostalCode: string;
  addressCountry: string;
  dateOfBirth: string;
  insuranceFundName?: string;
  insuranceNumber?: string;
  loyaltySessionsCompleted: number;
  isNextSessionFree: boolean;
  therapistNotes?: string;
};

export type Appointment = {
  id: string;
  clientId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  clientName?: string;
  firstName?: string;
  lastName?: string;
  clientNameSnapshot?: string;
  phone?: string;
  clientMessage?: string;
  promoCodeId?: string;
  therapistNotes?: string;
  cancellationReason?: string;
  isLoyaltyFreeSession: boolean;
  isConfirmed: boolean;
  createdAt: any;
};

export const SERVICES: Service[] = [
  { 
    id: '1', 
    name: 'Bambous - Stimulation Musculaire Profonde 60 min', 
    description: 'Technique utilisant des bâtons de bambou pour travailler les tissus en profondeur et libérer les tensions.', 
    duration: '60 min', 
    price: 110,
    image: '/images/services/bambous.png'
  },
  { 
    id: '2', 
    name: 'Draineur Lymphatique - Séance ciblée 60 min', 
    description: 'Technique de pompage douce pour revitaliser, détoxifier l\'organisme et relancer la circulation.', 
    duration: '60 min', 
    price: 110,
    image: '/images/services/drainage.png'
  },
  { 
    id: '3', 
    name: 'Aromathérapie - Séance ciblée 60 min', 
    description: 'Massage intégrant des huiles essentielles personnalisées pour une harmonie parfaite du corps et de l\'esprit.', 
    duration: '60 min', 
    price: 110,
    image: '/images/services/aroma.png'
  },
  { 
    id: '4', 
    name: 'Réflexologie Plantaire Séance ciblée - 30 min', 
    description: 'Technique ciblée basée sur la stimulation des points réflexes pour rééquilibrer l\'énergie des organes internes.', 
    duration: '30 min', 
    price: 60,
    image: '/images/services/reflexo.png'
  },
  { 
    id: '5', 
    name: 'Sportif / Deep Tissue - Séance ciblée 60 min', 
    description: 'Conçu pour les sportifs ou personnes actives, aide à dénouer les blocages et optimiser la récupération.', 
    duration: '60 min', 
    price: 110,
    image: '/images/services/sportif.png'
  },
  { 
    id: '6', 
    name: 'Thérapeutique - Séance ciblée 60 min', 
    description: 'Soin ciblé (technique suédoise) pour soulager les tensions musculaires, améliorer la mobilité et apaiser le système nerveux.', 
    duration: '60 min', 
    price: 110,
    image: '/images/services/therapeutique.png'
  },
  { 
    id: '7', 
    name: 'Deep Relax - Relaxation Profonde 60 min', 
    description: 'Technique lente et profonde pour une détente totale du corps, favorisant le lâcher-prise mental et nerveux.', 
    duration: '60 min', 
    price: 120,
    image: '/images/services/deep_relax.png'
  },
  { 
    id: '8', 
    name: 'Thaï aux Huiles Chaudes - Étirements & Pressions Profondes 60 min', 
    description: 'Technique dynamique combinant pressions profondes et étirements fluides pour relancer l\'énergie vitale.', 
    duration: '60 min', 
    price: 120,
    image: '/images/services/thai.png'
  },
];