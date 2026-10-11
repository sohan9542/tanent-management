import { createHmac, timingSafeEqual } from 'crypto'

/** @typedef {'tenant' | 'platform' | 'org'} DemoSessionKind */

/**
 * @typedef {Object} StaticDemoPayload
 * @property {DemoSessionKind} kind
 * @property {true} isStaticDemo
 * @property {number} exp
 */

function secret() {
  return process.env.SESSION_SECRET || 'tanent-static-demo-secret'
}

/**
 * @param {string} payloadB64
 * @returns {string}
 */
function sign(payloadB64) {
  return createHmac('sha256', secret()).update(payloadB64).digest('base64url')
}

/**
 * Create a signed static demo session token (no database).
 * @param {DemoSessionKind} kind
 * @returns {string}
 */
export function createStaticDemoToken(kind) {
  const payload = Buffer.from(
    JSON.stringify({
      kind,
      isStaticDemo: true,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })
  ).toString('base64url')
  return `${payload}.${sign(payload)}`
}

/**
 * Verify a signed static demo token.
 * @param {string | undefined | null} token
 * @returns {StaticDemoPayload | null}
 */
export function verifyStaticDemoToken(token) {
  if (!token || !token.includes('.')) return null
  const [payload, sig] = token.split('.')
  const expected = sign(payload)
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data?.isStaticDemo || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

/**
 * Cookie options for the static demo session.
 * @param {number} [maxAge]
 */
export function demoCookieOptions(maxAge = 24 * 3600) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  }
}
