import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'
import { logger } from './lib/logger'
import { authRouter } from './routes/auth'
import { agencyRouter } from './routes/agency'
import { clientsRouter } from './routes/clients'
import { documentsRouter } from './routes/documents'
import { updatesRouter } from './routes/updates'
import { dashboardRouter } from './routes/dashboard'
import { emailsRouter } from './routes/emails'

const app = express()
const PORT = process.env.PORT ?? 3001

// Security / middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

// Global rate limit
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests', status: 429 } },
}))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/auth', authRouter)
app.use('/agency', agencyRouter)
app.use('/clients', clientsRouter)
app.use('/clients', documentsRouter)
app.use('/clients', updatesRouter)
app.use('/clients', emailsRouter)
app.use('/dashboard', dashboardRouter)

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found', status: 404 } })
})

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err, 'Unhandled error')
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', status: 500 } })
})

app.listen(PORT, () => {
  logger.info(`Nexaxotics API running on port ${PORT}`)
  // Trigger restart for new env
})

export default app
