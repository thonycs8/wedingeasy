import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart,
  Mail,
  User,
  ArrowRight,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { WeddingQuestionnaireModal } from "@/components/WeddingQuestionnaireModal";

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignupModal = ({ open, onOpenChange }: SignupModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<'signup' | 'questionnaire' | 'dashboard'>('signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    partnerName: '',
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.partnerName) {
      setStep('questionnaire');
    }
  };

  const handleQuestionnaireComplete = () => {
    setStep('dashboard');
    // Redirect to dashboard after brief delay
    setTimeout(() => {
      onOpenChange(false);
      setStep('signup');
      // Navigate using React Router instead of window.location
      navigate('/dashboard');
    }, 2000);
  };

  if (step === 'questionnaire') {
    return (
      <WeddingQuestionnaireModal 
        open={open}
        onOpenChange={onOpenChange}
        onComplete={handleQuestionnaireComplete}
        coupleData={formData}
      />
    );
  }

  if (step === 'dashboard') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t('signup.success.title')}</h3>
            <p className="text-muted-foreground mb-4">{t('signup.success.message')}</p>
            <div className="animate-pulse">
              <Sparkles className="w-8 h-8 text-primary mx-auto" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            {t('signup.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Benefits */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('signup.benefits.title')}</h3>
              <div className="space-y-3">
                {[
                  t('signup.benefits.calculator'),
                  t('signup.benefits.budget'),
                  t('signup.benefits.timeline'),
                  t('signup.benefits.guests'),
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
                  {t('signup.guarantee.badge')}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {t('signup.guarantee.text')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('signup.form.yourName')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder={t('signup.form.yourNamePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">{t('signup.form.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('signup.form.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="partnerName">{t('signup.form.partnerName')}</Label>
              <div className="relative">
                <Heart className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="partnerName"
                  placeholder={t('signup.form.partnerNamePlaceholder')}
                  value={formData.partnerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, partnerName: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="btn-gradient w-full">
              {t('signup.form.continue')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              {t('signup.form.privacy')}
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};