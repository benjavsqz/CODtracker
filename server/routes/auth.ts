import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../services/db'

const router = Router()

router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son requeridos' })

  try {
    const hash = await bcrypt.hash(password, 10)
    const result = await query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username.trim(), email.trim().toLowerCase(), hash]
    )
    const user = result.rows[0]
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )
    res.status(201).json({ token, user })
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email o username ya en uso' })
    res.status(500).json({ error: 'Error al registrar usuario' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' })

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()])
    const user = result.rows[0]
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Credenciales inválidas' })

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

export default router
