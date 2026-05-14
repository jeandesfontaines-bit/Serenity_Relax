import React from 'react';
import { SectionHeader, InlineEditableField, InlineEditableTextarea } from './SharedComponents';

interface CabinetSettingsProps {
  name: string;
  onNameChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  address: string;
  onAddressChange: (val: string) => void;
  searchQuery?: string;
}

export default function CabinetSettings({
  name,
  onNameChange,
  email,
  onEmailChange,
  address,
  onAddressChange,
  searchQuery = '',
}: CabinetSettingsProps) {
  const fields = [
    { label: 'Nom Public', value: name, set: onNameChange, full: false },
    { label: 'Email Contact', value: email, set: onEmailChange, full: false },
    { label: 'Coordonnées Facturation', value: address, set: onAddressChange, full: true },
  ];

  const filteredFields = fields.filter(f => 
    !searchQuery || f.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <SectionHeader title="Identité du Cabinet" subtitle="Informations légales et administratives" />
      <div className="rounded-xl p-4 border shadow-sm space-y-4" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredFields.map(f => (
            <div key={f.label} className={`space-y-1 ${f.full ? 'md:col-span-2' : ''}`}>
              <label className="text-[7.5px] font-bold uppercase tracking-[0.2em] px-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{f.label}</label>
              {f.full ? (
                <InlineEditableTextarea
                  placeholder={f.label}
                  value={f.value}
                  onChange={f.set}
                  rows={2}
                  variant="soft"
                />
              ) : (
                <InlineEditableField
                  placeholder={f.label}
                  value={f.value}
                  onChange={f.set}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
