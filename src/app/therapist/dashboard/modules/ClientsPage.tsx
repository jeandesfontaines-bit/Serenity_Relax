import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Client, Appointment } from '../types';
import { AnimatePresence } from 'framer-motion';
import { 
  ALL_COLUMNS, 
  SortDir, 
  getClientSummary, 
  ClientSummary,
  ClientFilters
} from './clients/constants';

// Sub-components
import ClientCard from './clients/ClientCard';
import SelectionToolbar from './clients/SelectionToolbar';
import FilterPanel from './clients/FilterPanel';
import ClientTableHeader from './clients/ClientTableHeader';
import ClientListRow from './clients/ClientListRow';
import EmptyState from './clients/EmptyState';

interface ClientsPageProps {
  clients: Client[];
  appointments: Appointment[];
  onSelectClient: (client: Client) => void;
  onMergeClients?: (primaryId: string, secondaryIds: string[]) => void;
  onDeleteClients?: (ids: string[]) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  showFilterPanel: boolean;
  onShowFilterPanelChange: (value: boolean) => void;
  onVisibleCountChange?: (count: number) => void;
  viewMode: 'list' | 'grid';
}

export default function ClientsPage({
  clients,
  appointments,
  onSelectClient,
  onDeleteClients,
  searchQuery,
  showFilterPanel,
  onShowFilterPanelChange,
  onVisibleCountChange,
  viewMode,
}: ClientsPageProps) {
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const filterDropdownRef = useRef<HTMLDivElement | null>(null);
  const [visibleColumnIds, setVisibleColumnIds] = useState<Set<string>>(
    new Set(ALL_COLUMNS.map((column) => column.id)),
  );

  const summaryByClient = useMemo(() => {
    const grouped = new Map<string, Appointment[]>();
    appointments.forEach((appt) => {
      if (!appt.clientId) return;
      const current = grouped.get(appt.clientId) || [];
      current.push(appt);
      grouped.set(appt.clientId, current);
    });

    const summaryMap = new Map<string, ClientSummary>();
    clients.forEach((client) => {
      summaryMap.set(client.id, getClientSummary(client, grouped.get(client.id) || []));
    });
    return summaryMap;
  }, [appointments, clients]);

  const [filters, setFilters] = useState<ClientFilters>({
    status: 'all',
    minSessions: null,
    lastVisitWithinDays: null,
  });

  const filtered = useMemo(() =>
    clients
      .filter((client) => {
        const summary = summaryByClient.get(client.id);
        if (!summary) return false;

        // Search query
        if (searchQuery && !summary.searchText.includes(searchQuery.trim().toLowerCase())) {
          return false;
        }

        // Status filter
        if (filters.status !== 'all') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const isActive = summary.lastVisitDate && summary.lastVisitDate > thirtyDaysAgo;
          if (filters.status === 'active' && !isActive) return false;
          if (filters.status === 'inactive' && isActive) return false;
        }

        // Min sessions filter
        if (filters.minSessions !== null && summary.sessionsCount < filters.minSessions) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const summaryA = summaryByClient.get(a.id);
        const summaryB = summaryByClient.get(b.id);
        if (!summaryA || !summaryB) return 0;

        let valueA: string | number = '';
        let valueB: string | number = '';

        switch (sortField) {
          case 'firstName': valueA = a.firstName || ''; valueB = b.firstName || ''; break;
          case 'lastName': valueA = a.lastName || ''; valueB = b.lastName || ''; break;
          case 'email': valueA = a.email || ''; valueB = b.email || ''; break;
          case 'phone': valueA = a.phone || ''; valueB = b.phone || ''; break;
          case 'zip': valueA = a.zip || ''; valueB = b.zip || ''; break;
          case 'city': valueA = a.city || ''; valueB = b.city || ''; break;
          case 'lastVisit':
            valueA = summaryA.lastVisitDate?.getTime() || 0;
            valueB = summaryB.lastVisitDate?.getTime() || 0;
            break;
          case 'preferredRitual':
            valueA = summaryA.preferredRitual;
            valueB = summaryB.preferredRitual;
            break;
          case 'sessions':
            valueA = summaryA.sessionsCount;
            valueB = summaryB.sessionsCount;
            break;
          default:
            valueA = String(a[sortField as keyof Client] || '');
            valueB = String(b[sortField as keyof Client] || '');
        }

        const result = typeof valueA === 'string'
          ? String(valueA).localeCompare(String(valueB))
          : Number(valueA) - Number(valueB);

        return sortDir === 'asc' ? result : -result;
      }),
    [clients, searchQuery, sortDir, sortField, summaryByClient, filters],
  );

  const toggleSort = useCallback((id: string) => {
    if (sortField === id) {
      setSortDir((prev) => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(id);
      setSortDir('asc');
    }
  }, [sortField]);

  const toggleClient = useCallback((id: string) => {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleDelete = useCallback(() => {
    const ids = Array.from(selectedClients);
    if (confirm(`Voulez-vous vraiment supprimer ${ids.length} patient(s) ? Cette action est irréversible.`)) {
      onDeleteClients?.(ids);
      setSelectedClients(new Set());
    }
  }, [onDeleteClients, selectedClients]);

  useEffect(() => {
    onVisibleCountChange?.(filtered.length);
  }, [filtered.length, onVisibleCountChange]);

  useEffect(() => {
    if (!showFilterPanel) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        onShowFilterPanelChange(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [showFilterPanel, onShowFilterPanelChange]);

  const visibleColumns = ALL_COLUMNS.filter((column) => visibleColumnIds.has(column.id));
  const gridTemplate = [
    '56px',
    ...visibleColumns.map((column) => `minmax(${column.minWidth}, ${column.flex})`),
    '80px',
  ].join(' ');

  const toggleColumnVisibility = useCallback((id: string) => {
    setVisibleColumnIds((prev) => {
      const next = new Set(prev);
      if (next.size === 1 && next.has(id)) return prev;
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = filtered.length > 0 && selectedClients.size === filtered.length;

  return (
    <div className="flex flex-1 flex-col bg-transparent p-10 lg:p-16 space-y-10">
      <AnimatePresence>
        {selectedClients.size > 0 && (
          <SelectionToolbar 
            selectedCount={selectedClients.size} 
            onDelete={handleDelete} 
            onCancel={() => setSelectedClients(new Set())} 
          />
        )}
      </AnimatePresence>

      <main className="relative flex-1">
        {showFilterPanel && (
          <FilterPanel 
            visibleColumnIds={visibleColumnIds} 
            onToggleColumn={toggleColumnVisibility} 
            dropdownRef={filterDropdownRef}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}

        {filtered.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            <ClientTableHeader
              visibleColumns={visibleColumns}
              sortField={sortField}
              sortDir={sortDir}
              allSelected={allSelected}
              onToggleSelectAll={() => {
                if (allSelected) setSelectedClients(new Set());
                else setSelectedClients(new Set(filtered.map(c => c.id)));
              }}
              onToggleSort={toggleSort}
              gridTemplate={gridTemplate}
            />

            <div className="bg-[hsl(var(--background))]">
              {filtered.map(client => {
                const summary = summaryByClient.get(client.id);
                if (!summary) return null;
                return (
                  <ClientListRow
                    key={client.id}
                    client={client}
                    summary={summary}
                    isSelected={selectedClients.has(client.id)}
                    visibleColumnIds={visibleColumnIds}
                    gridTemplate={gridTemplate}
                    onSelect={onSelectClient}
                    onToggleSelection={toggleClient}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(client => {
              const summary = summaryByClient.get(client.id);
              if (!summary) return null;
              return (
                <ClientCard 
                  key={client.id}
                  client={client}
                  summary={summary}
                  isSelected={selectedClients.has(client.id)}
                  onSelect={onSelectClient}
                  onToggle={() => toggleClient(client.id)}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
