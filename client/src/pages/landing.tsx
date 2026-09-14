import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, User, UserCheck, Building, Settings } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";

export default function Landing() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
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
        description: `Welcome! Redirecting to your ${role} dashboard...`,
      });
      setTimeout(() => {
        window.location.href = '/';
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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registration",
      description: "Registration successful! Please login with your credentials.",
    });
    setIsLoginMode(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <Header />
      
      {/* Mountain landscape background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 opacity-50"></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {isLoginMode ? (
            <Card className="shadow-xl border border-border" data-testid="login-form">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-card-foreground mb-2">{t('app_title')}</h1>
                  <p className="text-muted-foreground">Monitoring & Response System</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
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
                  
                  <Button type="submit" className="w-full" data-testid="button-login">
                    {t('login')}
                  </Button>
                </form>
                
                <p className="text-center mt-6 text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium"
                    onClick={() => setIsLoginMode(false)}
                    data-testid="link-register"
                  >
                    Register here
                  </Button>
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border border-border" data-testid="register-form">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <UserCheck className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-card-foreground mb-2">Create Account</h1>
                  <p className="text-muted-foreground">Join Smart Tourist Safety System</p>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="First Name" required data-testid="input-firstname" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Last Name" required data-testid="input-lastname" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="regEmail">{t('email')}</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="Enter your email"
                      required
                      data-testid="input-register-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      required
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={setRole} required>
                      <SelectTrigger data-testid="select-role">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tourist">{t('tourist')}</SelectItem>
                        <SelectItem value="police">{t('police')}</SelectItem>
                        <SelectItem value="tourism">{t('tourism_dept')}</SelectItem>
                        <SelectItem value="admin">{t('admin')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="regPassword">{t('password')}</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      placeholder="Create password"
                      required
                      data-testid="input-register-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      required
                      data-testid="input-confirm-password"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" data-testid="button-register">
                    Create Account
                  </Button>
                </form>
                
                <p className="text-center mt-6 text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium"
                    onClick={() => setIsLoginMode(true)}
                    data-testid="link-login"
                  >
                    Sign in here
                  </Button>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
