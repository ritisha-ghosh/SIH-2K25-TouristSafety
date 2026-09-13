import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useToast } from "@/hooks/use-toast";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Registration Successful",
      description: "Account created successfully! Please login with your credentials.",
    });
    onSwitchToLogin();
  };

  return (
    <Card className="shadow-xl border border-border" data-testid="register-form">
      <CardHeader className="text-center">
        <UserCheck className="h-16 w-16 text-primary mx-auto mb-4" />
        <CardTitle className="text-2xl font-bold text-card-foreground mb-2">
          Create Account
        </CardTitle>
        <p className="text-muted-foreground">Join Smart Tourist Safety System</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="First Name"
                required
                data-testid="input-firstname"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Last Name"
                required
                data-testid="input-lastname"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="regEmail">{t('email')}</Label>
            <Input
              id="regEmail"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
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
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              required
              data-testid="input-phone"
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleChange('role', value)} required>
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
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
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
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
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
            onClick={onSwitchToLogin}
            data-testid="link-login"
          >
            Sign in here
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}
