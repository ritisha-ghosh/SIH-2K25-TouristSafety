import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, User, Building, Settings } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useLanguage();
  const { toast } = useToast();

  const demoLoginMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await apiRequest('POST', '/api/auth/demo-login', { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "Welcome! Redirecting to your dashboard...",
      });
      setTimeout(() => {
        window.location.href = '/api/login';
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleQuickLogin = (role: string) => {
    demoLoginMutation.mutate(role);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/api/login';
  };

  return (
    <Card className="shadow-xl border border-border" data-testid="login-form">
      <CardHeader className="text-center">
        <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
        <CardTitle className="text-2xl font-bold text-card-foreground mb-2">
          {t('app_title')}
        </CardTitle>
        <p className="text-muted-foreground">Monitoring & Response System</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-card-foreground">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              data-testid="input-email"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-card-foreground">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              data-testid="input-password"
            />
          </div>
          
          <Button type="submit" className="w-full" data-testid="button-login">
            {t('login')}
          </Button>
        </form>

        {/* Quick Login Options */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3 font-medium">Quick Demo Access:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="default"
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handleQuickLogin('tourist')}
                disabled={demoLoginMutation.isPending}
                data-testid="button-tourist-demo"
              >
                <User className="w-4 h-4 mr-1" />
                {t('tourist')}
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleQuickLogin('police')}
                disabled={demoLoginMutation.isPending}
                data-testid="button-police-demo"
              >
                <Shield className="w-4 h-4 mr-1" />
                {t('police')}
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => handleQuickLogin('tourism')}
                disabled={demoLoginMutation.isPending}
                data-testid="button-tourism-demo"
              >
                <Building className="w-4 h-4 mr-1" />
                Tourism
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => handleQuickLogin('admin')}
                disabled={demoLoginMutation.isPending}
                data-testid="button-admin-demo"
              >
                <Settings className="w-4 h-4 mr-1" />
                {t('admin')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={onSwitchToRegister}
            data-testid="link-register"
          >
            Register here
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}
