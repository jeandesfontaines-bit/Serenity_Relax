# Serenity Relax Therapy - Design System & UI Architecture

Ce document décrit l'architecture de conception et les principes d'interface utilisateur (UI) implémentés pour la plateforme Serenity Relax Therapy (Landing Page + Dashboard).

## 1. Philosophie et Principes

- **Minimalisme Premium** : L'interface doit refléter le calme, la détente et l'expertise professionnelle. Les éléments sont espacés, les couleurs sont douces mais avec des contrastes suffisants pour la lisibilité.
- **Micro-interactions** : Utilisation d'animations subtiles (framer-motion, transitions CSS) pour rendre l'interface réactive et vivante (hover effects, skeleton loaders, pulse sur les indicateurs système).
- **Cohérence** : Les tokens de design (couleurs, typographie, espacements) sont centralisés et réutilisés strictement à travers l'application.

## 2. Palette de Couleurs (Tokens)

L'application utilise une palette basée sur HSL avec le système Tailwind CSS et des variables CSS dans `globals.css`.

### Thème Clair (Défaut)
- **Background** : `#F8FAFC` (`210 20% 98%`) - Un gris-bleu extrêmement clair (Slate 50) pour réduire la fatigue oculaire.
- **Foreground** : `#020617` (`222.2 84% 4.9%`) - Slate 950 pour un contraste de texte net.
- **Primary** : `#0F172A` (`222.2 47.4% 11.2%`) - Slate 900. Utilisé pour les actions principales, les boutons, et les éléments actifs du menu.
- **Secondary / Muted** : `#F1F5F9` (`210 20% 96%`) - Utilisé pour les fonds de cartes, les états inactifs, et les éléments de surface secondaires.
- **Borders** : `#E2E8F0` (`214.3 31.8% 91.4%`) - Séparateurs et bordures subtiles.

### Variantes de la Landing Page
La landing page dispose d'un système de thèmes (`landing-v2`) offrant plusieurs variantes (`default`, `immersive`, `editorial`, `concierge`) pour s'adapter à l'intention de l'utilisateur.
- **Off-white** : `#FBF8F2` (Fond chaleureux)
- **Teal Deep** : `#153839` (Texte principal)
- **Orange / Neon** : Accents pour les appels à l'action.

*(Note: Le problème de la barre Safari de couleur "rose" a été corrigé en forçant le `theme-color` dans les métadonnées de l'application à correspondre aux couleurs de fond `#FBF8F2` (clair) et `#152023` (sombre).)*

## 3. Typographie

- **Font Sans-serif (Corps de texte & UI)** : `Manrope` (via `next/font/google`). Choisie pour sa lisibilité exceptionnelle dans les petits corps et son élégance géométrique.
- **Font Display (Titres & Chiffres)** : `Sora`. Donne un caractère premium et structuré aux métriques et aux grands titres.
- **Signature (Accents)** : `Allura`. Utilisée pour la touche personnelle "by João" sur la landing page.

## 4. Composants et Layout Dashboard

### Layout Principal (AppLayout)
- **Sidebar (Menu de Navigation)** : 
  - Fixe sur desktop (320px), transformée en tiroir (`Sheet`) sur mobile.
  - **Couleur de fond** : `#F9FAFB` (très légèrement distincte du fond principal pour délimiter l'espace sans bordure dure).
  - **Menu Actif** : L'élément sélectionné est mis en avant avec un fond sombre (`bg-primary`), un texte inversé, un léger décalage visuel (`translate-x-1`) et une ombre élégante (`shadow-primary/30`).
  - **Icônes** : `lucide-react` avec un trait fin (`strokeWidth={1.25}`) pour l'élégance, qui s'épaissit (`strokeWidth={2}`) et grossit au survol ou à l'état actif.

### Toolbar Contextuelle
- Chaque page dispose d'une barre d'outils secondaire en haut, sous le header global. 
- Contient des actions rapides (Filtres, Vues Mois/Semaine, Exportation CSV) stylisées avec des boutons "Pill" arrondis (`rounded-xl` ou `rounded-full`).

### Tableaux et Listes (Clients, Finances)
- **Design aéré** : Pas de zébrures (`stripes`). Les lignes sont séparées par une très fine bordure inférieure (`border-b`).
- **Hover States** : Un très léger survol (`hover:bg-secondary/20`) pour indiquer l'interactivité sans alourdir la vue.
- Les statuts utilisent des "Chips" (badges) avec des couleurs sémantiques douces (vert pâle pour payé, orange pâle pour en attente).

### Cartes (Dashboard Metrics)
- Cartes flottantes avec `box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.04);`.
- Effet de soulèvement au survol (`hover:translate-y-[-2px]`) avec augmentation de l'ombre pour la profondeur.

## 5. Responsivité

- **Grid CSS** : Utilisation de grilles pour les métriques (`grid-cols-1 md:grid-cols-3 xl:grid-cols-4`) avec des espacements généreux (`gap-6` ou `gap-8`).
- **Mobile-first** : La barre latérale disparaît au profit d'un menu hamburger discret. Les tableaux se compressent ou introduisent un défilement horizontal (overflow-x-auto) si nécessaire.
- L'espace (`padding`) s'adapte dynamiquement (p-4 sur mobile, p-8 sur desktop).

## 6. Accessibilité & Standards

- Contrastes respectés pour les textes secondaires (`text-muted-foreground`).
- Outline / Ring sur les focus clavier (`focus-visible:ring-2`).
- Boutons larges et zones de clic adaptées sur mobile (min-height: 44px).
