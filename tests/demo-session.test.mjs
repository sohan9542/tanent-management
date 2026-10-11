import assert from 'node:assert/strict'
import { describe, it, before, after } from 'node:test'

describe('demo credentials', () => {
  /** @type {typeof import('../lib/demo-config.js')} */
  let demoConfig

  before(async () => {
    demoConfig = await import('../lib/demo-config.js')
  })

  it('accepts platform demo email/password', () => {
    assert.equal(
      demoConfig.isDemoPlatformCredentials('demo@tanent.app', 'Demo123!'),
      true
    )
    assert.equal(
      demoConfig.isDemoPlatformCredentials('DEMO@tanent.app', 'Demo123!'),
      true
    )
    assert.equal(
      demoConfig.isDemoPlatformCredentials('demo@tanent.app', 'wrong'),
      false
    )
  })

  it('accepts tenant demo id/last name', () => {
    assert.equal(demoConfig.isDemoTenantCredentials('DEMO-001', 'Demo'), true)
    assert.equal(demoConfig.isDemoTenantCredentials('demo-001', 'Demo'), true)
    assert.equal(demoConfig.isDemoTenantCredentials('DEMO-001', 'Other'), false)
  })

  it('accepts org demo email/password', () => {
    assert.equal(
      demoConfig.isDemoOrgCredentials('org-demo@tanent.app', 'Demo123!'),
      true
    )
    assert.equal(
      demoConfig.isDemoOrgCredentials('org-demo@tanent.app', 'nope'),
      false
    )
  })
})

describe('static demo session tokens', () => {
  /** @type {typeof import('../lib/demo-token.js')} */
  let demoToken
  let previousSecret

  before(async () => {
    previousSecret = process.env.SESSION_SECRET
    process.env.SESSION_SECRET = 'test-session-secret-for-unit-tests'
    demoToken = await import('../lib/demo-token.js')
  })

  after(() => {
    if (previousSecret === undefined) {
      delete process.env.SESSION_SECRET
    } else {
      process.env.SESSION_SECRET = previousSecret
    }
  })

  it('creates and verifies a signed token', () => {
    const token = demoToken.createStaticDemoToken('tenant')
    const payload = demoToken.verifyStaticDemoToken(token)
    assert.ok(payload)
    assert.equal(payload.kind, 'tenant')
    assert.equal(payload.isStaticDemo, true)
    assert.ok(payload.exp > Date.now())
  })

  it('rejects tampered tokens', () => {
    const token = demoToken.createStaticDemoToken('platform')
    const [payload] = token.split('.')
    const tampered = `${payload}.not-a-real-signature`
    assert.equal(demoToken.verifyStaticDemoToken(tampered), null)
  })

  it('rejects missing or malformed tokens', () => {
    assert.equal(demoToken.verifyStaticDemoToken(null), null)
    assert.equal(demoToken.verifyStaticDemoToken(''), null)
    assert.equal(demoToken.verifyStaticDemoToken('no-dot'), null)
  })

  it('returns expected cookie options', () => {
    const opts = demoToken.demoCookieOptions(3600)
    assert.equal(opts.httpOnly, true)
    assert.equal(opts.sameSite, 'lax')
    assert.equal(opts.path, '/')
    assert.equal(opts.maxAge, 3600)
  })
})

describe('validation helpers', () => {
  /** @type {typeof import('../lib/utils/validation.js')} */
  let validation

  before(async () => {
    validation = await import('../lib/utils/validation.js')
  })

  it('validates tenant login fields', () => {
    assert.equal(validation.validateLogin({ tenantId: 'A', lastName: 'B' }).isValid, true)
    assert.equal(validation.validateLogin({ tenantId: '', lastName: 'B' }).isValid, false)
  })

  it('validates email/password login fields', () => {
    const ok = validation.validateEmailPasswordLogin({
      email: 'a@b.com',
      password: 'x',
    })
    assert.equal(ok.isValid, true)

    const bad = validation.validateEmailPasswordLogin({
      email: 'not-an-email',
      password: 'x',
    })
    assert.equal(bad.isValid, false)
  })
})
