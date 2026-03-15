/**
 * Seed script — inserts Caleb (User #1) and Sagar (User #2) into the amber database.
 *
 * Run once against the production DB:
 *   pnpm seed   (from apps/imessage-agent/)
 *
 * Uses synthetic Privy IDs (did:imessage:...) that can be replaced when
 * the users link real Privy accounts via the iOS/web app.
 */

import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const CALEB_PHONE = process.env.CALEB_PHONE
const SAGAR_PHONE = process.env.SAGAR_PHONE
if (!CALEB_PHONE || !SAGAR_PHONE) {
  console.error('CALEB_PHONE and SAGAR_PHONE are required')
  process.exit(1)
}

const sql = postgres(DATABASE_URL)

async function seed() {
  console.log('🌱 Seeding amber users...')

  // ─── User 1: Caleb ────────────────────────────────────────────────────────
  const [caleb] = await sql`
    INSERT INTO users (privy_user_id, privacy_tier, created_at)
    VALUES ('did:imessage:caleb', 'selective_cloud', NOW())
    ON CONFLICT (privy_user_id) DO UPDATE SET privacy_tier = EXCLUDED.privacy_tier
    RETURNING id
  `
  console.log(`✓ Caleb — user id: ${caleb.id}`)

  await sql`
    INSERT INTO user_profiles (user_id, display_name, phone, onboarding_complete, privacy_tier, created_at, updated_at)
    VALUES (
      ${caleb.id},
      'Caleb Newton',
      ${CALEB_PHONE},
      true,
      'selective_cloud',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE
      SET display_name = EXCLUDED.display_name,
          phone = EXCLUDED.phone,
          updated_at = NOW()
  `
  console.log(`✓ Caleb profile — phone: ${CALEB_PHONE}`)

  // ─── User 2: Sagar ────────────────────────────────────────────────────────
  const [sagar] = await sql`
    INSERT INTO users (privy_user_id, privacy_tier, created_at)
    VALUES ('did:imessage:sagar', 'selective_cloud', NOW())
    ON CONFLICT (privy_user_id) DO UPDATE SET privacy_tier = EXCLUDED.privacy_tier
    RETURNING id
  `
  console.log(`✓ Sagar — user id: ${sagar.id}`)

  await sql`
    INSERT INTO user_profiles (user_id, display_name, phone, onboarding_complete, privacy_tier, created_at, updated_at)
    VALUES (
      ${sagar.id},
      'Sagar',
      ${SAGAR_PHONE},
      true,
      'selective_cloud',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE
      SET display_name = EXCLUDED.display_name,
          phone = EXCLUDED.phone,
          updated_at = NOW()
  `
  console.log(`✓ Sagar profile — phone: ${SAGAR_PHONE}`)

  console.log('\n✅ Seed complete.')
  console.log(`   Caleb is user #${caleb.id}`)
  console.log(`   Sagar is user #${sagar.id}`)
  console.log('\nNote: synthetic privy_user_ids (did:imessage:*) can be replaced')
  console.log('when users link real Privy accounts via the iOS/web app.')

  await sql.end()
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
