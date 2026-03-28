import { Router } from 'express'
import { authMiddleware, type AuthRequest } from '../middleware/auth'
import { query, queryOne } from '../lib/db'
import { logger } from '../lib/logger'

export const emailsRouter = Router()
emailsRouter.use(authMiddleware as any)

emailsRouter.get('/:clientId/emails', async (req: AuthRequest, res) => {
  try {
    const emails = await query<any>(
      'SELECT * FROM email_logs WHERE client_id = $1 AND agency_id = $2 ORDER BY sent_at DESC',
      [req.params.clientId, req.agencyId]
    )
    return res.json({ data: emails })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch emails', status: 500 } })
  }
})

emailsRouter.post('/:clientId/documents/:type/send-email', async (req: AuthRequest, res) => {
  try {
    const { clientId, type } = req.params
    const { to, subject, body: emailBody } = req.body

    const client = await queryOne<any>('SELECT * FROM clients WHERE id = $1 AND agency_id = $2', [clientId, req.agencyId])
    if (!client) return res.status(404).json({ error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found', status: 404 } })

    const toEmail = to ?? client.email
    // TODO: Implement actual SendGrid send + PDF generation
    // For now, log the email send
    const emailLog = await queryOne<any>(
      'INSERT INTO email_logs (id, agency_id, client_id, to_email, subject, status) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING *',
      [req.agencyId, clientId, toEmail, subject ?? `Document: ${type}`, 'sent']
    )

    // Update document status to 'sent'
    await query(
      'UPDATE documents SET status = $1, sent_at = NOW(), sent_to_email = $2 WHERE client_id = $3 AND agency_id = $4 AND doc_type = $5',
      ['sent', toEmail, clientId, req.agencyId, type]
    )

    return res.json({ data: { message: 'Email sent', emailLog } })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'EMAIL_SEND_FAILED', message: 'Failed to send email', status: 500 } })
  }
})
