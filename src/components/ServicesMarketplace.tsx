import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Euro } from "lucide-react";
import { formatCurrency, Currency } from "@/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number | null;
  partners: {
    id: string;
    business_name: string;
    category: string;
    description: string | null;
    email: string | null;
    phone: string | null;
  };
}

interface ServicesByCategory {
  [category: string]: Service[];
}

export const ServicesMarketplace = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const { toast } = useToast();
  const { currency } = useSettings();

  const [bookingData, setBookingData] = useState({
    booking_date: "",
    booking_time: "",
    notes: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          partners (
            id,
            business_name,
            category,
            description,
            email,
            phone
          )
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("service_bookings").insert([
        {
          user_id: user.id,
          service_id: selectedService.id,
          booking_date: bookingData.booking_date,
          booking_time: bookingData.booking_time,
          notes: bookingData.notes || null,
          total_price: selectedService.price,
          status: "pending",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Reserva realizada!",
        description: "Sua reserva foi enviada com sucesso. Aguarde o contato do parceiro.",
      });

      setIsBookingDialogOpen(false);
      setSelectedService(null);
      setBookingData({ booking_date: "", booking_time: "", notes: "" });
    } catch (error) {
      console.error("Erro ao realizar reserva:", error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar a reserva",
        variant: "destructive",
      });
    }
  };

  const servicesByCategory = services.reduce<ServicesByCategory>((acc, service) => {
    const category = service.partners.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  if (loading) {
    return <div className="p-6">Carregando serviços...</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Serviços para o seu Casamento</h2>
        <p className="text-muted-foreground">
          Contrate serviços dos nossos parceiros de confiança
        </p>
      </div>

      {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-2xl font-semibold capitalize">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{service.partners.business_name}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {formatCurrency(service.price, currency as Currency)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.description && (
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  )}
                  
                  {service.duration_minutes && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration_minutes} minutos</span>
                    </div>
                  )}

                  <Dialog
                    open={isBookingDialogOpen && selectedService?.id === service.id}
                    onOpenChange={(open) => {
                      setIsBookingDialogOpen(open);
                      if (!open) setSelectedService(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        onClick={() => setSelectedService(service)}
                      >
                        Reservar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reservar {service.name}</DialogTitle>
                        <DialogDescription>
                          {service.partners.business_name} - {formatCurrency(service.price, currency as Currency)}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleBooking} className="space-y-4">
                        <div>
                          <Label htmlFor="booking_date">Data *</Label>
                          <Input
                            id="booking_date"
                            type="date"
                            value={bookingData.booking_date}
                            onChange={(e) =>
                              setBookingData({ ...bookingData, booking_date: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="booking_time">Hora *</Label>
                          <Input
                            id="booking_time"
                            type="time"
                            value={bookingData.booking_time}
                            onChange={(e) =>
                              setBookingData({ ...bookingData, booking_time: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="notes">Observações</Label>
                          <Textarea
                            id="notes"
                            value={bookingData.notes}
                            onChange={(e) =>
                              setBookingData({ ...bookingData, notes: e.target.value })
                            }
                            rows={3}
                            placeholder="Adicione detalhes sobre sua reserva..."
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsBookingDialogOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">Confirmar Reserva</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {services.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum serviço disponível no momento
          </CardContent>
        </Card>
      )}
    </div>
  );
};
