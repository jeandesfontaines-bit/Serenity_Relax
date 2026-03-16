import Link from 'next/link';
import { SidebarProvider, SidebarTrigger, SidebarInset, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Calendar, FileText, LayoutDashboard, Download, FileCheck, Filter, ArrowUpRight } from 'lucide-react';

export default function InvoicingManagement() {
  const invoices = [
    { id: 'INV-2024-001', client: 'Jean Dupont', date: '2024-10-15', amount: 150, status: 'paid', rcc: 'X1234.56' },
    { id: 'INV-2024-002', client: 'Marie Lambert', date: '2024-10-20', amount: 120, status: 'pending', rcc: 'X1234.56' },
    { id: 'INV-2024-003', client: 'Lucas Steiner', date: '2024-10-22', amount: 110, status: 'paid', rcc: 'X1234.56' },
    { id: 'INV-2024-004', client: 'Sophie Martin', date: '2024-10-24', amount: 70, status: 'pending', rcc: 'X1234.56' },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F7F7F2]">
        <Sidebar className="border-r border-primary/10">
          <SidebarHeader className="p-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-white p-2 rounded-xl">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span className="text-xl font-headline font-bold text-primary">AuraFlow</span>
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
                <ArrowUpRight className="h-4 w-4" /> Export Data
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
                <p className="text-2xl font-headline font-bold text-amber-500">CHF 190.00</p>
              </Card>
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Paid This Month</p>
                <p className="text-2xl font-headline font-bold text-green-600">CHF 2,450.00</p>
              </Card>
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">RCC Number</p>
                <p className="text-2xl font-headline font-bold">X1234.56</p>
              </Card>
               <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Tax Period</p>
                <p className="text-2xl font-headline font-bold">Q4 2024</p>
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
                    {invoices.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-6 font-mono text-xs">{inv.id}</TableCell>
                        <TableCell className="font-bold">{inv.client}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{inv.date}</TableCell>
                        <TableCell className="font-bold">CHF {inv.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={inv.status === 'paid' ? 'secondary' : 'outline'} className={`rounded-full px-3 uppercase text-[10px] tracking-widest font-bold ${inv.status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'text-amber-600 border-amber-200 bg-amber-50'}`}>
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
