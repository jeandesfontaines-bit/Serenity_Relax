"use client";

import Link from 'next/link';
import { SidebarProvider, SidebarTrigger, SidebarInset, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Calendar, FileText, LayoutDashboard, Download, FileCheck, Filter, ArrowUpRight } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, updateDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';

export default function InvoicingManagement() {
  const { firestore } = useFirestore();

  const invoicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'invoices');
  }, [firestore]);

  const { data: invoices, isLoading } = useCollection(invoicesQuery);

  const unpaidTotal = invoices?.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.totalAmount, 0) || 0;
  const paidMonth = invoices?.filter(i => i.status === 'Paid' && i.issueDate.startsWith(format(new Date(), 'yyyy-MM'))).reduce((sum, i) => sum + i.totalAmount, 0) || 0;

  const toggleStatus = async (id: string, current: string) => {
    if (!firestore) return;
    const next = current === 'Paid' ? 'Pending' : 'Paid';
    await updateDoc(doc(firestore, 'invoices', id), { status: next });
  };

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
                <SidebarMenuButton asChild>
                  <Link href="/therapist/clients">
                    <Users className="h-4 w-4" /> Client Dossier
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive asChild>
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
              <h1 className="text-xl font-headline font-bold text-primary">Swiss Invoicing</h1>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="rounded-full gap-2">
                <ArrowUpRight className="h-4 w-4" /> Export CSV
              </Button>
              <Button className="rounded-full bg-primary text-white gap-2">
                <FileCheck className="h-4 w-4" /> Generate Batch
              </Button>
            </div>
          </header>

          <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Unpaid Total</p>
                <p className="text-2xl font-headline font-bold text-amber-500">CHF {unpaidTotal.toFixed(2)}</p>
              </Card>
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Paid This Month</p>
                <p className="text-2xl font-headline font-bold text-green-600">CHF {paidMonth.toFixed(2)}</p>
              </Card>
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">RCC Number</p>
                <p className="text-2xl font-headline font-bold">X1234.56</p>
              </Card>
               <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Tax Period</p>
                <p className="text-2xl font-headline font-bold">{format(new Date(), 'MMM yyyy')}</p>
              </Card>
            </div>

            <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-headline font-bold">Recent Billing Activity</CardTitle>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <Filter className="h-4 w-4" /> Filter Invoices
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="pl-6 h-14 font-bold text-primary">Invoice ID</TableHead>
                      <TableHead className="h-14 font-bold text-primary">Client</TableHead>
                      <TableHead className="h-14 font-bold text-primary">Date</TableHead>
                      <TableHead className="h-14 font-bold text-primary">Amount</TableHead>
                      <TableHead className="h-14 font-bold text-primary">Status</TableHead>
                      <TableHead className="pr-6 h-14 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && <TableRow><TableCell colSpan={6} className="text-center p-12 italic text-muted-foreground">Loading invoices...</TableCell></TableRow>}
                    {!isLoading && invoices?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center p-12 italic text-muted-foreground">No invoices generated yet.</TableCell></TableRow>}
                    {invoices?.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-6 font-mono text-xs">{inv.invoiceNumber}</TableCell>
                        <TableCell className="font-bold">{inv.clientNameSnapshot}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(inv.issueDate), 'yyyy-MM-dd')}</TableCell>
                        <TableCell className="font-bold">CHF {inv.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge 
                            onClick={() => toggleStatus(inv.id, inv.status)}
                            variant={inv.status === 'Paid' ? 'secondary' : 'outline'} 
                            className={`rounded-full px-3 uppercase text-[10px] tracking-widest font-bold cursor-pointer ${inv.status === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100'}`}
                          >
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button variant="ghost" size="sm" className="rounded-full gap-2">
                            <Download className="h-4 w-4" /> PDF
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
