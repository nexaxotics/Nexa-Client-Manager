import { Router } from 'express'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { importPKCS8, importSPKI, SignJWT, jwtVerify } from 'jose'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import { query, queryOne } from '../lib/db'
import { logger } from '../lib/logger'

export const authRouter = Router()

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 })

const ACCESS_TOKEN_TTL = 15 * 60     // 15 min
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60  // 30 days

async function signToken(sub: string, expiresIn: number) {
  const privateKeyPem = Buffer.from(process.env.JWT_PRIVATE_KEY ?? '', 'base64').toString('utf-8')
  const privateKey = await importPKCS8(privateKeyPem, 'RS256')
  return new SignJWT({ sub })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(privateKey)
}

function setAuthCookies(res: import('express').Response, accessToken: string, refreshToken: string) {
  const secure = process.env.NODE_ENV === 'production'
  res.cookie('access_token', accessToken, {
    httpOnly: true, secure, sameSite: 'strict', maxAge: ACCESS_TOKEN_TTL * 1000,
  })
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true, secure, sameSite: 'strict', maxAge: REFRESH_TOKEN_TTL * 1000,
    path: '/auth/refresh',
  })
}

const registerSchema = z.object({
  name: z.string().min(2),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  phone: z.string().optional(),
  services: z.array(z.string()).default([]),
  brandColor: z.string().default('#4F46E5'),
})

authRouter.post('/register', registerLimiter, async (req, res) => {
  try {
    const body = registerSchema.parse(req.body)
    const existing = await queryOne('SELECT id FROM agencies WHERE email = $1', [body.email])
    if (existing) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Email is already registered', field: 'email', status: 422 } })
    }
    const passwordHash = await bcrypt.hash(body.password, 12)
    const id = uuidv4()
    await query(
      `INSERT INTO agencies (id, name, owner_name, email, password_hash, phone, services, brand_color)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, body.name, body.ownerName, body.email, passwordHash, body.phone ?? null, body.services, body.brandColor]
    )
    // TODO: send verification email via SendGrid
    return res.status(201).json({ data: { message: 'Account created. Please verify your email.' } })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: err.errors[0].message, status: 422 } })
    }
    logger.error(err, 'Register error')
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : String(err)) : 'Registration failed', status: 500 } })
  }
})

authRouter.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(req.body)
    const agency = await queryOne<any>('SELECT * FROM agencies WHERE email = $1 AND deleted_at IS NULL', [email])
    if (!agency || !(await bcrypt.compare(password, agency.password_hash))) {
      return res.status(401).json({ error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password', status: 401 } })
    }
    // NOTE: For dev mode, skip email verification check
    // if (!agency.email_verified) {
    //   return res.status(403).json({ error: { code: 'AUTH_EMAIL_NOT_VERIFIED', message: 'Please verify your email first', status: 403 } })
    // }
    const [accessToken, refreshToken] = await Promise.all([
      signToken(agency.id, ACCESS_TOKEN_TTL),
      signToken(agency.id, REFRESH_TOKEN_TTL),
    ])
    setAuthCookies(res, accessToken, refreshToken)
    const { password_hash: _, ...safeAgency } = agency
    return res.json({ data: { agency: safeAgency } })
  } catch (err) {
    logger.error(err, 'Login error')
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Login failed', status: 500 } })
  }
})

authRouter.post('/logout', (req, res) => {
  res.clearCookie('access_token')
  res.clearCookie('refresh_token', { path: '/auth/refresh' })
  return res.json({ data: { message: 'Logged out' } })
})

authRouter.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token
    if (!token) return res.status(401).json({ error: { code: 'AUTH_REFRESH_EXPIRED', message: 'No refresh token', status: 401 } })
    const publicKeyPem = Buffer.from(process.env.JWT_PUBLIC_KEY ?? '', 'base64').toString('utf-8')
    const publicKey = await importSPKI(publicKeyPem, 'RS256')
    const { payload } = await jwtVerify(token, publicKey, { algorithms: ['RS256'] })
    const agencyId = payload.sub as string
    const [accessToken, refreshToken] = await Promise.all([
      signToken(agencyId, ACCESS_TOKEN_TTL),
      signToken(agencyId, REFRESH_TOKEN_TTL),
    ])
    setAuthCookies(res, accessToken, refreshToken)
    return res.json({ data: { message: 'Token refreshed' } })
  } catch {
    return res.status(401).json({ error: { code: 'AUTH_REFRESH_EXPIRED', message: 'Refresh token expired', status: 401 } })
  }
})

authRouter.post('/forgot-password', async (req, res) => {
  // Always return 200 to prevent email enumeration
  const { email } = z.object({ email: z.string().email() }).parse(req.body)
  // TODO: Generate reset token, send email via SendGrid
  logger.info({ email }, 'Forgot password requested')
  return res.json({ data: { message: 'If that email exists, a reset link has been sent.' } })
})
