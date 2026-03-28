import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, type AuthRequest } from '../middleware/auth'
import { query, queryOne } from '../lib/db'
import { logger } from '../lib/logger'

export const agencyRouter = Router()
agencyRouter.use(authMiddleware as any)

agencyRouter.get('/me', async (req: AuthRequest, res) => {
  try {
    const agency = await queryOne<any>(
      'SELECT id, name, owner_name, email, phone, address, website, services, brand_color, logo_url, email_verified, created_at, updated_at FROM agencies WHERE id = $1',
      [req.agencyId]
    )
    if (!agency) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Agency not found', status: 404 } })
    return res.json({ data: agency })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch profile', status: 500 } })
  }
})

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  ownerName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  services: z.array(z.string()).optional(),
  brandColor: z.string().optional(),
})

agencyRouter.patch('/me', async (req: AuthRequest, res) => {
  try {
    const body = updateSchema.parse(req.body)
    const agency = await queryOne<any>(
      `UPDATE agencies SET
        name = COALESCE($1, name),
        owner_name = COALESCE($2, owner_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        address = COALESCE($5, address),
        website = COALESCE($6, website),
        services = COALESCE($7, services),
        brand_color = COALESCE($8, brand_color),
        updated_at = NOW()
       WHERE id = $9
       RETURNING id, name, owner_name, email, phone, address, website, services, brand_color, logo_url, email_verified, created_at, updated_at`,
      [body.name, body.ownerName, body.email, body.phone, body.address, body.website,
       body.services, body.brandColor, req.agencyId]
    )
    return res.json({ data: agency })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: err.errors[0].message, status: 422 } })
    }
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile', status: 500 } })
  }
})
