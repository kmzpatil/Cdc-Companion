import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import revieweeRoutes from './routes/RevieweeRoutes'
import reviewerRoutes from './routes/ReviewerRoutes'
import adminRoutes    from './routes/AdminRoutes'
import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { rateLimiter } from './middleware/rateLimiter'

const app = express()

app.use(cors())
app.use(express.json())

// Apply global rate limiter: Max 150 requests per minute per IP
app.use(rateLimiter(60 * 1000, 150))

app.use('/api/reviewee', revieweeRoutes)
app.use('/api/reviewer', reviewerRoutes)
app.use('/api/admin',    adminRoutes)

// Ping endpoint to keep the server alive on platforms like Render
app.get('/api/ping', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

interface ErrorWithStatus extends Error {
    status?: number
}

app.use(
  '/assets',
  express.static(path.join(__dirname, '../public/assets'))
)

app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`))
