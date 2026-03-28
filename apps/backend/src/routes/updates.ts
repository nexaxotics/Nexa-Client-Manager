import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { authMiddleware, type AuthRequest } from '../middleware/auth'
import { query, queryOne } from '../lib/db'
import { logger } from '../lib/logger'

export const updatesRouter = Router()
updatesRouter.use(authMiddleware as any)

updatesRouter.get('/:clientId/updates', async (req: AuthRequest, res) => {
  try {
    const updates = await query<any>(
      'SELECT * FROM status_updates WHERE client_id = $1 AND agency_id = $2 ORDER BY created_at DESC',
      [req.params.clientId, req.agencyId]
    )
    return res.json({ data: updates })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch updates', status: 500 } })
  }
})

updatesRouter.post('/:clientId/updates', async (req: AuthRequest, res) => {
  try {
    const body = z.object({
      content: z.string().min(1),
      updateType: z.enum(['daily', 'weekly']).default('weekly'),
      nextSteps: z.string().optional(),
    }).parse(req.body)

    const client = await queryOne('SELECT id FROM clients WHERE id = $1 AND agency_id = $2', [req.params.clientId, req.agencyId])
    if (!client) return res.status(404).json({ error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found', status: 404 } })

    const update = await queryOne<any>(
      'INSERT INTO status_updates (id, client_id, agency_id, update_type, content, next_steps) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [uuidv4(), req.params.clientId, req.agencyId, body.updateType, body.content, body.nextSteps]
    )
    return res.status(201).json({ data: update })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: err.errors[0].message, status: 422 } })
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create update', status: 500 } })
  }
})

updatesRouter.patch('/:clientId/updates/:updateId', async (req: AuthRequest, res) => {
  try {
    const { content, nextSteps } = z.object({ content: z.string().optional(), nextSteps: z.string().optional() }).parse(req.body)
    const update = await queryOne<any>(
      'UPDATE status_updates SET content = COALESCE($1, content), next_steps = COALESCE($2, next_steps) WHERE id = $3 AND agency_id = $4 RETURNING *',
      [content, nextSteps, req.params.updateId, req.agencyId]
    )
    if (!update) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Update not found', status: 404 } })
    return res.json({ data: update })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update', status: 500 } })
  }
})

updatesRouter.delete('/:clientId/updates/:updateId', async (req: AuthRequest, res) => {
  try {
    await query('DELETE FROM status_updates WHERE id = $1 AND agency_id = $2', [req.params.updateId, req.agencyId])
    return res.json({ data: { message: 'Update deleted' } })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete update', status: 500 } })
  }
})
