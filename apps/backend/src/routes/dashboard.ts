import { Router } from 'express'
import { authMiddleware, type AuthRequest } from '../middleware/auth'
import { query, queryOne } from '../lib/db'
import { logger } from '../lib/logger'

export const dashboardRouter = Router()
dashboardRouter.use(authMiddleware as any)

dashboardRouter.get('/stats', async (req: AuthRequest, res) => {
  try {
    const [totalClients] = await query<any>('SELECT COUNT(*) as count FROM clients WHERE agency_id = $1 AND deleted_at IS NULL', [req.agencyId])
    const [activeClients] = await query<any>('SELECT COUNT(*) as count FROM clients WHERE agency_id = $1 AND status = $2 AND deleted_at IS NULL', [req.agencyId, 'active'])
    const [docsThisMonth] = await query<any>("SELECT COUNT(*) as count FROM documents WHERE agency_id = $1 AND generated_at >= date_trunc('month', NOW())", [req.agencyId])
    const [emailsThisMonth] = await query<any>("SELECT COUNT(*) as count FROM email_logs WHERE agency_id = $1 AND sent_at >= date_trunc('month', NOW()) AND status = 'sent'", [req.agencyId])

    return res.json({
      data: {
        totalClients: Number(totalClients.count),
        activeClients: Number(activeClients.count),
        docsGeneratedThisMonth: Number(docsThisMonth.count),
        emailsSentThisMonth: Number(emailsThisMonth.count),
      }
    })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats', status: 500 } })
  }
})

dashboardRouter.get('/pipeline', async (req: AuthRequest, res) => {
  try {
    const stages = await query<any>(
      'SELECT lifecycle_stage as stage, COUNT(*) as count FROM clients WHERE agency_id = $1 AND deleted_at IS NULL AND status = $2 GROUP BY lifecycle_stage ORDER BY lifecycle_stage',
      [req.agencyId, 'active']
    )
    return res.json({ data: stages.map(s => ({ stage: Number(s.stage), count: Number(s.count) })) })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch pipeline', status: 500 } })
  }
})

dashboardRouter.get('/activity', async (req: AuthRequest, res) => {
  try {
    // Get recent activity by combining events
    const docEvents = await query<any>(
      `SELECT d.id, 'doc_generated' as type, 
        c.business_name as client_name,
        d.generated_at as timestamp,
        CONCAT('Document generated for ', c.business_name) as message
       FROM documents d JOIN clients c ON d.client_id = c.id
       WHERE d.agency_id = $1 AND d.generated_at IS NOT NULL
       ORDER BY d.generated_at DESC LIMIT 10`,
      [req.agencyId]
    )
    const emailEvents = await query<any>(
      `SELECT el.id, 'email_sent' as type,
        c.business_name as client_name,
        el.sent_at as timestamp,
        CONCAT('Email sent to ', c.business_name) as message
       FROM email_logs el JOIN clients c ON el.client_id = c.id  
       WHERE el.agency_id = $1
       ORDER BY el.sent_at DESC LIMIT 10`,
      [req.agencyId]
    )

    const combined = [...docEvents, ...emailEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)

    return res.json({ data: combined })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch activity', status: 500 } })
  }
})
