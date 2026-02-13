import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Target,
  Menu,
  Globe,
  Shield,
  Palette,
  Send,
  Crown
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import heroImage from "@/assets/wedding-hero.jpg";
import { LanguageCurrencySelector } from "@/components/LanguageCurrencySelector";
import { SignupModal } from "@/components/SignupModal";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const featuresRef = useScrollReveal();
  const featuresGridRef = useScrollReveal();
  const problemRef = useScrollReveal();
  const problemCardRef = useScrollReveal();
  const testimonialsRef = useScrollReveal();
  const testimonialsGridRef = useScrollReveal();
  const ctaRef = useScrollReveal();

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
    {
      icon: Globe,
      title: t('landing.features.eventPage'),
      description: t('landing.features.eventPageDesc'),
    },
    {
      icon: Crown,
      title: t('landing.features.roleInvites'),
      description: t('landing.features.roleInvitesDesc'),
    },
    {
      icon: Send,
      title: t('landing.features.collaborators'),
      description: t('landing.features.collaboratorsDesc'),
    },
    {
      icon: Palette,
      title: t('landing.features.choices'),
      description: t('landing.features.choicesDesc'),
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
    t('landing.benefits.eventPageBenefit'),
    t('landing.benefits.rolesBenefit'),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary animate-heartbeat" />
            <span className="text-xl font-bold text-primary">{t('landing.brand')}</span>
          </div>
          
          {!isMobile && (
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/pricing')}>Planos</Button>
              <Button variant="ghost" onClick={() => navigate('/user-guide')}>Manual de Uso</Button>
              <Button variant="ghost" onClick={() => navigate('/faq')}>FAQ</Button>
              <Button variant="outline" onClick={() => navigate('/auth')}>Entrar / Registar</Button>
              <LanguageCurrencySelector />
            </div>
          )}

          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu className="w-6 h-6" /></Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-primary" />
                    {t('landing.brand')}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <Button variant="ghost" onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }} className="justify-start">Planos</Button>
                  <Button variant="ghost" onClick={() => { navigate('/user-guide'); setMobileMenuOpen(false); }} className="justify-start">Manual de Uso</Button>
                  <Button variant="ghost" onClick={() => { navigate('/faq'); setMobileMenuOpen(false); }} className="justify-start">FAQ</Button>
                  <Button variant="outline" onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }} className="justify-start">Entrar / Registar</Button>
                  <div className="pt-4 border-t"><LanguageCurrencySelector /></div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Wedding Planning" className="w-full h-full object-cover" />
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
                className="btn-gradient text-lg px-8 py-4 h-auto animate-gentle-glow"
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

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 scroll-reveal" ref={featuresRef}>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('landing.benefits.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landing.benefits.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children" ref={featuresGridRef}>
            {features.map((feature, index) => (
              <Card key={index} className="card-romantic text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
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
            <div className="scroll-reveal-left" ref={problemRef}>
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
            
            <div className="scroll-reveal-right" ref={problemCardRef}>
              <Card className="card-romantic p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{t('landing.calculator.title')}</h3>
                  <p className="text-muted-foreground mb-6">{t('landing.calculator.desc')}</p>
                  <Button className="btn-gradient w-full animate-gentle-glow" onClick={() => setShowSignup(true)}>
                    {t('landing.calculator.cta')}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 scroll-reveal" ref={testimonialsRef}>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('landing.testimonials.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children" ref={testimonialsGridRef}>
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-romantic">
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
          <div className="max-w-3xl mx-auto scroll-reveal" ref={ctaRef}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('landing.cta.title')}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {t('landing.cta.subtitle')}
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-4 h-auto bg-white text-primary hover:bg-white/90 animate-gentle-glow"
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
