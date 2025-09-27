import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useWeddingData } from "@/contexts/WeddingContext";
import WeddingDashboard from "@/components/WeddingDashboard";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { weddingData } = useWeddingData();

  // If no wedding data exists, show onboarding message
  if (!weddingData || !weddingData.isSetupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-6">
        <Card className="card-romantic max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">
              {t('dashboard.welcome.title')}
            </h2>
            
            <p className="text-muted-foreground mb-6">
              {t('dashboard.welcome.subtitle')}
            </p>
            
            <Button 
              onClick={() => navigate('/')}
              className="btn-gradient w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('dashboard.welcome.cta')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <WeddingDashboard />;
};

export default Dashboard;