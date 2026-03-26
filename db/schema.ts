import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
} from 'drizzle-orm/pg-core'

// ============================================================
// Users & Authentication
// ============================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role').notNull().default('viewer'), // 'admin' | 'viewer'
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Dashboard Settings
// ============================================================

export const dashboardSettings = pgTable('dashboard_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(), // e.g. 'ga4_property_id', 'ip_allowlist', 'region_filters'
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Analytics Snapshots (cached GA4 data)
// ============================================================

export const analyticsSnapshots = pgTable('analytics_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportType: text('report_type').notNull(), // 'summary', 'monthly_visitors', 'page_engagement', 'traffic_sources'
  dateRangeStart: text('date_range_start').notNull(),
  dateRangeEnd: text('date_range_end').notNull(),
  data: jsonb('data').notNull(),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
})

// ============================================================
// Email Campaign Metrics
// ============================================================

export const campaignMetrics = pgTable('campaign_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  externalId: text('external_id').unique(), // ID from email platform
  campaignName: text('campaign_name').notNull(),
  subject: text('subject'),
  sendDate: timestamp('send_date', { withTimezone: true }),
  totalSent: integer('total_sent').notNull().default(0),
  totalDelivered: integer('total_delivered').notNull().default(0),
  totalOpened: integer('total_opened').notNull().default(0),
  totalClicked: integer('total_clicked').notNull().default(0),
  totalBounced: integer('total_bounced').notNull().default(0),
  totalUnsubscribed: integer('total_unsubscribed').notNull().default(0),
  openRate: numeric('open_rate', { precision: 5, scale: 2 }),
  clickRate: numeric('click_rate', { precision: 5, scale: 2 }),
  bounceRate: numeric('bounce_rate', { precision: 5, scale: 2 }),
  listName: text('list_name'),
  tags: jsonb('tags').$type<string[]>(),
  rawData: jsonb('raw_data'), // Store full API response for reference
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Traffic Sources
// ============================================================

export const trafficSources = pgTable('traffic_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: text('date').notNull(), // YYYY-MM-DD
  source: text('source').notNull(), // 'google', 'direct', 'linkedin', 'twitter', etc.
  medium: text('medium').notNull(), // 'organic', 'cpc', 'referral', 'social', 'email'
  campaign: text('campaign'),
  sessions: integer('sessions').notNull().default(0),
  users: integer('users').notNull().default(0),
  bounceRate: numeric('bounce_rate', { precision: 5, scale: 2 }),
  avgSessionDuration: numeric('avg_session_duration', { precision: 10, scale: 2 }),
  region: text('region'),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// IP Allowlist
// ============================================================

export const ipAllowlist = pgTable('ip_allowlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  ipAddress: text('ip_address').notNull(),
  label: text('label'), // 'Office', 'Home', etc.
  isActive: boolean('is_active').notNull().default(true),
  addedBy: uuid('added_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Audit Log
// ============================================================

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(), // 'login', 'settings_changed', 'data_export', etc.
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
