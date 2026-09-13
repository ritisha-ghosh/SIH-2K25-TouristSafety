import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  real,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("tourist"), // tourist, police, tourism, admin
  phoneNumber: varchar("phone_number"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tourist specific data
export const touristProfiles = pgTable("tourist_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  touristId: varchar("tourist_id").unique().notNull(), // TID-2024-XXXXXX
  nationality: varchar("nationality").default("Indian"),
  passportNumber: varchar("passport_number"),
  visaNumber: varchar("visa_number"),
  checkInLocation: varchar("check_in_location"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  safetyScore: integer("safety_score").default(85),
  isActive: boolean("is_active").default(true),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tourist locations and tracking
export const touristLocations = pgTable("tourist_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  touristProfileId: varchar("tourist_profile_id").references(() => touristProfiles.id).notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  accuracy: real("accuracy"),
  address: text("address"),
  zoneId: varchar("zone_id").references(() => safetyZones.id),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Safety zones and geo-fencing
export const safetyZones = pgTable("safety_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  zoneType: varchar("zone_type").notNull(), // safe, restricted, high_risk
  coordinates: jsonb("coordinates").notNull(), // GeoJSON polygon
  capacity: integer("capacity").default(100),
  currentOccupancy: integer("current_occupancy").default(0),
  riskLevel: varchar("risk_level").notNull().default("low"), // low, moderate, high
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Incidents and alerts
export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  touristProfileId: varchar("tourist_profile_id").references(() => touristProfiles.id),
  incidentType: varchar("incident_type").notNull(), // panic, missing, geofence_violation, unusual_activity
  priority: varchar("priority").notNull().default("medium"), // low, medium, high, critical
  status: varchar("status").notNull().default("open"), // open, investigating, resolved, closed
  title: varchar("title").notNull(),
  description: text("description"),
  location: jsonb("location"), // {lat, lng, address}
  assignedOfficer: varchar("assigned_officer").references(() => users.id),
  responseTime: integer("response_time"), // in minutes
  evidence: jsonb("evidence"), // photos, documents, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Tourist itineraries
export const itineraries = pgTable("itineraries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  touristProfileId: varchar("tourist_profile_id").references(() => touristProfiles.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  locations: jsonb("locations").notNull(), // Array of {name, lat, lng, time, duration}
  status: varchar("status").default("planned"), // planned, active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System alerts and notifications
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alertType: varchar("alert_type").notNull(), // weather, security, route, general
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  severity: varchar("severity").notNull().default("info"), // info, warning, error, critical
  targetRole: varchar("target_role"), // tourist, police, tourism, admin, null for all
  targetUserId: varchar("target_user_id").references(() => users.id),
  zoneId: varchar("zone_id").references(() => safetyZones.id),
  isRead: boolean("is_read").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Multilingual content
export const content = pgTable("content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentKey: varchar("content_key").notNull(),
  contentType: varchar("content_type").notNull(), // guidelines, procedures, info
  language: varchar("language").notNull().default("en"),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System settings
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: varchar("setting_key").unique().notNull(),
  settingValue: text("setting_value").notNull(),
  settingType: varchar("setting_type").notNull().default("string"), // string, number, boolean, json
  description: text("description"),
  isEditable: boolean("is_editable").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertTouristProfile = typeof touristProfiles.$inferInsert;
export type TouristProfile = typeof touristProfiles.$inferSelect;

export type InsertTouristLocation = typeof touristLocations.$inferInsert;
export type TouristLocation = typeof touristLocations.$inferSelect;

export type InsertSafetyZone = typeof safetyZones.$inferInsert;
export type SafetyZone = typeof safetyZones.$inferSelect;

export type InsertIncident = typeof incidents.$inferInsert;
export type Incident = typeof incidents.$inferSelect;

export type InsertItinerary = typeof itineraries.$inferInsert;
export type Itinerary = typeof itineraries.$inferSelect;

export type InsertAlert = typeof alerts.$inferInsert;
export type Alert = typeof alerts.$inferSelect;

export type InsertContent = typeof content.$inferInsert;
export type Content = typeof content.$inferSelect;

export type InsertSystemSetting = typeof systemSettings.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;

// Zod schemas for validation
export const insertTouristProfileSchema = createInsertSchema(touristProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSafetyZoneSchema = createInsertSchema(safetyZones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});
