import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle,
  Star,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Target
} from "lucide-react";
import heroImage from "@/assets/wedding-hero.jpg";
import { LanguageCurrencySelector } from "@/components/LanguageCurrencySelector";
import { SignupModal } from "@/components/SignupModal";
import Footer from "@/components/Footer";

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);

  const features = [
    {
      icon: Users,
      title: t('landing.features.guestManagement'),
      description: t('landing.features.guestDesc'),
    },
    {
      icon: DollarSign,
      title: t('landing.features.smartBudget'),
      description: t('landing.features.budgetDesc'),
    },
    {
      icon: Calendar,
      title: t('landing.features.timeline'),
      description: t('landing.features.timelineDesc'),
    },
    {
      icon: Target,
      title: t('landing.features.calculator'),
      description: t('landing.features.calculatorDesc'),
    },
  ];

  const testimonials = [
    {
      name: "Maria & João",
      location: "Porto",
      text: t('landing.testimonials.maria'),
      rating: 5,
    },
    {
      name: "Ana & Carlos",
      location: "Lisboa",
      text: t('landing.testimonials.ana'),
      rating: 5,
    },
    {
      name: "Sofia & Miguel",
      location: "Braga",
      text: t('landing.testimonials.sofia'),
      rating: 5,
    },
  ];

  const benefits = [
    t('landing.benefits.save'),
    t('landing.benefits.stress'),
    t('landing.benefits.budget'),
    t('landing.benefits.organized'),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-white" />
            <span className="text-xl font-bold text-white">{t('landing.brand')}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Entrar / Registar
            </Button>
            <LanguageCurrencySelector />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Wedding Planning" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/70" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="animate-fade-in-up">
            <Badge className="mb-6 bg-white/20 text-white text-lg px-6 py-3 animate-float">
              <Sparkles className="w-5 h-5 mr-2" />
              {t('landing.hero.badge')}
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {t('landing.hero.title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                size="lg" 
                className="btn-gradient text-lg px-8 py-4 h-auto"
                onClick={() => setShowSignup(true)}
              >
                {t('landing.hero.cta')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-lg px-8 py-4 h-auto"
              >
                Já tem conta? Entre aqui
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-white/90 justify-center mb-4">
              <CheckCircle className="w-5 h-5" />
              <span>{t('landing.hero.free')}</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{t('landing.hero.portugal')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{t('landing.hero.setup')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{t('landing.hero.couples')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('landing.benefits.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landing.benefits.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-romantic animate-scale-in text-center" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl font-bold text-foreground mb-6">
                {t('landing.problem.title')}
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                    <span className="text-lg text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="card-romantic p-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('landing.calculator.title')}</h3>
                <p className="text-muted-foreground mb-6">{t('landing.calculator.desc')}</p>
                <Button 
                  className="btn-gradient w-full"
                  onClick={() => setShowSignup(true)}
                >
                  {t('landing.calculator.cta')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('landing.testimonials.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-romantic animate-scale-in" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('landing.cta.title')}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {t('landing.cta.subtitle')}
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-4 h-auto bg-white text-primary hover:bg-white/90"
              onClick={() => setShowSignup(true)}
            >
              {t('landing.cta.button')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <SignupModal open={showSignup} onOpenChange={setShowSignup} />
    </div>
  );
};

export default LandingPage;