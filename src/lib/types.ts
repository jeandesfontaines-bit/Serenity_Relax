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
    image: 'https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb.d0f88929.png&w=3840&q=75'
  },
  { 
    id: '2', 
    name: 'Draineur Lymphatique - Séance ciblée 60 min', 
    description: 'Technique de pompage douce pour revitaliser, détoxifier l\'organisme et relancer la circulation.', 
    duration: '60 min', 
    price: 110,
    image: 'https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(1).cc6cf032.png&w=3840&q=75'
  },
  { 
    id: '3', 
    name: 'Aromathérapie - Séance ciblée 60 min', 
    description: 'Massage intégrant des huiles essentielles personnalisées pour une harmonie parfaite du corps et de l\'esprit.', 
    duration: '60 min', 
    price: 110,
    image: 'https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(2).8265cf32.png&w=3840&q=75'
  },
  { 
    id: '4', 
    name: 'Réflexologie Plantaire Séance ciblée - 30 min', 
    description: 'Technique ciblée basée sur la stimulation des points réflexes pour rééquilibrer l\'énergie des organes internes.', 
    duration: '30 min', 
    price: 60,
    image: 'https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(3).7bebd53b.png&w=3840&q=75'
  },
  { 
    id: '5', 
    name: 'Sportif / Deep Tissue - Séance ciblée 60 min', 
    description: 'Conçu pour les sportifs ou personnes actives, aide à dénouer les blocages et optimiser la récupération.', 
    duration: '60 min', 
    price: 110,
    image: 'https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(4).d7de7c4e.png&w=3840&q=75'
  },
  { 
    id: '6', 
    name: 'Thérapeutique - Séance ciblée 60 min', 
    description: 'Soin ciblé (technique suédoise) pour soulager les tensions musculaires, améliorer la mobilité et apaiser le système nerveux.', 
    duration: '60 min', 
    price: 110,
    image: 'https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(5).95f12a12.png&w=3840&q=75'
  },
  { 
    id: '7', 
    name: 'Deep Relax - Relaxation Profonde 60 min', 
    description: 'Technique lente et profonde pour une détente totale du corps, favorisant le lâcher-prise mental et nerveux.', 
    duration: '60 min', 
    price: 120,
    image: 'https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(6).40bca099.png&w=3840&q=75'
  },
  { 
    id: '8', 
    name: 'Thaï aux Huiles Chaudes - Étirements & Pressions Profondes 60 min', 
    description: 'Technique dynamique combinant pressions profondes et étirements fluides pour relancer l\'énergie vitale.', 
    duration: '60 min', 
    price: 120,
    image: 'https://6000-firebase-studio-1772978180710.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FGemini_Generated_Image_4vxbi24vxbi24vxb%20(7).681b63b0.png&w=3840&q=75'
  },
];