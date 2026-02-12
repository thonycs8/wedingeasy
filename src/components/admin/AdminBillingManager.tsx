import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, DollarSign, TrendingUp, CreditCard, Search, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface PaymentRecord {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_type: string;
  description: string | null;
  created_at: string;
  stripe_payment_id: string | null;
}

interface WeddingSub {
  id: string;
  wedding_id: string;
  plan_id: string;
  status: string | null;
  billing_type: string | null;
  paid_amount: number | null;
  starts_at: string | null;
  expires_at: string | null;
}

interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalPayments: number;
  activeSubscriptions: number;
}

export function AdminBillingManager() {
  const { currency } = useSettings();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [weddingSubs, setWeddingSubs] = useState<WeddingSub[]>([]);
  const [stats, setStats] = useState<RevenueStats>({ totalRevenue: 0, monthlyRevenue: 0, totalPayments: 0, activeSubscriptions: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, subsRes] = await Promise.all([
        supabase
          .from('payment_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('wedding_subscriptions')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      const paymentData = paymentsRes.data || [];
      const subsData = subsRes.data || [];
      
      setPayments(paymentData);
      setWeddingSubs(subsData);

      // Calculate stats
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalRevenue = paymentData
        .filter(p => p.status === 'succeeded')
        .reduce((acc, p) => acc + Number(p.amount), 0);

      const monthlyRevenue = paymentData
        .filter(p => p.status === 'succeeded' && new Date(p.created_at) >= monthStart)
        .reduce((acc, p) => acc + Number(p.amount), 0);

      const activeSubscriptions = subsData.filter(s => s.status === 'active').length;

      setStats({
        totalRevenue,
        monthlyRevenue,
        totalPayments: paymentData.length,
        activeSubscriptions,
      });
    } catch (err) {
      console.error('Error loading billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p =>
    !search || 
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.stripe_payment_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.status.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      succeeded: 'bg-green-500/10 text-green-700 border-green-200',
      pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
      failed: 'bg-red-500/10 text-red-700 border-red-200',
      refunded: 'bg-blue-500/10 text-blue-700 border-blue-200',
    };
    return <Badge variant="outline" className={map[status] || ''}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita este Mês</p>
                <p className="text-xl font-bold">{formatCurrency(stats.monthlyRevenue, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pagamentos</p>
                <p className="text-xl font-bold">{stats.totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <RefreshCw className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subscrições Ativas</p>
                <p className="text-xl font-bold">{stats.activeSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Sem pagamentos registados.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Montante</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm">
                        {format(new Date(payment.created_at), "dd/MM/yyyy HH:mm", { locale: pt })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {payment.description || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {payment.payment_type === 'subscription' ? 'Subscrição' : 
                           payment.payment_type === 'one_time' ? 'Pagamento único' : 
                           payment.payment_type === 'domain' ? 'Domínio' : payment.payment_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount, (payment.currency?.toUpperCase() || 'EUR') as any)}
                      </TableCell>
                      <TableCell>{statusBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscrições de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {weddingSubs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Sem subscrições registadas.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wedding ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Montante</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weddingSubs.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="text-sm font-mono text-xs">
                        {sub.wedding_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {sub.billing_type === 'monthly' ? 'Mensal' : sub.billing_type === 'one_time' ? '2 Anos' : sub.billing_type || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {sub.paid_amount != null ? formatCurrency(sub.paid_amount, currency) : '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.starts_at ? format(new Date(sub.starts_at), "dd/MM/yyyy", { locale: pt }) : '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.expires_at ? format(new Date(sub.expires_at), "dd/MM/yyyy", { locale: pt }) : '—'}
                      </TableCell>
                      <TableCell>
                        {statusBadge(sub.status || 'pending')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
