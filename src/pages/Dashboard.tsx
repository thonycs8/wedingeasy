import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { useWeddingData } from "@/contexts/WeddingContext";
import { useAuth } from "@/hooks/useAuth";
import WeddingDashboard from "@/components/WeddingDashboard";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { weddingData } = useWeddingData();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, don't render anything (will redirect)
  if (!user) {
    return null;
  }

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