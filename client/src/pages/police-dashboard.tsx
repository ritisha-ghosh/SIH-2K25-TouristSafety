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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  Users, 
  Clock, 
  FileText, 
  Phone, 
  MapPin, 
  Shield, 
  Radio,
  Siren,
  UserX,
  Map,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PoliceDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [incidentFilter, setIncidentFilter] = useState("all");

  // Fetch analytics data
  const { data: stats } = useQuery<any>({
    queryKey: ['/api/analytics/tourist-stats'],
    refetchInterval: 30000,
  });

  // Fetch incidents
  const { data: incidents = [] } = useQuery<any[]>({
    queryKey: ['/api/incidents'],
    refetchInterval: 15000,
  });

  // Fetch tourists
  const { data: tourists = [] } = useQuery({
    queryKey: ['/api/tourists'],
    refetchInterval: 30000,
  });

  // Fetch alerts
  const { data: alerts = [] } = useQuery<any[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 30000,
  });

  // Update incident mutation
  const updateIncidentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest('PUT', `/api/incidents/${id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Incident Updated",
        description: "Incident status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAssignIncident = (incidentId: string) => {
    updateIncidentMutation.mutate({
      id: incidentId,
      updates: {
        assignedOfficer: user?.id || '',
        status: 'investigating',
      },
    });
  };

  const handleResolveIncident = (incidentId: string) => {
    updateIncidentMutation.mutate({
      id: incidentId,
      updates: {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
      },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredIncidents = incidents.filter((incident: any) => {
    if (incidentFilter === 'all') return true;
    if (incidentFilter === 'open') return incident.status === 'open';
    if (incidentFilter === 'assigned') return incident.assignedOfficer === user?.id;
    if (incidentFilter === 'critical') return incident.priority === 'critical';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Police Command Center</h1>
            <p className="text-muted-foreground">Real-time tourist monitoring and emergency response</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Tourists</p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {stats?.activeTourists || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">
                  {stats?.totalTourists || 0} total registered
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {alerts.filter((a: any) => !a.isRead).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-xs text-orange-600 mt-2">
                  {alerts.filter((a: any) => a.severity === 'critical').length} critical
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                    <p className="text-2xl font-bold text-green-600">4.2m</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">Average response time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Incidents Today</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats?.incidentsToday || 0}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-xs text-red-600 mt-2">All resolved</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Tourist Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Map className="w-5 h-5 text-blue-500 mr-2" />
                  Real-time Tourist Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Interactive map placeholder */}
                <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg h-80 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="w-12 h-12 text-muted-foreground mb-2 mx-auto" />
                      <p className="text-muted-foreground">Police Command Map</p>
                      <p className="text-xs text-muted-foreground mt-1">Real-time tourist tracking</p>
                    </div>
                  </div>
                  
                  {/* Tourist cluster markers */}
                  <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                    23
                  </div>
                  <div className="absolute top-2/3 left-1/2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                    8
                  </div>
                  <div className="absolute top-1/2 right-1/4 w-10 h-10 bg-orange-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                    45
                  </div>
                  
                  {/* Alert marker */}
                  <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-muted-foreground">Tourist Groups</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-muted-foreground">Active Alerts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Incidents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    Active Incidents
                  </div>
                  <Select value={incidentFilter} onValueChange={setIncidentFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="assigned">Assigned to Me</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredIncidents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No incidents found</p>
                  ) : (
                    filteredIncidents.map((incident: any) => (
                      <div
                        key={incident.id}
                        className={`border-l-4 pl-4 py-2 ${
                          incident.priority === 'critical' ? 'border-red-500' :
                          incident.priority === 'high' ? 'border-orange-500' :
                          incident.priority === 'medium' ? 'border-yellow-500' :
                          'border-green-500'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getPriorityColor(incident.priority)}>
                                {incident.priority.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {incident.incidentType}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-card-foreground">{incident.title}</h4>
                            <p className="text-sm text-muted-foreground">{incident.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(incident.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-1 ml-4">
                            {incident.status === 'open' && (
                              <Button
                                size="sm"
                                onClick={() => handleAssignIncident(incident.id)}
                                disabled={updateIncidentMutation.isPending}
                                data-testid={`button-assign-${incident.id}`}
                              >
                                Assign
                              </Button>
                            )}
                            {incident.assignedOfficer === user?.id && incident.status !== 'resolved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveIncident(incident.id)}
                                disabled={updateIncidentMutation.isPending}
                                data-testid={`button-resolve-${incident.id}`}
                              >
                                Resolve
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedIncident(incident)}
                              data-testid={`button-details-${incident.id}`}
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Response Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 text-green-500 mr-2" />
                  Emergency Response Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Button className="bg-red-600 hover:bg-red-700 text-white p-4 h-auto flex-col">
                    <Siren className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Dispatch Unit</span>
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto flex-col">
                    <Radio className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Send Alert</span>
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white p-4 h-auto flex-col">
                    <Phone className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Medical Support</span>
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white p-4 h-auto flex-col">
                    <MapPin className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Air Support</span>
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-medium text-card-foreground mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="secondary" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate E-FIR
                    </Button>
                    <Button variant="secondary" className="w-full justify-start">
                      <Search className="w-4 h-4 mr-2" />
                      Tourist Lookup
                    </Button>
                    <Button variant="secondary" className="w-full justify-start">
                      <MapPin className="w-4 h-4 mr-2" />
                      Track Last Route
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tourist Details Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserX className="w-5 h-5 text-indigo-500 mr-2" />
                  Tourist Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedIncident ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <UserX className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-card-foreground">Incident Details</h4>
                          <p className="text-sm text-muted-foreground">{selectedIncident.title}</p>
                          <Badge className={`${getPriorityColor(selectedIncident.priority)} text-white mt-1`}>
                            {selectedIncident.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <span className="ml-2 font-medium text-card-foreground">
                            {selectedIncident.incidentType}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <span className="ml-2 font-medium text-card-foreground">
                            {selectedIncident.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="ml-2 font-medium text-card-foreground">
                            {new Date(selectedIncident.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {selectedIncident.location && (
                          <div>
                            <span className="text-muted-foreground">Location:</span>
                            <span className="ml-2 font-medium text-card-foreground">
                              {selectedIncident.location.address || 'Unknown location'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Tourist
                      </Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <Users className="w-4 h-4 mr-2" />
                        Contact Emergency
                      </Button>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <MapPin className="w-4 h-4 mr-2" />
                        Track Location
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select an incident to view tourist details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
