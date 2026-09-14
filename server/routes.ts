import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertTouristProfileSchema,
  insertIncidentSchema,
  insertSafetyZoneSchema,
  insertAlertSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get tourist profile if user is a tourist
      let touristProfile = null;
      if (user.role === 'tourist') {
        touristProfile = await storage.getTouristProfile(userId);
      }
      
      res.json({ user, touristProfile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Demo login endpoints for quick access
  app.post('/api/auth/demo-login', async (req, res) => {
    try {
      const { role } = req.body;
      
      const demoUsers = {
        tourist: {
          id: 'demo-tourist-001',
          email: 'tourist@demo.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'tourist',
          phoneNumber: '+91 98765 43210',
        },
        police: {
          id: 'demo-police-001',
          email: 'police@demo.com',
          firstName: 'Officer',
          lastName: 'Patel',
          role: 'police',
          phoneNumber: '+91 98765 43211',
        },
        tourism: {
          id: 'demo-tourism-001',
          email: 'tourism@demo.com',
          firstName: 'Director',
          lastName: 'Singh',
          role: 'tourism',
          phoneNumber: '+91 98765 43212',
        },
        admin: {
          id: 'demo-admin-001',
          email: 'admin@demo.com',
          firstName: 'System',
          lastName: 'Admin',
          role: 'admin',
          phoneNumber: '+91 98765 43213',
        },
      };

      const userData = demoUsers[role as keyof typeof demoUsers];
      if (!userData) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Upsert demo user
      const user = await storage.upsertUser(userData);
      
      // Create tourist profile if needed
      let touristProfile = null;
      if (role === 'tourist') {
        touristProfile = await storage.getTouristProfile(user.id);
        if (!touristProfile) {
          touristProfile = await storage.createTouristProfile({
            userId: user.id,
            touristId: `TID-2024-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
            nationality: 'Indian',
            emergencyContactName: 'Jane Doe',
            emergencyContactPhone: '+91 98765 43220',
            checkInLocation: 'Hotel Paradise, Guwahati',
            safetyScore: 87,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          });
        }
      }

      // Establish a real session for the selected demo user. Redirecting to
      // /api/login here would replace the demo role with the Replit account.
      const demoSessionUser = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          profile_image_url: user.profileImageUrl,
        },
        expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      };

      await new Promise<void>((resolve, reject) => {
        req.login(demoSessionUser, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      res.json({ user, touristProfile });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ message: "Demo login failed" });
    }
  });

  // Tourist routes
  app.get('/api/tourists', isAuthenticated, async (req, res) => {
    try {
      const tourists = await storage.getAllActiveTourists();
      res.json(tourists);
    } catch (error) {
      console.error("Error fetching tourists:", error);
      res.status(500).json({ message: "Failed to fetch tourists" });
    }
  });

  app.post('/api/tourists/:id/location', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { latitude, longitude, accuracy, address } = req.body;
      
      const location = await storage.addTouristLocation({
        touristProfileId: id,
        latitude,
        longitude,
        accuracy,
        address,
      });
      
      res.json(location);
    } catch (error) {
      console.error("Error adding location:", error);
      res.status(500).json({ message: "Failed to add location" });
    }
  });

  app.get('/api/tourists/:id/locations', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const locations = await storage.getTouristLocations(id, limit);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Safety zones routes
  app.get('/api/safety-zones', isAuthenticated, async (req, res) => {
    try {
      const zones = await storage.getAllSafetyZones();
      res.json(zones);
    } catch (error) {
      console.error("Error fetching safety zones:", error);
      res.status(500).json({ message: "Failed to fetch safety zones" });
    }
  });

  app.post('/api/safety-zones', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSafetyZoneSchema.parse(req.body);
      const zone = await storage.createSafetyZone(validatedData);
      res.json(zone);
    } catch (error) {
      console.error("Error creating safety zone:", error);
      res.status(500).json({ message: "Failed to create safety zone" });
    }
  });

  app.put('/api/safety-zones/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const zone = await storage.updateSafetyZone(id, updates);
      res.json(zone);
    } catch (error) {
      console.error("Error updating safety zone:", error);
      res.status(500).json({ message: "Failed to update safety zone" });
    }
  });

  // Incidents routes
  app.get('/api/incidents', isAuthenticated, async (req, res) => {
    try {
      const filters = req.query;
      const incidents = await storage.getIncidents(filters as any);
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.post('/api/incidents', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(validatedData);
      
      // Create alert for emergency incidents
      if (incident.priority === 'critical' || incident.incidentType === 'panic') {
        await storage.createAlert({
          alertType: 'security',
          title: `${incident.incidentType.toUpperCase()}: ${incident.title}`,
          message: incident.description || `Emergency incident reported: ${incident.title}`,
          severity: 'critical',
          targetRole: 'police',
        });
      }
      
      res.json(incident);
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(500).json({ message: "Failed to create incident" });
    }
  });

  app.put('/api/incidents/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (updates.status === 'resolved' && !updates.resolvedAt) {
        updates.resolvedAt = new Date();
      }
      
      const incident = await storage.updateIncident(id, updates);
      res.json(incident);
    } catch (error) {
      console.error("Error updating incident:", error);
      res.status(500).json({ message: "Failed to update incident" });
    }
  });

  // Panic button endpoint
  app.post('/api/panic', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      const touristProfile = await storage.getTouristProfile(userId);
      
      if (!touristProfile) {
        return res.status(404).json({ message: "Tourist profile not found" });
      }
      
      const { latitude, longitude, address } = req.body;
      
      // Create critical incident
      const incident = await storage.createIncident({
        touristProfileId: touristProfile.id,
        incidentType: 'panic',
        priority: 'critical',
        title: 'Emergency Panic Button Activated',
        description: `Tourist ${touristProfile.touristId} has activated the emergency panic button.`,
        location: { lat: latitude, lng: longitude, address },
      });
      
      // Create alert for police
      await storage.createAlert({
        alertType: 'security',
        title: '🚨 EMERGENCY: Panic Button Activated',
        message: `Tourist ${touristProfile.touristId} has activated emergency panic button at ${address || 'Unknown location'}`,
        severity: 'critical',
        targetRole: 'police',
      });
      
      // Add location record
      if (latitude && longitude) {
        await storage.addTouristLocation({
          touristProfileId: touristProfile.id,
          latitude,
          longitude,
          address,
        });
      }
      
      res.json({ message: "Emergency alert sent successfully", incident });
    } catch (error) {
      console.error("Panic button error:", error);
      res.status(500).json({ message: "Failed to send emergency alert" });
    }
  });

  // Alerts routes
  app.get('/api/alerts', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      const user = await storage.getUser(userId);
      
      const alerts = await storage.getAlerts(userId, user?.role);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.put('/api/alerts/:id/read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markAlertAsRead(id);
      res.json({ message: "Alert marked as read" });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  app.get('/api/alerts/count', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      const user = await storage.getUser(userId);
      
      const count = await storage.getUnreadAlertsCount(userId, user?.role);
      res.json(count);
    } catch (error) {
      console.error("Error fetching unread alerts count:", error);
      res.status(500).json({ message: "Failed to fetch unread alerts count" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/tourist-stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getTouristStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching tourist stats:", error);
      res.status(500).json({ message: "Failed to fetch tourist stats" });
    }
  });

  app.get('/api/analytics/zone-occupancy', isAuthenticated, async (req, res) => {
    try {
      const occupancy = await storage.getZoneOccupancy();
      res.json(occupancy);
    } catch (error) {
      console.error("Error fetching zone occupancy:", error);
      res.status(500).json({ message: "Failed to fetch zone occupancy" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'subscribe_alerts':
            // Subscribe to alerts for specific role/user
            ws.send(JSON.stringify({ type: 'subscribed', channel: 'alerts' }));
            break;
          case 'location_update':
            // Broadcast location update to relevant clients
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'location_update',
                  data: data.data
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
