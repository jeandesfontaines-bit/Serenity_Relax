import React from 'react';
import { motion } from 'framer-motion';
import { Search, User, ArrowRight, UserPlus } from 'lucide-react';
import { Client } from '../../types';

interface ClientStepProps {
  search: string;
  onSearchChange: (value: string) => void;
  filteredClients: Client[];
  onSelectClient: (client: Client) => void;
  onSelectNew: () => void;
}

export function ClientStep({
  search,
  onSearchChange,
  filteredClients,
  onSelectClient,
  onSelectNew,
}: ClientStepProps) {
  return (
    <motion.div
      key="step-client"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="p-12 space-y-8"
    >
      {/* Search Input */}
      <div className="relative group">
        <Search
          size={18}
          strokeWidth={2.5}
          className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 text-muted-foreground"
        />
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          autoFocus
          placeholder="Rechercher un patient…"
          className="dashboard-field h-14 rounded-2xl bg-secondary/30 pl-14 pr-5 text-base font-semibold"
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 gap-3">
        {filteredClients.slice(0, 5).map(c => (
          <motion.button
            key={c.id}
            onClick={() => onSelectClient(c)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="dashboard-panel group flex w-full items-center justify-between rounded-2xl p-5 transition-all duration-300 hover:border-primary hover:bg-primary/5"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-all duration-300">
                <User size={16} strokeWidth={2} />
              </div>
              <div>
                <p className="text-base font-black tracking-tight leading-tight text-foreground">
                  {c.firstName} {c.lastName}
                </p>
                <p className="text-[11px] font-medium mt-0.5 text-muted-foreground/60">
                  {c.email || c.phone || 'Aucun contact enregistré'}
                </p>
              </div>
            </div>
            <ArrowRight
              size={16}
              strokeWidth={2.5}
              className="transition-transform duration-700 group-hover:translate-x-1 text-muted-foreground"
            />
          </motion.button>
        ))}

        {/* Create new patient (no results) */}
        {filteredClients.length === 0 && search.trim() && (
          <motion.button
            onClick={onSelectNew}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-5 transition-all duration-300 hover:border-primary hover:bg-primary/5"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform duration-300 group-hover:scale-110">
                <UserPlus size={16} strokeWidth={2.5} />
              </div>
              <div>
                <p className="dashboard-eyebrow mb-0.5">Nouveau patient</p>
                <p className="text-base font-black tracking-tight text-foreground">
                  {search}
                </p>
              </div>
            </div>
            <ArrowRight
              size={16}
              strokeWidth={2.5}
              className="transition-transform duration-700 group-hover:translate-x-1 text-primary"
            />
          </motion.button>
        )}
      </div>

      {/* Add new patient link (results exist) */}
      {filteredClients.length > 0 && (
        <button
          onClick={onSelectNew}
          className="w-full flex items-center justify-center gap-3 py-5 border-t border-border/30 transition-all duration-700 text-[11px] font-bold tracking-[0.05em] text-muted-foreground/80 hover:text-primary"
        >
          <UserPlus size={14} strokeWidth={2.5} />
          Créer un nouveau profil
        </button>
      )}
    </motion.div>
  );
}
