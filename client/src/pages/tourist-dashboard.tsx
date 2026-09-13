import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/language-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, MapPin, Route, Bell, Clock, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TouristDashboard() {
  const { user, touristProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number; address?: string} | null>(null);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
        }
      );
    }
  }, []);

  // Panic button mutation
  const panicMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/panic', {
        latitude: currentLocation?.lat,
        longitude: currentLocation?.lng,
        address: currentLocation?.address || 'Current Location',
      });
    },
    onSuccess: () => {
      toast({
        title: "Emergency Alert Sent!",
        description: "Police units have been notified of your emergency. Help is on the way.",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
    },
    onError: (error) => {
      toast({
        title: "Emergency Alert Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch alerts
  const { data: alerts = [] } = useQuery<any[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 30000,
  });

  // Calculate safety score color
  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return "safety-score-excellent";
    if (score >= 60) return "safety-score-good";
    if (score >= 40) return "safety-score-moderate";
    return "safety-score-poor";
  };

  const getSafetyScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Moderate";
    return "Poor";
  };

  if (!touristProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Tourist Profile Not Found</h1>
            <p className="text-muted-foreground">Please contact support to set up your tourist profile.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('dashboard')} - {t('tourist')}</h1>
            <p className="text-muted-foreground">Your personal safety companion and travel guide</p>
          </div>

          {/* Emergency Panic Button */}
          <div className="mb-6">
            <Button
              size="lg"
              className={`w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-bold shadow-lg transition-all duration-200 hover:shadow-xl ${
                panicMutation.isPending ? 'animate-pulse' : 'animate-pulse-slow'
              }`}
              onClick={() => panicMutation.mutate()}
              disabled={panicMutation.isPending}
              data-testid="button-panic"
            >
              <AlertTriangle className="w-6 h-6 mr-2" />
              {panicMutation.isPending ? 'SENDING ALERT...' : 'EMERGENCY PANIC BUTTON'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Digital Tourist ID */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 text-primary mr-2" />
                    {t('digital_id')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg p-6 text-white mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold mb-1">
                          {user?.firstName} {user?.lastName}
                        </h3>
                        <p className="text-blue-100 mb-2">
                          Tourist ID: {touristProfile.touristId}
                        </p>
                        <p className="text-sm text-blue-100">
                          Valid until: {new Date(touristProfile.validUntil || '').toLocaleDateString()}
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                        <div className="text-primary text-2xl font-mono">QR</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-400">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-100">Nationality:</span>
                          <span className="ml-2 font-medium">{touristProfile.nationality}</span>
                        </div>
                        <div>
                          <span className="text-blue-100">Status:</span>
                          <span className="ml-2 font-medium">
                            {touristProfile.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-card-foreground">Emergency Contact:</strong>
                      <p className="text-muted-foreground">{touristProfile.emergencyContactPhone}</p>
                      <p className="text-muted-foreground">{touristProfile.emergencyContactName}</p>
                    </div>
                    <div>
                      <strong className="text-card-foreground">Check-in:</strong>
                      <p className="text-muted-foreground">{touristProfile.checkInLocation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Safety Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 text-green-500 mr-2" />
                  {t('safety_score')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`w-24 h-24 mx-auto rounded-full ${getSafetyScoreColor(touristProfile.safetyScore || 0)} flex items-center justify-center mb-4`}>
                    <span className="text-3xl font-bold text-white">
                      {touristProfile.safetyScore}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    {getSafetyScoreLabel(touristProfile.safetyScore || 0)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You're in a safe zone with good travel patterns
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Location Safety:</span>
                      <span className="text-green-600 font-medium">High</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Activity Pattern:</span>
                      <span className="text-green-600 font-medium">Normal</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Communication:</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Location & Geo-fencing */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                    {t('current_location')} & Geo-fencing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Map placeholder */}
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg h-64 mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-muted-foreground mb-2 mx-auto" />
                        <p className="text-muted-foreground">Interactive Map</p>
                        <p className="text-xs text-muted-foreground mt-1">Real-time location tracking</p>
                      </div>
                    </div>
                    
                    {/* Location marker */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                    </div>
                    
                    {/* Safe zone indicator */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Safe Zone
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-card-foreground">Current Location:</strong>
                      <p className="text-muted-foreground">Kaziranga National Park</p>
                      <p className="text-xs text-muted-foreground">Last updated: 2 mins ago</p>
                    </div>
                    <div>
                      <strong className="text-card-foreground">Zone Status:</strong>
                      <p className="text-green-600 font-medium">Safe Tourist Area</p>
                      <p className="text-xs text-muted-foreground">No restrictions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trip Itinerary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Route className="w-5 h-5 text-purple-500 mr-2" />
                  {t('itinerary')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">Kaziranga National Park</h4>
                      <p className="text-sm text-muted-foreground">Today, 9:00 AM - 6:00 PM</p>
                      <Badge variant="secondary" className="text-xs mt-1">Currently here</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">Majuli Island</h4>
                      <p className="text-sm text-muted-foreground">Tomorrow, 8:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">Guwahati City Tour</h4>
                      <p className="text-sm text-muted-foreground">Day 3, 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="secondary" className="w-full mt-4">
                  View Full Itinerary
                </Button>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 text-yellow-500 mr-2" />
                    Recent {t('alerts')} & Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No recent alerts</p>
                    ) : (
                      alerts.slice(0, 3).map((alert: any) => (
                        <div
                          key={alert.id}
                          className={`flex items-start space-x-3 p-3 rounded-lg ${
                            alert.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20' :
                            alert.severity === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                            alert.severity === 'error' ? 'bg-orange-50 dark:bg-orange-900/20' :
                            'bg-blue-50 dark:bg-blue-900/20'
                          }`}
                        >
                          {alert.severity === 'critical' ? (
                            <AlertTriangle className="text-red-500 mt-1 w-4 h-4" />
                          ) : alert.severity === 'warning' ? (
                            <AlertTriangle className="text-yellow-500 mt-1 w-4 h-4" />
                          ) : (
                            <Info className="text-blue-500 mt-1 w-4 h-4" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-card-foreground">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
