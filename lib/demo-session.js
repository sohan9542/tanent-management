import { cookies } from 'next/headers'
import { DEMO_ORG_USER, DEMO_PLATFORM_ADMIN, DEMO_TENANT } from './demo-config'
import {
  createStaticDemoToken,
  demoCookieOptions,
  verifyStaticDemoToken,
} from './demo-token'

/** Cookie name for the static portfolio demo session. */
export const DEMO_COOKIE = 'tanent_static_demo'

export { createStaticDemoToken, demoCookieOptions, verifyStaticDemoToken }

/**
 * Read the static demo session from cookies, if present.
 * @returns {Promise<import('./demo-token').StaticDemoPayload | null>}
 */
export async function getStaticDemoSession() {
  try {
    const store = await cookies()
    return verifyStaticDemoToken(store.get(DEMO_COOKIE)?.value)
  } catch {
    return null
  }
}

/** @returns {Record<string, unknown>} */
export function getStaticDemoPlatformUser() {
  return {
    id: DEMO_PLATFORM_ADMIN.id,
    email: DEMO_PLATFORM_ADMIN.email,
    name: DEMO_PLATFORM_ADMIN.name,
    role: DEMO_PLATFORM_ADMIN.role,
    is_active: true,
    isStaticDemo: true,
  }
}

/** @returns {Record<string, unknown>} */
export function getStaticDemoTenant() {
  return { ...DEMO_TENANT, isStaticDemo: true }
}

/** @returns {Record<string, unknown>} */
export function getStaticDemoOrgUser() {
  return {
    ...DEMO_ORG_USER,
    isStaticDemo: true,
  }
}
