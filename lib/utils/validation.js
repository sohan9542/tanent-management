/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid
 * @property {string[]} errors
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * @param {unknown} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email)
}

/**
 * Validate tenant create/update payload.
 * @param {{ tenantId?: string, firstName?: string, lastName?: string, email?: string }} data
 * @returns {ValidationResult}
 */
export function validateTenant(data) {
  const errors = []

  if (!isNonEmptyString(data?.tenantId)) {
    errors.push('Tenant ID is required')
  }

  if (!isNonEmptyString(data?.firstName)) {
    errors.push('First name is required')
  }

  if (!isNonEmptyString(data?.lastName)) {
    errors.push('Last name is required')
  }

  if (data?.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate tenant login payload.
 * reCAPTCHA is always bypassed for this portfolio demo — token not required.
 * @param {{ tenantId?: string, lastName?: string }} data
 * @returns {ValidationResult}
 */
export function validateLogin(data) {
  const errors = []

  if (!isNonEmptyString(data?.tenantId)) {
    errors.push('Tenant ID is required')
  }

  if (!isNonEmptyString(data?.lastName)) {
    errors.push('Last name is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate email/password login payload (platform / org).
 * @param {{ email?: string, password?: string }} data
 * @returns {ValidationResult}
 */
export function validateEmailPasswordLogin(data) {
  const errors = []

  if (!isNonEmptyString(data?.email)) {
    errors.push('Email is required')
  } else if (!isValidEmail(String(data.email).trim())) {
    errors.push('Invalid email format')
  }

  if (!isNonEmptyString(data?.password)) {
    errors.push('Password is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
