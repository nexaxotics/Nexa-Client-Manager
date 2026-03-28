import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { authMiddleware, type AuthRequest } from '../middleware/auth'
import { query, queryOne } from '../lib/db'
import { logger } from '../lib/logger'
import { generateDocumentHtml } from '../lib/pdfTemplates'

export const documentsRouter = Router()
documentsRouter.use(authMiddleware as any)

const DOC_TYPES = ['agreement', 'welcome_kit', 'invoice', 'access_request', 'kickoff', 'dashboard', 'weekly_update', 'monthly_report', 'feedback', 'offboarding']

documentsRouter.get('/:clientId/documents', async (req: AuthRequest, res) => {
  try {
    // Verify client belongs to agency
    const client = await queryOne('SELECT id FROM clients WHERE id = $1 AND agency_id = $2', [req.params.clientId, req.agencyId])
    if (!client) return res.status(404).json({ error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found', status: 404 } })

    const docs = await query<any>('SELECT * FROM documents WHERE client_id = $1 AND agency_id = $2 ORDER BY doc_type', [req.params.clientId, req.agencyId])
    return res.json({ data: docs })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch documents', status: 500 } })
  }
})

documentsRouter.post('/:clientId/documents/:type/generate', async (req: AuthRequest, res) => {
  try {
    const { clientId, type } = req.params
    if (!DOC_TYPES.includes(type)) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid document type', status: 400 } })

    const client = await queryOne('SELECT id FROM clients WHERE id = $1 AND agency_id = $2', [clientId, req.agencyId])
    if (!client) return res.status(404).json({ error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found', status: 404 } })

    // Upsert document record
    const doc = await queryOne<any>(
      `INSERT INTO documents (id, client_id, agency_id, doc_type, status, generated_at)
       VALUES ($1, $2, $3, $4, 'generated', NOW())
       ON CONFLICT (client_id, doc_type) DO UPDATE SET status = 'generated', generated_at = NOW(), updated_at = NOW()
       RETURNING *`,
      [uuidv4(), clientId, req.agencyId, type]
    )
    return res.json({ data: doc })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'DOC_GENERATION_FAILED', message: 'Failed to generate document', status: 500 } })
  }
})

documentsRouter.get('/:clientId/documents/:type/download', async (req: AuthRequest, res) => {
  try {
    const { clientId, type } = req.params

    const client = await queryOne<any>('SELECT * FROM clients WHERE id = $1 AND agency_id = $2', [clientId, req.agencyId])
    if (!client) return res.status(404).json({ error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found', status: 404 } })

    const agency = await queryOne<any>('SELECT * FROM agencies WHERE id = $1', [req.agencyId])
    
    const puppeteer = require('puppeteer')
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()
    
    const html = generateDocumentHtml(agency, client, type)
    
    await page.setContent(html, { waitUntil: 'load' })
    const pdfBuffer = await page.pdf({ format: 'A4', margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' } })
    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${type}.pdf"`)
    return res.end(pdfBuffer)
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to generate PDF download', status: 500 } })
  }
})

documentsRouter.patch('/:clientId/documents/:type', async (req: AuthRequest, res) => {
  try {
    const { clientId, type } = req.params
    const { status, customData } = z.object({
      status: z.enum(['draft', 'generated', 'sent', 'acknowledged']).optional(),
      customData: z.record(z.unknown()).optional(),
    }).parse(req.body)

    const doc = await queryOne<any>(
      `UPDATE documents SET
        status = COALESCE($1, status),
        custom_data = COALESCE($2, custom_data),
        updated_at = NOW()
       WHERE client_id = $3 AND agency_id = $4 AND doc_type = $5
       RETURNING *`,
      [status, customData ? JSON.stringify(customData) : null, clientId, req.agencyId, type]
    )
    if (!doc) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found', status: 404 } })
    return res.json({ data: doc })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update document', status: 500 } })
  }
})
