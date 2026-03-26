/**
 * Seed script — creates default admin user and sample campaign data.
 * Run with: npm run seed
 */
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from './index'
import { users, campaignMetrics, dashboardSettings } from './schema'

async function main() {
  console.log('🌱 Seeding database…')

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminEmail = 'admin@analytics.hub'
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1)

  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash('admin123', 12)
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      name: 'Admin',
      role: 'admin',
    })
    console.log('  ✓ Created admin user: admin@analytics.hub / admin123')
  } else {
    console.log('  – Admin user already exists, skipping')
  }

  // ── Default settings ────────────────────────────────────────────────────────
  const defaultSettings = [
    { key: 'ip_allowlist', value: [] as string[], description: 'IP addresses excluded from GA analytics' },
    { key: 'region_filters', value: [] as string[], description: 'Active region filters (north_america, europe, china)' },
    { key: 'ga4_property_id', value: '', description: 'Override GA4 property ID (leave empty to use env var)' },
    { key: 'ga4_client_email', value: '', description: 'Override GA4 service account email (leave empty to use env var)' },
  ]

  for (const setting of defaultSettings) {
    const exists = await db
      .select({ id: dashboardSettings.id })
      .from(dashboardSettings)
      .where(eq(dashboardSettings.key, setting.key))
      .limit(1)

    if (exists.length === 0) {
      await db.insert(dashboardSettings).values({
        key: setting.key,
        value: setting.value as never,
        description: setting.description,
      })
      console.log(`  ✓ Created setting: ${setting.key}`)
    }
  }

  // ── Sample campaign metrics ──────────────────────────────────────────────────
  const sampleCampaigns = [
    {
      externalId: 'camp-001',
      campaignName: 'Q4 Special: 400G Transceivers Sale',
      subject: 'Q4 Special: 400G Transceivers Sale — Save Up to 30%',
      sendDate: new Date('2024-11-15T10:00:00Z'),
      totalSent: 8432,
      totalDelivered: 8201,
      totalOpened: 3467,
      totalClicked: 1577,
      totalBounced: 231,
      totalUnsubscribed: 14,
      listName: 'All Customers',
      tags: ['promotion', 'product-launch'],
    },
    {
      externalId: 'camp-002',
      campaignName: 'New Product Launch: QSFP-DD Series',
      subject: 'Introducing the Next Generation QSFP-DD Series',
      sendDate: new Date('2024-11-08T09:30:00Z'),
      totalSent: 9127,
      totalDelivered: 8943,
      totalOpened: 3552,
      totalClicked: 1388,
      totalBounced: 184,
      totalUnsubscribed: 22,
      listName: 'All Customers',
      tags: ['product-launch', 'new-arrival'],
    },
    {
      externalId: 'camp-003',
      campaignName: 'VIP Exclusive: Early Access to 800G',
      subject: 'You\'re Invited: Early Access to Our 800G Platform',
      sendDate: new Date('2024-10-28T08:00:00Z'),
      totalSent: 2341,
      totalDelivered: 2318,
      totalOpened: 1327,
      totalClicked: 569,
      totalBounced: 23,
      totalUnsubscribed: 3,
      listName: 'VIP Customers',
      tags: ['vip', 'early-access'],
    },
    {
      externalId: 'camp-004',
      campaignName: 'October Newsletter: Industry Trends',
      subject: 'Data Center Trends: What\'s Driving 400G & 800G Adoption',
      sendDate: new Date('2024-10-10T11:00:00Z'),
      totalSent: 10854,
      totalDelivered: 10612,
      totalOpened: 3607,
      totalClicked: 894,
      totalBounced: 242,
      totalUnsubscribed: 31,
      listName: 'Newsletter Subscribers',
      tags: ['newsletter', 'content'],
    },
    {
      externalId: 'camp-005',
      campaignName: 'September Promo: CWDM4 & PSM4 Bundle',
      subject: 'Limited Time: CWDM4 + PSM4 Bundle Pricing',
      sendDate: new Date('2024-09-20T10:00:00Z'),
      totalSent: 7623,
      totalDelivered: 7441,
      totalOpened: 2513,
      totalClicked: 1148,
      totalBounced: 182,
      totalUnsubscribed: 18,
      listName: 'All Customers',
      tags: ['promotion', 'bundle'],
    },
    {
      externalId: 'camp-006',
      campaignName: 'Welcome Series: New Subscribers',
      subject: 'Welcome to OpenClaw — Your Optical Transceiver Partner',
      sendDate: new Date('2024-09-01T08:00:00Z'),
      totalSent: 534,
      totalDelivered: 532,
      totalOpened: 401,
      totalClicked: 198,
      totalBounced: 2,
      totalUnsubscribed: 1,
      listName: 'New Subscribers',
      tags: ['welcome', 'onboarding'],
    },
  ]

  let created = 0
  for (const campaign of sampleCampaigns) {
    const exists = await db
      .select({ id: campaignMetrics.id })
      .from(campaignMetrics)
      .where(eq(campaignMetrics.externalId, campaign.externalId))
      .limit(1)

    if (exists.length === 0) {
      const { totalSent, totalOpened, totalClicked, totalBounced } = campaign
      const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : '0'
      const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : '0'
      const bounceRate = totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(2) : '0'

      await db.insert(campaignMetrics).values({
        ...campaign,
        openRate,
        clickRate,
        bounceRate,
      })
      created++
    }
  }

  if (created > 0) {
    console.log(`  ✓ Created ${created} sample campaigns`)
  } else {
    console.log('  – Sample campaigns already exist, skipping')
  }

  console.log('✅ Seed complete')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
