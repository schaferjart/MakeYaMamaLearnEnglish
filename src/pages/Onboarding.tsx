import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { OnboardingContent } from "@/components/OnboardingContent";
import { t } from "@/lib/i18n";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCompleteOnboarding = async () => {
    if (user) {
      const { error } = await supabase.auth.updateUser({
        data: { onboarding_completed: true },
      });
      if (error) {
        console.error("Error updating user metadata:", error);
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <OnboardingContent />
      <div className="text-center mt-8">
        <Button size="lg" onClick={handleCompleteOnboarding}>
          {t("onboarding.getStarted")}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
