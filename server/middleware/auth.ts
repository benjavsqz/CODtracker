import { Request, Response, NextFunction } from 'express'

// Middleware opcional para proteger la API con un token simple.
// Activar pasando el header: x-api-key: <API_SECRET del .env>
// Por defecto está desactivado para desarrollo local.
export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.API_SECRET
  if (!secret) return next()

  const provided = req.headers['x-api-key']
  if (provided !== secret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}
