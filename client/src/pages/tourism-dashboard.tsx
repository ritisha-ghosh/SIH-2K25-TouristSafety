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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart3,
  MapPin,
  Settings,
  Globe,
  TrendingUp,
  Users,
  Star,
  DollarSign,
  Activity,
  Edit,
  Plus,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TourismDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [newZoneForm, setNewZoneForm] = useState({
    name: "",
    description: "",
    zoneType: "safe",
    capacity: 100,
    riskLevel: "low",
  });

  // Fetch analytics data
  const { data: stats } = useQuery<any>({
    queryKey: ['/api/analytics/tourist-stats'],
    refetchInterval: 30000,
  });

  // Fetch safety zones
  const { data: zones = [] } = useQuery<any[]>({
    queryKey: ['/api/safety-zones'],
    refetchInterval: 30000,
  });

  // Fetch zone occupancy
  const { data: occupancy = [] } = useQuery<any[]>({
    queryKey: ['/api/analytics/zone-occupancy'],
    refetchInterval: 30000,
  });

  // Create zone mutation
  const createZoneMutation = useMutation({
    mutationFn: async (zoneData: any) => {
      return await apiRequest('POST', '/api/safety-zones', {
        ...zoneData,
        coordinates: {
          type: "Polygon",
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] // Default polygon
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Zone Created",
        description: "New safety zone has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/safety-zones'] });
      setNewZoneForm({
        name: "",
        description: "",
        zoneType: "safe",
        capacity: 100,
        riskLevel: "low",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update zone mutation
  const updateZoneMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest('PUT', `/api/safety-zones/${id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Zone Updated",
        description: "Safety zone has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/safety-zones'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    createZoneMutation.mutate(newZoneForm);
  };

  const getZoneTypeColor = (type: string) => {
    switch (type) {
      case 'safe': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'restricted': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case 'high_risk': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-orange-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Tourism Department Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive tourism management and analytics</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Visitors</p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {stats?.totalTourists || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">↑ 23% this month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Zones</p>
                    <p className="text-2xl font-bold text-card-foreground">{zones.length}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  {zones.filter((z: any) => z.currentOccupancy > z.capacity * 0.7).length} high traffic zones
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Safety Rating</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats?.averageSafetyScore || 0}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">Above target (75)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue Impact</p>
                    <p className="text-2xl font-bold text-card-foreground">₹2.4Cr</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-xs text-purple-600 mt-2">This quarter</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tourist Heat Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 text-red-500 mr-2" />
                  Tourist Heat Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Heat map visualization */}
                <div className="bg-gradient-to-br from-green-100 to-red-100 dark:from-green-900 dark:to-red-900 rounded-lg h-80 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mb-2 mx-auto" />
                      <p className="text-muted-foreground">Tourism Heat Map</p>
                      <p className="text-xs text-muted-foreground mt-1">Real-time visitor distribution</p>
                    </div>
                  </div>
                  
                  {/* Heat zones */}
                  <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-red-500 rounded-full opacity-60"></div>
                  <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-orange-500 rounded-full opacity-60"></div>
                  <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-yellow-500 rounded-full opacity-60"></div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-2 text-xs">
                    <div className="flex items-center space-x-1 mb-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>High Traffic</span>
                    </div>
                    <div className="flex items-center space-x-1 mb-1">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Moderate Traffic</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Low Traffic</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-red-600">567</p>
                    <p className="text-xs text-muted-foreground">Kaziranga NP</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">234</p>
                    <p className="text-xs text-muted-foreground">Majuli Island</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-600">123</p>
                    <p className="text-xs text-muted-foreground">Guwahati City</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zone Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 text-blue-500 mr-2" />
                    Zone Management
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedZone('new')}
                    data-testid="button-add-zone"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Zone
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {zones.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No zones configured</p>
                  ) : (
                    zones.map((zone: any) => (
                      <div key={zone.id} className="p-4 border border-border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-card-foreground">{zone.name}</h4>
                          <Badge className={getZoneTypeColor(zone.zoneType)}>
                            {zone.zoneType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Capacity:</span>
                            <span className="ml-2 font-medium text-card-foreground">
                              {zone.currentOccupancy}/{zone.capacity}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Risk Level:</span>
                            <span className={`ml-2 font-medium ${getRiskLevelColor(zone.riskLevel)}`}>
                              {zone.riskLevel}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedZone(zone)}
                            data-testid={`button-edit-zone-${zone.id}`}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Visitor Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
                  Visitor Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Chart placeholder */}
                <div className="bg-muted/30 rounded-lg h-48 mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mb-2 mx-auto" />
                    <p className="text-muted-foreground">Visitor Trends Chart</p>
                    <p className="text-xs text-muted-foreground mt-1">Monthly visitor analytics</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-secondary/50 rounded">
                    <span className="text-sm font-medium text-card-foreground">Peak Season (Oct-Mar):</span>
                    <span className="text-sm text-green-600 font-bold">↑ 45%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-secondary/50 rounded">
                    <span className="text-sm font-medium text-card-foreground">International Visitors:</span>
                    <span className="text-sm text-blue-600 font-bold">28%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-secondary/50 rounded">
                    <span className="text-sm font-medium text-card-foreground">Repeat Visitors:</span>
                    <span className="text-sm text-purple-600 font-bold">37%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-secondary/50 rounded">
                    <span className="text-sm font-medium text-card-foreground">Avg. Stay Duration:</span>
                    <span className="text-sm text-orange-600 font-bold">4.2 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 text-green-500 mr-2" />
                  Multilingual Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-card-foreground">Safety Guidelines</h4>
                      <span className="text-xs text-green-600">11/11 languages</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Last updated: 2 days ago</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-card-foreground">Emergency Procedures</h4>
                      <span className="text-xs text-orange-600">9/11 languages</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Last updated: 1 week ago</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                        Complete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-card-foreground">Tourist Attractions Info</h4>
                      <span className="text-xs text-green-600">11/11 languages</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Last updated: 5 days ago</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Content
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 text-indigo-500 mr-2" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="text-green-500 mt-1 w-5 h-5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground">Zone Capacity Updated</h4>
                        <p className="text-sm text-muted-foreground">
                          Kaziranga National Park capacity increased to 1000 visitors
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated by: Admin Team | 2 hours ago
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Globe className="text-blue-500 mt-1 w-5 h-5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground">Translation Completed</h4>
                        <p className="text-sm text-muted-foreground">
                          Emergency procedures now available in Bengali and Tamil
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Completed by: Content Team | 5 hours ago
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <AlertTriangle className="text-yellow-500 mt-1 w-5 h-5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground">Weather Advisory Issued</h4>
                        <p className="text-sm text-muted-foreground">
                          Heavy rainfall warning for hill areas - tourist advisories sent
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Issued by: Weather Team | 8 hours ago
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <BarChart3 className="text-purple-500 mt-1 w-5 h-5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground">Monthly Report Generated</h4>
                        <p className="text-sm text-muted-foreground">
                          Tourism statistics and safety metrics report for November 2024
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Generated by: Analytics System | Yesterday
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* New Zone Modal */}
          {selectedZone === 'new' && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle>Create New Safety Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateZone} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Zone Name</Label>
                      <Input
                        id="name"
                        value={newZoneForm.name}
                        onChange={(e) => setNewZoneForm({...newZoneForm, name: e.target.value})}
                        placeholder="Enter zone name"
                        required
                        data-testid="input-zone-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newZoneForm.description}
                        onChange={(e) => setNewZoneForm({...newZoneForm, description: e.target.value})}
                        placeholder="Enter zone description"
                        data-testid="textarea-zone-description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zoneType">Zone Type</Label>
                      <Select
                        value={newZoneForm.zoneType}
                        onValueChange={(value) => setNewZoneForm({...newZoneForm, zoneType: value})}
                      >
                        <SelectTrigger data-testid="select-zone-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="safe">Safe</SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                          <SelectItem value="high_risk">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={newZoneForm.capacity}
                        onChange={(e) => setNewZoneForm({...newZoneForm, capacity: parseInt(e.target.value)})}
                        placeholder="Enter capacity"
                        required
                        data-testid="input-zone-capacity"
                      />
                    </div>
                    <div>
                      <Label htmlFor="riskLevel">Risk Level</Label>
                      <Select
                        value={newZoneForm.riskLevel}
                        onValueChange={(value) => setNewZoneForm({...newZoneForm, riskLevel: value})}
                      >
                        <SelectTrigger data-testid="select-risk-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={createZoneMutation.isPending}
                        data-testid="button-create-zone"
                      >
                        {createZoneMutation.isPending ? "Creating..." : "Create Zone"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedZone(null)}
                        data-testid="button-cancel-zone"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
