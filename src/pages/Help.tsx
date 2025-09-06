import { Button } from "@/components/ui/button";
import { OnboardingContent } from "@/components/OnboardingContent";
import { Link } from "react-router-dom";

const Help = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <OnboardingContent />
      <div className="text-center mt-8">
        <Button size="lg" asChild>
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default Help;
