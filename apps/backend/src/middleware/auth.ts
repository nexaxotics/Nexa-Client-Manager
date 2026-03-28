import { Request, Response, NextFunction } from 'express'
import { importSPKI, jwtVerify } from 'jose'

export interface AuthRequest extends Request {
  agencyId?: string
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.access_token
    if (!token) {
      return res.status(401).json({ error: { code: 'AUTH_TOKEN_EXPIRED', message: 'Authentication required', status: 401 } })
    }

    const publicKeyPem = Buffer.from(process.env.JWT_PUBLIC_KEY ?? '', 'base64').toString('utf-8')
    const publicKey = await importSPKI(publicKeyPem, 'RS256')
    const { payload } = await jwtVerify(token, publicKey, { algorithms: ['RS256'] })

    req.agencyId = payload.sub as string
    return next()
  } catch (_err) {
    return res.status(401).json({ error: { code: 'AUTH_TOKEN_EXPIRED', message: 'Invalid or expired token', status: 401 } })
  }
}
