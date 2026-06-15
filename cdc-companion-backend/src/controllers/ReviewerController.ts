// src/controllers/ReviewerController.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { sendReviewEmail } from './mailer'
import prisma from '../prisma'


interface JwtPayload {
  id: number
  name: string
  profiles: string[]
}

export default class ReviewerController {
  // POST /api/reviewer/signup
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, rollNo, email, contactNumber, profiles, reviewsNumber } = req.body

      if (!name || !rollNo || !email || !profiles || !reviewsNumber) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const existing = await prisma.reviewer.findUnique({ where: { name } })
      if (existing) {
        return res.status(400).json({ error: 'A reviewer with this name already exists' })
      }

      // Roll Number acts as the password since it has the seniority year prefix (e.g. 21CS10001 starting with '21')
      const reviewer = await prisma.reviewer.create({
        data: {
          name,
          password: rollNo,
          email,
          profiles,
          reviewsNumber: Number(reviewsNumber),
          reviewedCount: 0
        }
      })

      return res.status(201).json({
        message: 'Signup successful',
        reviewer: {
          id: reviewer.id,
          name: reviewer.name,
          email: reviewer.email,
        }
      })
    } catch (err) {
      next(err)
    }
  }

  // POST /api/reviewer/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, password } = req.body
      const reviewer = await prisma.reviewer.findUnique({ where: { name } })
      if (!reviewer || reviewer.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const payload: JwtPayload = {
        id: reviewer.id,
        name: reviewer.name,
        profiles: reviewer.profiles,
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: '8h',
      })

      return res.json({
        token,
        reviewer: {
          id: reviewer.id,
          name: reviewer.name,
          profiles: reviewer.profiles,
          reviewedCount: reviewer.reviewedCount,
        },
      })
    } catch (err) {
      next(err)
    }
  }

  // GET /api/reviewer/next
  async getNextCV(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.headers.authorization
      if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' })
      }
      const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as JwtPayload

      const reviewer = await prisma.reviewer.findUnique({ where: { id: payload.id } })
      if (!reviewer) {
        return res.status(404).json({ error: 'Reviewer not found' })
      }

      const reviewee = await prisma.reviewee.findFirst({
        where: {
          assignedToId: null,
          profile: { in: reviewer.profiles },
        },
      })
      if (!reviewee) {
        return res.status(204).send()
        
      }

    //   await prisma.reviewer.update({
    //     where: { id: payload.id },
    //     data: { reviewedCount: { increment: 1 } },
    //   })

      await prisma.reviewee.update({
        where: { id: reviewee.id },
        data: { assignedToId: payload.id },
      })

      return res.json(reviewee)
    } catch (err) {
      next(err)
    }
  }

  // POST /api/reviewer/review
  async submitReview(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.headers.authorization
      if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' })
      }
      const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as JwtPayload

      const { revieweeId, comments } = req.body
      if (!Array.isArray(comments)) {
        return res.status(400).json({ error: 'Comments must be an array' })
      }

      const review = await prisma.review.upsert({
        where: { revieweeId },
        update: {
          comments,
          reviewerId: payload.id,
        },
        create: {
          revieweeId,
          reviewerId: payload.id,
          comments,
        },
      })

      await prisma.reviewee.update({
        where: { id: revieweeId },
        data: { status: true, submittedAt: new Date() },
      })
      await prisma.reviewer.update({
        where: { id: payload.id },
        data: { reviewedCount: { increment: 1 } },
      })

      const re = await prisma.reviewee.findUnique({
        where: { id: revieweeId },
        select: { email: true, name: true },
      })
      if (re?.email) {
        // Uncomment to send email notification
        // await transporter.sendMail({
        //   to: re.email,
        //   from: process.env.SMTP_FROM!,
        //   subject: 'Your CV has been reviewed',
        //   text: `Hi ${re.name},\n\nYour CV has been reviewed. Feedback:\n\n${comments.join('\n')}`,
        // })

const labels = [
  'Structure & Format',
  'Relevance to Domain',
  'Depth of Explanation',
  'Language and Grammar',
  'Improvements in Projects',
  'Additional Suggestions',
]

// const rawComments = [
//   'Clear headings but add spacing.',
//   'Good alignment with the target industry.',
//   'Could use more examples to illustrate key points.',
//   'Watch comma usage and tense consistency.',
//   'Expand on your role in project outcomes.',
//   'Consider adding a summary at the end.',
// ]

// pair label with each comment:
const formattedComments = labels.map((label, idx) => 
  `${label}: ${comments[idx]}`
)

sendReviewEmail({
  to: re.email,
  userName: re.name,
  reviewComments: formattedComments,
}).catch((mailErr) => {
  console.error("Failsafe: Error sending review email:", mailErr)
})



      }

      return res.status(201).json(review)
    } catch (err) {
      next(err)
    }
  }

  // GET /api/reviewer/assigned
  async getAssignedCVs(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.headers.authorization
      if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' })
      }
      const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as JwtPayload

      // fetch reviewer details
      const reviewer = await prisma.reviewer.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          name: true,
          profiles: true,
          reviewedCount: true,
          reviewsNumber: true,
        },
      })
      if (!reviewer) {
        return res.status(404).json({ error: 'Reviewer not found' })
      }

      // fetch all reviewees assigned to this reviewer
      const assigned = await prisma.reviewee.findMany({
        where: { assignedToId: payload.id },
        select: {
          id: true,
          name: true,
          rollNo: true,
          email: true,
          cvLink: true,
          profile: true,
          status: true,
          submittedAt: true,
          review: {
            select: {
              comments: true,
            },
          },
        },
      })

      return res.json({
        reviewer,
        assigned,
      })
    } catch (err) {
      next(err)
    }
  }
}