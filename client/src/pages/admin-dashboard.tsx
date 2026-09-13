import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/language-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Activity,
  Users,
  Wifi,
  Database,
  Settings,
  Bell,
  Shield,
  RefreshCw,
  Trash2,
  Edit,
  Plus,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userFilter, setUserFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch system stats
  const { data: stats } = useQuery<any>({
    queryKey: ['/api/analytics/tourist-stats'],
    refetchInterval: 30000,
  });

  // Fetch all users (this would need to be implemented on the backend)
  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: false, // Disabled for now since endpoint doesn't exist
  });

  // Mock system health data
  const systemHealth = {
    uptime: 98.7,
    responseTime: 245,
    cpuUsage: 34,
    memoryUsage: 67,
    diskUsage: 78,
  };

  // Mock alert settings
  const [alertSettings, setAlertSettings] = useState({
    emergencyAlerts: true,
    geofenceViolations: true,
    systemHealth: true,
    dailyReports: false,
  });

  const handleAlertSettingChange = (setting: string, value: boolean) => {
    setAlertSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    toast({
      title: "Settings Updated",
      description: `${setting} has been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const mockUsers = [
    {
      id: 'demo-tourist-001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'tourist@demo.com',
      role: 'tourist',
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'demo-police-001',
      firstName: 'Officer',
      lastName: 'Patel',
      email: 'police@demo.com',
      role: 'police',
      isActive: true,
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: 'demo-tourism-001',
      firstName: 'Director',
      lastName: 'Singh',
      email: 'tourism@demo.com',
      role: 'tourism',
      isActive: true,
      createdAt: '2024-01-05T10:00:00Z'
    },
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesFilter = userFilter === 'all' || user.role === userFilter;
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'tourist': return 'bg-blue-500';
      case 'police': return 'bg-red-500';
      case 'tourism': return 'bg-green-500';
      case 'admin': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">System Administration</h1>
            <p className="text-muted-foreground">Complete system management and configuration</p>
          </div>

          {/* System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">System Health</p>
                    <p className="text-2xl font-bold text-green-600">{systemHealth.uptime}%</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">All systems operational</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {stats?.totalTourists || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-blue-600 mt-2">↑ 156 new this month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Sessions</p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {stats?.activeTourists || 0}
                    </p>
                  </div>
                  <Wifi className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">Peak: 1,456 users</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Data Storage</p>
                    <p className="text-2xl font-bold text-card-foreground">{systemHealth.diskUsage}%</p>
                  </div>
                  <Database className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-xs text-orange-600 mt-2">2.4TB of 3TB used</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-500 mr-2" />
                    User Management
                  </div>
                  <Button size="sm" data-testid="button-add-user">
                    <Plus className="w-4 h-4 mr-1" />
                    Add User
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and filters */}
                <div className="flex space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-users"
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="tourist">{t('tourist')}</SelectItem>
                      <SelectItem value="police">{t('police')}</SelectItem>
                      <SelectItem value="tourism">Tourism</SelectItem>
                      <SelectItem value="admin">{t('admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* User list */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No users found</p>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${getRoleColor(user.role)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                            {getUserInitials(user.firstName, user.lastName)}
                          </div>
                          <div>
                            <h4 className="font-medium text-card-foreground">
                              {user.firstName} {user.lastName}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {user.email} | {user.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUser(user)}
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button className="flex-1" data-testid="button-export-users">
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 text-purple-500 mr-2" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-card-foreground">Security Settings</h4>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Two-Factor Auth:</span>
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Enabled
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Session Timeout:</span>
                        <span className="text-card-foreground">30 minutes</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Password Policy:</span>
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Strong
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-card-foreground">API Configuration</h4>
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rate Limiting:</span>
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Active
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">API Keys:</span>
                        <span className="text-card-foreground">12 active</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Endpoints:</span>
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          All operational
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-card-foreground">Backup & Recovery</h4>
                      <Button size="sm" variant="outline">Schedule</Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Backup:</span>
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          2 hours ago
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Backup Size:</span>
                        <span className="text-card-foreground">847 MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Recovery Point:</span>
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          15 min
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 text-indigo-500 mr-2" />
                  System Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Performance metrics */}
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-card-foreground">Response Time</span>
                      <span className="text-green-600 font-bold">{systemHealth.responseTime}ms</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-card-foreground">CPU Usage</span>
                      <span className="text-blue-600 font-bold">{systemHealth.cpuUsage}%</span>
                    </div>
                    <Progress value={systemHealth.cpuUsage} className="h-2" />
                  </div>
                  
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-card-foreground">Memory Usage</span>
                      <span className="text-purple-600 font-bold">{systemHealth.memoryUsage}%</span>
                    </div>
                    <Progress value={systemHealth.memoryUsage} className="h-2" />
                  </div>
                  
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-card-foreground">Disk Usage</span>
                      <span className="text-orange-600 font-bold">{systemHealth.diskUsage}%</span>
                    </div>
                    <Progress value={systemHealth.diskUsage} className="h-2" />
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium text-card-foreground mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="bg-red-600 hover:bg-red-700 text-white text-xs p-2 h-auto">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Restart Services
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs p-2 h-auto">
                      <Database className="w-3 h-3 mr-1" />
                      Clear Cache
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white text-xs p-2 h-auto">
                      <Download className="w-3 h-3 mr-1" />
                      Export Logs
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs p-2 h-auto">
                      <Shield className="w-3 h-3 mr-1" />
                      Security Scan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 text-yellow-500 mr-2" />
                  Alert Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-medium text-card-foreground">Emergency Alerts</h4>
                        <p className="text-sm text-muted-foreground">
                          Instant notifications for panic button activations and missing persons
                        </p>
                      </div>
                      <Switch
                        checked={alertSettings.emergencyAlerts}
                        onCheckedChange={(checked) => handleAlertSettingChange('emergencyAlerts', checked)}
                        data-testid="switch-emergency-alerts"
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-medium text-card-foreground">Geo-fence Violations</h4>
                        <p className="text-sm text-muted-foreground">
                          Alerts when tourists enter restricted or high-risk areas
                        </p>
                      </div>
                      <Switch
                        checked={alertSettings.geofenceViolations}
                        onCheckedChange={(checked) => handleAlertSettingChange('geofenceViolations', checked)}
                        data-testid="switch-geofence-alerts"
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-medium text-card-foreground">System Health</h4>
                        <p className="text-sm text-muted-foreground">
                          Notifications for system performance and maintenance issues
                        </p>
                      </div>
                      <Switch
                        checked={alertSettings.systemHealth}
                        onCheckedChange={(checked) => handleAlertSettingChange('systemHealth', checked)}
                        data-testid="switch-system-alerts"
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-medium text-card-foreground">Daily Reports</h4>
                        <p className="text-sm text-muted-foreground">
                          Automated daily summary reports via email
                        </p>
                      </div>
                      <Switch
                        checked={alertSettings.dailyReports}
                        onCheckedChange={(checked) => handleAlertSettingChange('dailyReports', checked)}
                        data-testid="switch-daily-reports"
                      />
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white">
                  <Bell className="w-4 h-4 mr-2" />
                  Save Alert Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
