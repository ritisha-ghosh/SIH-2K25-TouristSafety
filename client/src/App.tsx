import { Switch, Route, useLocation } from "wouter";
import { useEffect, type ComponentType } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import TouristDashboard from "@/pages/tourist-dashboard";
import PoliceDashboard from "@/pages/police-dashboard";
import TourismDashboard from "@/pages/tourism-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";

const rolePaths = {
  tourist: "/tourist",
  police: "/police",
  tourism: "/tourism",
  admin: "/admin",
} as const;

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-semibold text-foreground">
          Loading Smart Tourist Safety System...
        </h3>
      </div>
    </div>
  );
}

function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? <Home /> : <Landing />;
}

function RoleRoute({
  role,
  dashboard: Dashboard,
}: {
  role: keyof typeof rolePaths;
  dashboard: ComponentType;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setLocation("/");
      return;
    }

    if (user.role !== role) {
      const ownDashboard = rolePaths[user.role as keyof typeof rolePaths];
      setLocation(ownDashboard || "/");
    }
  }, [isLoading, role, setLocation, user]);

  if (isLoading || !user || user.role !== role) {
    return <LoadingScreen />;
  }

  return <Dashboard />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/tourist">
        <RoleRoute role="tourist" dashboard={TouristDashboard} />
      </Route>
      <Route path="/police">
        <RoleRoute role="police" dashboard={PoliceDashboard} />
      </Route>
      <Route path="/tourism">
        <RoleRoute role="tourism" dashboard={TourismDashboard} />
      </Route>
      <Route path="/admin">
        <RoleRoute role="admin" dashboard={AdminDashboard} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
