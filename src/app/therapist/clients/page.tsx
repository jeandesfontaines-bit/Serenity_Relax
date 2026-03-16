"use client";

import Link from 'next/link';
import { SidebarProvider, SidebarTrigger, SidebarInset, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Calendar, FileText, LayoutDashboard, Search, Plus, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function ClientsCRM() {
  const { firestore } = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'clients');
  }, [firestore]);

  const { data: clients, isLoading } = useCollection(clientsQuery);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F7F7F2]">
        <Sidebar className="border-r border-primary/10">
          <SidebarHeader className="p-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-white p-2 rounded-xl">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span className="text-sm font-body font-bold text-primary uppercase tracking-widest">SERENITY RELAX</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/therapist/dashboard">
                    <Calendar className="h-4 w-4" /> Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive asChild>
                  <Link href="/therapist/clients">
                    <Users className="h-4 w-4" /> Client Dossier
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/therapist/invoices">
                    <FileText className="h-4 w-4" /> Invoicing
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 flex items-center justify-between px-8 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-headline font-bold text-primary">Client CRM</h1>
            </div>
            <Button className="rounded-full bg-primary text-white gap-2">
              <Plus className="h-4 w-4" /> New Client
            </Button>
          </header>

          <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
            <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 border-b flex flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name, email, or insurance..." className="pl-10 rounded-full bg-muted/30 border-none h-11" />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Swiss-Compliant Records
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="pl-6 h-14 font-bold text-primary">Name</TableHead>
                      <TableHead className="h-14 font-bold text-primary">Contact Info</TableHead>
                      <TableHead className="h-14 font-bold text-primary">Insurance</TableHead>
                      <TableHead className="h-14 font-bold text-primary">Sessions</TableHead>
                      <TableHead className="h-14 font-bold text-primary">Status</TableHead>
                      <TableHead className="pr-6 h-14"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && <TableRow><TableCell colSpan={6} className="text-center p-12 italic text-muted-foreground">Loading patient records...</TableCell></TableRow>}
                    {!isLoading && clients?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center p-12 italic text-muted-foreground">No client records found.</TableCell></TableRow>}
                    {clients?.map((client) => (
                      <TableRow key={client.id} className="hover:bg-muted/30 transition-colors group">
                        <TableCell className="pl-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {client.firstName[0]}{client.lastName[0]}
                            </div>
                            <span className="font-headline font-bold text-lg">{client.firstName} {client.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{client.email}</p>
                            <p className="text-muted-foreground">{client.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm px-3 py-1 bg-muted rounded-full font-medium">{client.insuranceFundName || 'None'}</span>
                        </TableCell>
                        <TableCell className="font-bold text-center">{client.loyaltySessionsCompleted || 0}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">Active</TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
