import { NextResponse } from 'next/server'

/**
 * @typedef {Object} JsonErrorOptions
 * @property {number} [status]
 * @property {Record<string, unknown>} [extra]
 */

/**
 * JSON error response helper for API routes.
 * @param {string} error
 * @param {JsonErrorOptions & { successField?: boolean }} [options]
 */
export function jsonError(error, { status = 400, extra = {}, successField = true } = {}) {
  const body = successField ? { success: false, error, ...extra } : { error, ...extra }
  return NextResponse.json(body, { status })
}

/**
 * JSON success response helper for API routes.
 * @param {Record<string, unknown>} [data]
 * @param {number} [status]
 */
export function jsonOk(data = {}, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status })
}

/**
 * Parse JSON body safely. Returns null on invalid JSON.
 * @param {Request} request
 * @returns {Promise<Record<string, unknown>|null>}
 */
export async function readJsonBody(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

/**
 * Require non-empty string fields on a body object.
 * @param {Record<string, unknown>} body
 * @param {string[]} fields
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function requireFields(body, fields) {
  for (const field of fields) {
    const value = body?.[field]
    if (value === undefined || value === null || String(value).trim() === '') {
      return { ok: false, error: `${field} is required` }
    }
  }
  return { ok: true }
}
