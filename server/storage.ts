import {
  users,
  touristProfiles,
  touristLocations,
  safetyZones,
  incidents,
  itineraries,
  alerts,
  content,
  systemSettings,
  type User,
  type UpsertUser,
  type TouristProfile,
  type InsertTouristProfile,
  type SafetyZone,
  type InsertSafetyZone,
  type Incident,
  type InsertIncident,
  type Alert,
  type InsertAlert,
  type TouristLocation,
  type InsertTouristLocation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByRole(role: string): Promise<User[]>;
  
  // Tourist operations
  createTouristProfile(profile: InsertTouristProfile): Promise<TouristProfile>;
  getTouristProfile(userId: string): Promise<TouristProfile | undefined>;
  getTouristProfileByTouristId(touristId: string): Promise<TouristProfile | undefined>;
  updateTouristProfile(id: string, updates: Partial<TouristProfile>): Promise<TouristProfile>;
  getAllActiveTourists(): Promise<(TouristProfile & { user: User })[]>;
  
  // Location tracking
  addTouristLocation(location: InsertTouristLocation): Promise<TouristLocation>;
  getTouristLocations(touristProfileId: string, limit?: number): Promise<TouristLocation[]>;
  getLatestTouristLocation(touristProfileId: string): Promise<TouristLocation | undefined>;
  
  // Safety zones
  createSafetyZone(zone: InsertSafetyZone): Promise<SafetyZone>;
  getAllSafetyZones(): Promise<SafetyZone[]>;
  getSafetyZone(id: string): Promise<SafetyZone | undefined>;
  updateSafetyZone(id: string, updates: Partial<SafetyZone>): Promise<SafetyZone>;
  deleteSafetyZone(id: string): Promise<void>;
  
  // Incidents
  createIncident(incident: InsertIncident): Promise<Incident>;
  getIncidents(filters?: { status?: string; priority?: string; assignedOfficer?: string }): Promise<Incident[]>;
  getIncident(id: string): Promise<Incident | undefined>;
  updateIncident(id: string, updates: Partial<Incident>): Promise<Incident>;
  getIncidentsByTourist(touristProfileId: string): Promise<Incident[]>;
  
  // Alerts
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAlerts(userId?: string, role?: string): Promise<Alert[]>;
  markAlertAsRead(id: string): Promise<void>;
  getUnreadAlertsCount(userId?: string, role?: string): Promise<number>;
  
  // Analytics
  getTouristStats(): Promise<{
    totalTourists: number;
    activeTourists: number;
    averageSafetyScore: number;
    incidentsToday: number;
  }>;
  
  getZoneOccupancy(): Promise<{ zoneId: string; name: string; occupancy: number; capacity: number }[]>;
  
  // System settings
  getSystemSetting(key: string): Promise<string | undefined>;
  setSystemSetting(key: string, value: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Tourist operations
  async createTouristProfile(profile: InsertTouristProfile): Promise<TouristProfile> {
    const [touristProfile] = await db
      .insert(touristProfiles)
      .values(profile)
      .returning();
    return touristProfile;
  }

  async getTouristProfile(userId: string): Promise<TouristProfile | undefined> {
    const [profile] = await db
      .select()
      .from(touristProfiles)
      .where(eq(touristProfiles.userId, userId));
    return profile;
  }

  async getTouristProfileByTouristId(touristId: string): Promise<TouristProfile | undefined> {
    const [profile] = await db
      .select()
      .from(touristProfiles)
      .where(eq(touristProfiles.touristId, touristId));
    return profile;
  }

  async updateTouristProfile(id: string, updates: Partial<TouristProfile>): Promise<TouristProfile> {
    const [profile] = await db
      .update(touristProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(touristProfiles.id, id))
      .returning();
    return profile;
  }

  async getAllActiveTourists(): Promise<(TouristProfile & { user: User })[]> {
    const result = await db
      .select()
      .from(touristProfiles)
      .innerJoin(users, eq(touristProfiles.userId, users.id))
      .where(eq(touristProfiles.isActive, true));
    
    return result.map(row => ({
      ...row.tourist_profiles,
      user: row.users
    }));
  }

  // Location tracking
  async addTouristLocation(location: InsertTouristLocation): Promise<TouristLocation> {
    const [newLocation] = await db
      .insert(touristLocations)
      .values(location)
      .returning();
    return newLocation;
  }

  async getTouristLocations(touristProfileId: string, limit = 100): Promise<TouristLocation[]> {
    return await db
      .select()
      .from(touristLocations)
      .where(eq(touristLocations.touristProfileId, touristProfileId))
      .orderBy(desc(touristLocations.timestamp))
      .limit(limit);
  }

  async getLatestTouristLocation(touristProfileId: string): Promise<TouristLocation | undefined> {
    const [location] = await db
      .select()
      .from(touristLocations)
      .where(eq(touristLocations.touristProfileId, touristProfileId))
      .orderBy(desc(touristLocations.timestamp))
      .limit(1);
    return location;
  }

  // Safety zones
  async createSafetyZone(zone: InsertSafetyZone): Promise<SafetyZone> {
    const [newZone] = await db
      .insert(safetyZones)
      .values(zone)
      .returning();
    return newZone;
  }

  async getAllSafetyZones(): Promise<SafetyZone[]> {
    return await db
      .select()
      .from(safetyZones)
      .where(eq(safetyZones.isActive, true))
      .orderBy(asc(safetyZones.name));
  }

  async getSafetyZone(id: string): Promise<SafetyZone | undefined> {
    const [zone] = await db
      .select()
      .from(safetyZones)
      .where(eq(safetyZones.id, id));
    return zone;
  }

  async updateSafetyZone(id: string, updates: Partial<SafetyZone>): Promise<SafetyZone> {
    const [zone] = await db
      .update(safetyZones)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(safetyZones.id, id))
      .returning();
    return zone;
  }

  async deleteSafetyZone(id: string): Promise<void> {
    await db
      .update(safetyZones)
      .set({ isActive: false })
      .where(eq(safetyZones.id, id));
  }

  // Incidents
  async createIncident(incident: InsertIncident): Promise<Incident> {
    const [newIncident] = await db
      .insert(incidents)
      .values(incident)
      .returning();
    return newIncident;
  }

  async getIncidents(filters?: { status?: string; priority?: string; assignedOfficer?: string }): Promise<Incident[]> {
    if (filters?.status) {
      return await db.select().from(incidents)
        .where(eq(incidents.status, filters.status))
        .orderBy(desc(incidents.createdAt));
    }
    
    return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    const [incident] = await db
      .select()
      .from(incidents)
      .where(eq(incidents.id, id));
    return incident;
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    const [incident] = await db
      .update(incidents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return incident;
  }

  async getIncidentsByTourist(touristProfileId: string): Promise<Incident[]> {
    return await db
      .select()
      .from(incidents)
      .where(eq(incidents.touristProfileId, touristProfileId))
      .orderBy(desc(incidents.createdAt));
  }

  // Alerts
  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db
      .insert(alerts)
      .values(alert)
      .returning();
    return newAlert;
  }

  async getAlerts(userId?: string, role?: string): Promise<Alert[]> {
    if (userId) {
      return await db.select().from(alerts)
        .where(eq(alerts.targetUserId, userId))
        .orderBy(desc(alerts.createdAt));
    } else if (role) {
      return await db.select().from(alerts)
        .where(eq(alerts.targetRole, role))
        .orderBy(desc(alerts.createdAt));
    }
    
    return await db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }

  async markAlertAsRead(id: string): Promise<void> {
    await db
      .update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, id));
  }

  async getUnreadAlertsCount(userId?: string, role?: string): Promise<number> {
    if (userId) {
      const [result] = await db.select({ count: count() }).from(alerts)
        .where(and(eq(alerts.isRead, false), eq(alerts.targetUserId, userId)));
      return result.count;
    } else if (role) {
      const [result] = await db.select({ count: count() }).from(alerts)
        .where(and(eq(alerts.isRead, false), eq(alerts.targetRole, role)));
      return result.count;
    }
    
    const [result] = await db.select({ count: count() }).from(alerts)
      .where(eq(alerts.isRead, false));
    return result.count;
  }

  // Analytics
  async getTouristStats(): Promise<{
    totalTourists: number;
    activeTourists: number;
    averageSafetyScore: number;
    incidentsToday: number;
  }> {
    const [totalResult] = await db.select({ count: count() }).from(touristProfiles);
    const [activeResult] = await db.select({ count: count() }).from(touristProfiles).where(eq(touristProfiles.isActive, true));
    const [avgScoreResult] = await db.select({ avg: sql<number>`avg(${touristProfiles.safetyScore})` }).from(touristProfiles).where(eq(touristProfiles.isActive, true));
    const [incidentsResult] = await db.select({ count: count() }).from(incidents).where(sql`DATE(${incidents.createdAt}) = CURRENT_DATE`);
    
    return {
      totalTourists: totalResult.count,
      activeTourists: activeResult.count,
      averageSafetyScore: Math.round(avgScoreResult.avg || 0),
      incidentsToday: incidentsResult.count,
    };
  }

  async getZoneOccupancy(): Promise<{ zoneId: string; name: string; occupancy: number; capacity: number }[]> {
    const result = await db
      .select({
        zoneId: safetyZones.id,
        name: safetyZones.name,
        occupancy: safetyZones.currentOccupancy,
        capacity: safetyZones.capacity,
      })
      .from(safetyZones)
      .where(eq(safetyZones.isActive, true));
    
    return result.map(row => ({
      zoneId: row.zoneId,
      name: row.name,
      occupancy: row.occupancy || 0,
      capacity: row.capacity || 0,
    }));
  }

  // System settings
  async getSystemSetting(key: string): Promise<string | undefined> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, key));
    return setting?.settingValue;
  }

  async setSystemSetting(key: string, value: string): Promise<void> {
    await db
      .insert(systemSettings)
      .values({ settingKey: key, settingValue: value })
      .onConflictDoUpdate({
        target: systemSettings.settingKey,
        set: { settingValue: value, updatedAt: new Date() },
      });
  }
}

export const storage = new DatabaseStorage();
