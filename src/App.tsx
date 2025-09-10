import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { Reader } from "./pages/Reader";
import Vocabulary from "./pages/Vocabulary";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import { useAuth } from "./hooks/useAuth";
import { initLocale } from "./lib/i18n";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    const loadLocale = async () => {
      if (user) {
        await initLocale();
      }
    };
    loadLocale();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const OnboardingGate = ({ children }: { children: JSX.Element }) => {
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    if (!user.user_metadata?.onboarding_completed) {
      return <Navigate to="/onboarding" replace />;
    }
    return children;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={<OnboardingGate><Index /></OnboardingGate>}
            />
            <Route 
              path="/reader/:bookId" 
              element={<OnboardingGate><Reader /></OnboardingGate>}
            />
            <Route 
              path="/vocabulary" 
              element={<OnboardingGate><Vocabulary /></OnboardingGate>}
            />
            <Route
              path="/settings"
              element={<OnboardingGate><Settings /></OnboardingGate>}
            />
            <Route
              path="/onboarding"
              element={user ? <Onboarding /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/help"
              element={user ? <Help /> : <Navigate to="/auth" replace />}
            />
            <Route 
              path="/auth" 
              element={!user ? <Auth /> : <Navigate to="/" replace />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
