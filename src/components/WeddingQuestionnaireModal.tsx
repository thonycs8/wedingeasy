import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Heart,
  Sparkles,
  CreditCard
} from "lucide-react";
import { formatCurrency } from "@/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import { useWeddingData } from "@/contexts/WeddingContext";
import { PlanSelectionStep } from "@/components/questionnaire/PlanSelectionStep";
import { supabase } from "@/integrations/supabase/client";

interface WeddingQuestionnaireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  coupleData: {
    name: string;
    email: string;
    partnerName: string;
  };
  mode?: 'create' | 'join';
}

interface WeddingData {
  date: string;
  guestCount: number;
  style: 'intimate' | 'classic' | 'luxury';
  region: 'lisboa' | 'porto' | 'center' | 'south' | 'islands';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  priorities: string[];
  budget: number;
  selectedPlanId: string | null;
  billingType: 'monthly' | 'one_time';
  desiredDomain: string;
  wantsDomain: boolean;
}

// Base pricing data for Portugal market
const PRICING_DATA = {
  venue: {
    intimate: { min: 2000, max: 5000 },
    classic: { min: 4000, max: 8000 },
    luxury: { min: 8000, max: 15000 }
  },
  catering: {
    perPerson: {
      intimate: 35,
      classic: 50,
      luxury: 80
    }
  },
  photography: {
    intimate: { min: 800, max: 1500 },
    classic: { min: 1500, max: 2500 },
    luxury: { min: 2500, max: 4000 }
  },
  dress: {
    intimate: { min: 500, max: 1200 },
    classic: { min: 1000, max: 2500 },
    luxury: { min: 2000, max: 5000 }
  },
  flowers: {
    intimate: { min: 300, max: 800 },
    classic: { min: 600, max: 1500 },
    luxury: { min: 1200, max: 3000 }
  },
  music: {
    intimate: { min: 300, max: 800 },
    classic: { min: 600, max: 1200 },
    luxury: { min: 1000, max: 2500 }
  }
};

const REGIONAL_MULTIPLIERS = {
  lisboa: 1.2,
  porto: 1.1,
  center: 1.0,
  south: 0.9,
  islands: 1.15
};

const SEASONAL_MULTIPLIERS = {
  spring: 1.1,
  summer: 1.2,
  autumn: 1.0,
  winter: 0.9
};

export const WeddingQuestionnaireModal = ({ 
  open, 
  onOpenChange, 
  onComplete, 
  coupleData,
  mode = 'create'
}: WeddingQuestionnaireModalProps) => {
  const { t } = useTranslation();
  const { currency } = useSettings();
  const { setWeddingData: saveWeddingData } = useWeddingData();
  const [setupMode, setSetupMode] = useState<'create' | 'join'>(mode);
  const [joinCode, setJoinCode] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [weddingData, setWeddingData] = useState<WeddingData>({
    date: '',
    guestCount: 80,
    style: 'classic',
    region: 'lisboa',
    season: 'summer',
    priorities: [],
    budget: 15000,
    selectedPlanId: null,
    billingType: 'monthly',
    desiredDomain: '',
    wantsDomain: false,
  });

  const totalSteps = 7;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const calculateBudget = () => {
    const { style, region, season, guestCount } = weddingData;
    const regional = REGIONAL_MULTIPLIERS[region];
    const seasonal = SEASONAL_MULTIPLIERS[season];
    
    const venue = (PRICING_DATA.venue[style].min + PRICING_DATA.venue[style].max) / 2;
    const catering = PRICING_DATA.catering.perPerson[style] * guestCount;
    const photography = (PRICING_DATA.photography[style].min + PRICING_DATA.photography[style].max) / 2;
    const dress = (PRICING_DATA.dress[style].min + PRICING_DATA.dress[style].max) / 2;
    const flowers = (PRICING_DATA.flowers[style].min + PRICING_DATA.flowers[style].max) / 2;
    const music = (PRICING_DATA.music[style].min + PRICING_DATA.music[style].max) / 2;
    
    const baseTotal = venue + catering + photography + dress + flowers + music;
    const adjustedTotal = baseTotal * regional * seasonal;
    
    return Math.round(adjustedTotal);
  };

  const handleCheckoutIfNeeded = async () => {
    // Check if user selected a paid plan
    const isPaidPlan = weddingData.selectedPlanId && 
      await supabase.from('subscription_plans').select('name').eq('id', weddingData.selectedPlanId).single()
        .then(r => r.data?.name !== 'basic');

    if (isPaidPlan) {
      setCheckoutLoading(true);
      try {
        const { data: planData } = await supabase
          .from('subscription_plans')
          .select('stripe_monthly_price_id, stripe_onetime_price_id')
          .eq('id', weddingData.selectedPlanId!)
          .single();

        const priceId = weddingData.billingType === 'monthly' 
          ? planData?.stripe_monthly_price_id 
          : planData?.stripe_onetime_price_id;

        if (priceId) {
          const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
              price_id: priceId,
              mode: weddingData.billingType === 'monthly' ? 'subscription' : 'payment',
            },
          });
          if (error) throw error;
          if (data?.url) window.open(data.url, '_blank');
        }
      } catch (err) {
        console.error('Checkout error:', err);
      } finally {
        setCheckoutLoading(false);
      }
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save wedding data before completing
      const completeWeddingData = {
        couple: coupleData,
        wedding: {
          ...weddingData,
          estimatedBudget: calculateBudget()
        },
        isSetupComplete: true
      };
      saveWeddingData(completeWeddingData);
      
      // Trigger checkout if paid plan selected
      await handleCheckoutIfNeeded();
      
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    // Step 1: Wedding Date & Season
    {
      title: t('questionnaire.date.title'),
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="date">{t('questionnaire.date.label')}</Label>
            <Input
              id="date"
              type="date"
              value={weddingData.date}
              onChange={(e) => setWeddingData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label>{t('questionnaire.season.label')}</Label>
            <RadioGroup 
              value={weddingData.season} 
              onValueChange={(value: any) => setWeddingData(prev => ({ ...prev, season: value }))}
              className="mt-2"
            >
              {['spring', 'summer', 'autumn', 'winter'].map(season => (
                <div key={season} className="flex items-center space-x-2">
                  <RadioGroupItem value={season} id={season} />
                  <Label htmlFor={season}>{t(`questionnaire.seasons.${season}`)}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      )
    },
    
    // Step 2: Guest Count
    {
      title: t('questionnaire.guests.title'),
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">{weddingData.guestCount}</div>
            <p className="text-muted-foreground">{t('questionnaire.guests.label')}</p>
          </div>
          
          <Slider
            value={[weddingData.guestCount]}
            onValueChange={(value) => setWeddingData(prev => ({ ...prev, guestCount: value[0] }))}
            max={300}
            min={20}
            step={10}
            className="w-full"
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('questionnaire.guests.intimate')} (20-50)</span>
            <span>{t('questionnaire.guests.medium')} (50-150)</span>
            <span>{t('questionnaire.guests.large')} (150+)</span>
          </div>
        </div>
      )
    },
    
    // Step 3: Wedding Style
    {
      title: t('questionnaire.style.title'),
      content: (
        <RadioGroup 
          value={weddingData.style} 
          onValueChange={(value: any) => setWeddingData(prev => ({ ...prev, style: value }))}
          className="space-y-4"
        >
          {['intimate', 'classic', 'luxury'].map(style => (
            <Card key={style} className={`cursor-pointer transition-all ${weddingData.style === style ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={style} id={style} />
                  <Label htmlFor={style} className="cursor-pointer flex-1">
                    <div>
                      <h4 className="font-semibold">{t(`questionnaire.styles.${style}.title`)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t(`questionnaire.styles.${style}.description`)}
                      </p>
                    </div>
                  </Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      )
    },
    
    // Step 4: Region
    {
      title: t('questionnaire.region.title'),
      content: (
        <RadioGroup 
          value={weddingData.region} 
          onValueChange={(value: any) => setWeddingData(prev => ({ ...prev, region: value }))}
          className="space-y-3"
        >
          {['lisboa', 'porto', 'center', 'south', 'islands'].map(region => (
            <div key={region} className="flex items-center space-x-2">
              <RadioGroupItem value={region} id={region} />
              <Label htmlFor={region} className="cursor-pointer">
                {t(`questionnaire.regions.${region}`)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
    },
    
    // Step 5: Priorities
    {
      title: t('questionnaire.priorities.title'),
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">{t('questionnaire.priorities.subtitle')}</p>
          <div className="grid grid-cols-2 gap-3">
            {['venue', 'catering', 'photography', 'dress', 'flowers', 'music'].map(priority => (
              <Button
                key={priority}
                variant={weddingData.priorities.includes(priority) ? "default" : "outline"}
                onClick={() => {
                  const newPriorities = weddingData.priorities.includes(priority)
                    ? weddingData.priorities.filter(p => p !== priority)
                    : [...weddingData.priorities, priority];
                  setWeddingData(prev => ({ ...prev, priorities: newPriorities }));
                }}
                className="justify-start"
              >
                {t(`questionnaire.priorityItems.${priority}`)}
              </Button>
            ))}
          </div>
        </div>
      )
    },
    
    // Step 6: Budget Summary
    {
      title: t('questionnaire.summary.title'),
      content: (
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-2xl font-bold mb-2">{t('questionnaire.summary.estimated')}</h3>
              <div className="text-4xl font-bold text-primary mb-4">
                {formatCurrency(calculateBudget(), currency)}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('questionnaire.summary.basedOn')} {weddingData.guestCount} {t('questionnaire.summary.guests')}
              </p>
            </CardContent>
          </Card>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>{t('questionnaire.summary.style')}:</span>
              <Badge>{t(`questionnaire.styles.${weddingData.style}.title`)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>{t('questionnaire.summary.region')}:</span>
              <Badge variant="outline">{t(`questionnaire.regions.${weddingData.region}`)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>{t('questionnaire.summary.season')}:</span>
              <Badge variant="outline">{t(`questionnaire.seasons.${weddingData.season}`)}</Badge>
            </div>
          </div>
        </div>
      )
    },
    
    // Step 7: Choose Plan & Domain
    {
      title: "Escolha o Seu Plano",
      content: (
        <PlanSelectionStep
          selectedPlanId={weddingData.selectedPlanId}
          billingType={weddingData.billingType}
          desiredDomain={weddingData.desiredDomain}
          wantsDomain={weddingData.wantsDomain}
          onPlanChange={(id) => setWeddingData(prev => ({ ...prev, selectedPlanId: id }))}
          onBillingTypeChange={(type) => setWeddingData(prev => ({ ...prev, billingType: type }))}
          onDomainChange={(domain) => setWeddingData(prev => ({ ...prev, desiredDomain: domain }))}
          onWantsDomainChange={(wants) => setWeddingData(prev => ({ ...prev, wantsDomain: wants }))}
        />
      )
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            {t('questionnaire.title')} - {coupleData.name} & {coupleData.partnerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('questionnaire.step')} {currentStep + 1} {t('questionnaire.of')} {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {currentStep === 0 && <Calendar className="w-5 h-5" />}
              {currentStep === 1 && <Users className="w-5 h-5" />}
              {currentStep === 2 && <Heart className="w-5 h-5" />}
              {currentStep === 3 && <MapPin className="w-5 h-5" />}
              {currentStep === 4 && <Sparkles className="w-5 h-5" />}
              {currentStep === 5 && <DollarSign className="w-5 h-5" />}
              {currentStep === 6 && <CreditCard className="w-5 h-5" />}
              {steps[currentStep].title}
            </h3>
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('questionnaire.back')}
            </Button>
            
            <Button onClick={handleNext} className="btn-gradient" disabled={checkoutLoading}>
              {checkoutLoading ? 'A processar...' : (currentStep === totalSteps - 1 ? t('questionnaire.finish') : t('questionnaire.next'))}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};