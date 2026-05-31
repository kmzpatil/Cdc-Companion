import { NextFunction, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { sendRegistrationEmail } from './mailer'

const prisma = new PrismaClient()

/**
 * POST /api/reviewee/submit
 * Body: { name, rollNo, email, password, cvLink, profile }
 */

export default class RevieweeController {
  async submitCV(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, rollNo, email, password, cvLink, profile } = req.body

      if (!name || !rollNo || !email || !password || !cvLink || !profile) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      if (!cvLink.includes('drive.google.com') && !cvLink.includes('docs.google.com')) {
        return res.status(400).json({ error: 'Please submit a valid Google Drive or Google Docs link.' })
      }

      const reviewee = await prisma.reviewee.create({
        data: {
          name,
          rollNo,
          email,
          password,
          cvLink,
          profile,
        },
      })

      console.log("cv submitted")

      // Send confirmation email containing their details and password
      try {
        await sendRegistrationEmail(email, name, password, cvLink, profile)
      } catch (mailErr) {
        console.error("Failsafe: Error sending registration email:", mailErr)
      }

      return res.status(201).json(reviewee)
    } catch (err: any) {
      console.error(err)
      if (err.code === 'P2002') {
        return res.status(400).json({ error: 'Roll number already registered' })
      }
      return res.status(500).json({ error: 'Server error' })
    }
  }

  async checkStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' })
      }

      const submission = await prisma.reviewee.findFirst({
        where: { email },
        include: {
          review: {
            include: {
              reviewer: true
            }
          }
        }
      })

      if (!submission) {
        return res.status(404).json({ error: 'No submission found for this email address.' })
      }

      if (submission.password !== password) {
        return res.status(401).json({ error: 'Invalid password. Please try again.' })
      }

      const result: any = {
        submission: {
          id: submission.id,
          name: submission.name,
          email: submission.email,
          rollNo: submission.rollNo,
          profile: submission.profile,
          cvLink: submission.cvLink,
          submissionTime: submission.submittedAt,
          status: submission.status
        }
      }

      if (submission.review) {
        result.feedback = {
          id: submission.review.id,
          comments: submission.review.comments,
          submissionTime: submission.review.createdAt,
          reviewer: {
            name: submission.review.reviewer.name,
            id: submission.review.reviewer.id
          }
        }
      }

      return res.json(result)
    } catch (err: any) {
      console.error(err)
      return res.status(500).json({ error: 'Server error' })
    }
  }

  async getSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.params
      if (!email) {
        return res.status(400).json({ error: 'Missing email' })
      }

      const submission = await prisma.reviewee.findFirst({
        where: { email },
        include: {
          review: {
            include: {
              reviewer: true
            }
          }
        }
      })

      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' })
      }

      const result: any = {
        submission: {
          id: submission.id,
          name: submission.name,
          email: submission.email,
          rollNo: submission.rollNo,
          profile: submission.profile,
          cvLink: submission.cvLink,
          submissionTime: submission.submittedAt,
          status: submission.status
        }
      }

      if (submission.review) {
        result.feedback = {
          id: submission.review.id,
          comments: submission.review.comments,
          submissionTime: submission.review.createdAt,
          reviewer: {
            name: submission.review.reviewer.name,
            id: submission.review.reviewer.id
          }
        }
      }

      return res.json(result)
    } catch (err: any) {
      console.error(err)
      return res.status(500).json({ error: 'Server error' })
    }
  }
}