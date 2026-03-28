import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { authMiddleware, type AuthRequest } from '../middleware/auth'
import { query, queryOne } from '../lib/db'
import { logger } from '../lib/logger'

export const clientsRouter = Router()
clientsRouter.use(authMiddleware as any)

const clientSchema = z.object({
  fullName: z.string().min(1),
  businessName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  servicesContracted: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  contractDuration: z.string().optional(),
  projectScope: z.string().optional(),
  monthlyFee: z.number().optional(),
  paymentTerms: z.string().optional(),
  currency: z.string().default('USD'),
  instagramHandle: z.string().optional(),
  facebookPage: z.string().optional(),
  googleAdsId: z.string().optional(),
  websiteCms: z.string().optional(),
  adAccountId: z.string().optional(),
  meetingPlatform: z.string().optional(),
  calendlyLink: z.string().optional(),
  businessGoals: z.string().optional(),
  targetAudience: z.string().optional(),
  keyMetrics: z.string().optional(),
  reportingFrequency: z.string().default('monthly'),
})

clientsRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '20', search, status, sort = 'created_at:desc' } = req.query as Record<string, string>
    const offset = (Number(page) - 1) * Number(limit)
    const [sortField, sortDir] = sort.split(':')
    const allowedSorts = ['created_at', 'business_name', 'full_name', 'updated_at']
    const safeSort = allowedSorts.includes(sortField) ? sortField : 'created_at'
    const safeDir = sortDir === 'asc' ? 'ASC' : 'DESC'

    const conditions = ['agency_id = $1', 'deleted_at IS NULL']
    const params: unknown[] = [req.agencyId]
    if (status) { conditions.push(`status = $${params.length + 1}`); params.push(status) }
    if (search) {
      conditions.push(`(business_name ILIKE $${params.length + 1} OR full_name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`)
      params.push(`%${search}%`)
    }

    const whereClause = conditions.join(' AND ')
    const clients = await query<any>(
      `SELECT * FROM clients WHERE ${whereClause} ORDER BY ${safeSort} ${safeDir} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, Number(limit), offset]
    )
    const [countRow] = await query<any>(`SELECT COUNT(*) as total FROM clients WHERE ${whereClause}`, params)
    const total = Number(countRow.total)

    return res.json({
      data: clients,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch clients', status: 500 } })
  }
})

clientsRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const body = clientSchema.parse(req.body)
    const id = uuidv4()
    const client = await queryOne<any>(
      `INSERT INTO clients (id, agency_id, full_name, business_name, email, phone, address, website,
        services_contracted, start_date, contract_duration, project_scope, monthly_fee, payment_terms, currency,
        instagram_handle, facebook_page, google_ads_id, website_cms, ad_account_id, meeting_platform,
        calendly_link, business_goals, target_audience, key_metrics, reporting_frequency)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
       RETURNING *`,
      [id, req.agencyId, body.fullName, body.businessName, body.email, body.phone, body.address, body.website,
       body.servicesContracted, body.startDate, body.contractDuration, body.projectScope, body.monthlyFee,
       body.paymentTerms, body.currency, body.instagramHandle, body.facebookPage, body.googleAdsId,
       body.websiteCms, body.adAccountId, body.meetingPlatform, body.calendlyLink, body.businessGoals,
       body.targetAudience, body.keyMetrics, body.reportingFrequency]
    )
    return res.status(201).json({ data: client })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: err.errors[0].message, status: 422 } })
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create client', status: 500 } })
  }
})

clientsRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const client = await queryOne<any>('SELECT * FROM clients WHERE id = $1 AND agency_id = $2 AND deleted_at IS NULL', [req.params.id, req.agencyId])
    if (!client) return res.status(404).json({ error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found', status: 404 } })
    return res.json({ data: client })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch client', status: 500 } })
  }
})

clientsRouter.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const body = clientSchema.partial().parse(req.body)
    const client = await queryOne<any>(
      `UPDATE clients SET
        full_name = COALESCE($1, full_name),
        business_name = COALESCE($2, business_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        project_scope = COALESCE($5, project_scope),
        monthly_fee = COALESCE($6, monthly_fee),
        updated_at = NOW()
       WHERE id = $7 AND agency_id = $8 AND deleted_at IS NULL
       RETURNING *`,
      [body.fullName, body.businessName, body.email, body.phone, body.projectScope, body.monthlyFee, req.params.id, req.agencyId]
    )
    if (!client) return res.status(404).json({ error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found', status: 404 } })
    return res.json({ data: client })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update client', status: 500 } })
  }
})

clientsRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const result = await query('UPDATE clients SET deleted_at = NOW(), status = $1, updated_at = NOW() WHERE id = $2 AND agency_id = $3', ['archived', req.params.id, req.agencyId])
    return res.json({ data: { message: 'Client archived' } })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to archive client', status: 500 } })
  }
})

clientsRouter.patch('/:id/stage', async (req: AuthRequest, res) => {
  try {
    const { stage } = z.object({ stage: z.number().int().min(1).max(10) }).parse(req.body)
    const client = await queryOne<any>(
      'UPDATE clients SET lifecycle_stage = $1, updated_at = NOW() WHERE id = $2 AND agency_id = $3 AND deleted_at IS NULL RETURNING *',
      [stage, req.params.id, req.agencyId]
    )
    if (!client) return res.status(404).json({ error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found', status: 404 } })
    return res.json({ data: client })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update stage', status: 500 } })
  }
})
