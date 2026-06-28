import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../prisma'
import { sendReviewerReminderEmail } from './mailer'


function normalizeProfile(p: string): string {
  const upper = p.toUpperCase().replace(/\s+/g, '').replace(/[-_\/]/g, '');
  if (upper === 'SOFTWARE' || upper === 'SDE') return 'SOFTWARE';
  if (upper === 'FINANCE') return 'FINANCE';
  if (upper === 'QUANT') return 'QUANT';
  if (upper === 'PRODUCTFMCG' || upper === 'FMCG') return 'PRODUCT_FMCG';
  return upper;
}

export default class AdminController {
  // ... (rest of class)

  // POST /api/admin/login

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, password } = req.body
      const admin = await prisma.admin.findUnique({ where: { name } })
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const payload = {
        id: admin.id,
        name: admin.name,
        isAdmin: true,
      }

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET! /* make sure you have this in .env */,
        { expiresIn: '8h' }
      )

      // Return the token and any user info you need on the client
      return res.json({
        token,
        admin: {
          id: admin.id,
          name: admin.name,
        }
      })
    } catch (err: any) {
      next(err)
    }
  }

  // GET /api/admin/reviewees
  async listReviewees(req: Request, res: Response, next: NextFunction) {
    try {
      const all = await prisma.reviewee.findMany({ include: { assignedTo: true, review: true } })
      return res.json(all)
    } catch (err: any) {
      next(err)
    }
  }

  // GET /api/admin/reviewers
  async listReviewers(req: Request, res: Response, next: NextFunction) {
    try {
      const all = await prisma.reviewer.findMany({  select: {
    id:            true,
    name:          true,
    password:      true,      // now valid
    profiles:      true,
    reviewsNumber: true,
    reviewedCount: true,
    email:         true,
    admin:         true,
    assignedCVs:   true,
    reviewsGiven:  true,
  } })
      return res.json(all)
    } catch (err: any) {
      next(err)
    }
  }

  // GET /api/admin/reviews
  async listReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const all = await prisma.review.findMany({ include: { reviewee: true, reviewer: true } })
      return res.json(all)
    } catch (err: any) {
      next(err)
    }
  }

  // POST /api/admin/allocate
  // POST /api/admin/allocate
// POST /api/admin/allocate
async allocate(req: Request, res: Response, next: NextFunction) {
  try {
    const pending = await prisma.reviewee.findMany({
      where: { assignedToId: null },
    });

    if (!pending.length) {
      return res.json({ message: 'No CVs to allocate' });
    }

    // 1. PRE-PROCESS AND SORT CVs
    // Sort ascending by rollPrefix: 23-batch CVs get processed BEFORE 24-batch CVs.
    const pendingOptimized = pending
      .map(cv => ({
        ...cv,
        rollPrefix: parseInt(cv.rollNo.slice(0, 2), 10),
        normProfile: normalizeProfile(cv.profile) // cache this to save CPU
      }))
      .sort((a, b) => a.rollPrefix - b.rollPrefix); 

    const rawReviewers = await prisma.reviewer.findMany({
      include: { assignedCVs: true },
    });

    // Pre-compute reviewer prefixes and profiles to avoid doing it inside the loop
    const reviewers = rawReviewers.map(r => ({
      ...r,
      pwdPrefix: parseInt(r.password.slice(0, 2), 10),
      normProfiles: r.profiles.map(normalizeProfile)
    }));

    for (const cv of pendingOptimized) {
      const eligible = reviewers
        .filter(r => {
          return (
            r.normProfiles.includes(cv.normProfile) && // Format-insensitive profile check
            r.assignedCVs.length < r.reviewsNumber &&  // Hasn't hit quota
            r.pwdPrefix < cv.rollPrefix                // Strict seniority rule
          );
        })
        .sort((a, b) => {
          // Primary Sort: Load balancing (whoever has fewer assigned CVs)
          if (a.assignedCVs.length !== b.assignedCVs.length) {
            return a.assignedCVs.length - b.assignedCVs.length;
          }
          
          // Secondary Sort: Conserve your super-seniors!
          // If a 23-batch and a 22-batch reviewer have the exact same workload, 
          // we want the 23-batch reviewer to take it (higher prefix number = less senior).
          return b.pwdPrefix - a.pwdPrefix; 
        });

      if (!eligible.length) continue;

      const chosen = eligible[0];

      // Assign in DB
      await prisma.reviewee.update({
        where: { id: cv.id },
        data: { assignedToId: chosen.id },
      });

      // Bump their reviewedCount
      await prisma.reviewer.update({
        where: { id: chosen.id },
        data: { reviewedCount: { increment: 1 } },
      });

      // Keep in-memory state in sync so the loop correctly evaluates the next CV
      chosen.reviewedCount++;
      chosen.assignedCVs.push(cv as any); // Cast slightly depending on your Prisma types
    }

    return res.json({ message: 'Allocation complete' });
  } catch (err) {
    next(err);
  }
}

  // DELETE /api/admin/reviewee/:id
  async deleteReviewee(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10)
      await prisma.review.deleteMany({ where: { revieweeId: id } })
      await prisma.reviewee.delete({ where: { id } })
      return res.json({ message: 'Reviewee deleted successfully' })
    } catch (err: any) {
      next(err)
    }
  }

  // DELETE /api/admin/reviewer/:id
  async deleteReviewer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10)
      await prisma.reviewee.updateMany({
        where: { assignedToId: id },
        data: { assignedToId: null }
      })
      await prisma.review.deleteMany({ where: { reviewerId: id } })
      await prisma.reviewer.delete({ where: { id } })
      return res.json({ message: 'Reviewer deleted successfully' })
    } catch (err: any) {
      next(err)
    }
  }

  // DELETE /api/admin/review/:id
  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10)
      const review = await prisma.review.findUnique({
        where: { id },
        select: { revieweeId: true, reviewerId: true }
      })
      if (review) {
        // Reset reviewee status
        await prisma.reviewee.update({
          where: { id: review.revieweeId },
          data: { status: false }
        })
        // Decrement reviewer count
        const reviewer = await prisma.reviewer.findUnique({ where: { id: review.reviewerId } })
        if (reviewer && reviewer.reviewedCount > 0) {
          await prisma.reviewer.update({
            where: { id: review.reviewerId },
            data: { reviewedCount: { decrement: 1 } }
          })
        }
      }
      await prisma.review.delete({ where: { id } })
      return res.json({ message: 'Review deleted successfully' })
    } catch (err: any) {
      next(err)
    }
  }

  // POST /api/admin/reassign
  async reassign(req: Request, res: Response, next: NextFunction) {
    try {
      const { revieweeId, reviewerId } = req.body
      const rId = reviewerId ? parseInt(reviewerId, 10) : null
      const cvId = parseInt(revieweeId, 10)

      const cv = await prisma.reviewee.findUnique({
        where: { id: cvId },
      })

      if (!cv) {
        return res.status(404).json({ error: 'CV/Reviewee not found' })
      }

      const oldReviewerId = cv.assignedToId

      // Update the assignment
      await prisma.reviewee.update({
        where: { id: cvId },
        data: { assignedToId: rId },
      })

      // Adjust counts for old reviewer
      if (oldReviewerId && oldReviewerId !== rId) {
        const oldReviewer = await prisma.reviewer.findUnique({ where: { id: oldReviewerId } })
        if (oldReviewer && oldReviewer.reviewedCount > 0) {
          await prisma.reviewer.update({
            where: { id: oldReviewerId },
            data: { reviewedCount: { decrement: 1 } },
          })
        }
      }

      // Adjust counts for new reviewer
      if (rId && oldReviewerId !== rId) {
        await prisma.reviewer.update({
          where: { id: rId },
          data: { reviewedCount: { increment: 1 } },
        })
      }

      return res.json({ message: 'Assignment updated successfully' })
    } catch (err: any) {
      next(err)
    }
  }

  // POST /api/admin/remind
  async sendReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewerId } = req.body || {}

      if (reviewerId) {
        // Remind a single reviewer
        const rId = parseInt(reviewerId, 10)
        const reviewer = await prisma.reviewer.findUnique({
          where: { id: rId },
          include: { assignedCVs: true }
        })

        if (!reviewer) {
          return res.status(404).json({ error: 'Reviewer not found' })
        }

        const pendingCVs = reviewer.assignedCVs.filter(cv => !cv.status)
        if (pendingCVs.length === 0) {
          return res.status(400).json({ error: 'Reviewer has no pending CV reviews' })
        }

        await sendReviewerReminderEmail(reviewer.email, reviewer.name, reviewer.password, pendingCVs.length)
        return res.json({ message: `Reminder email successfully sent to ${reviewer.name}` })
      } else {
        // Remind all reviewers who have pending CVs
        const reviewers = await prisma.reviewer.findMany({
          include: { assignedCVs: true }
        })

        let emailsSent = 0
        for (const reviewer of reviewers) {
          const pendingCVs = reviewer.assignedCVs.filter(cv => !cv.status)
          if (pendingCVs.length > 0) {
            await sendReviewerReminderEmail(reviewer.email, reviewer.name, reviewer.password, pendingCVs.length)
            emailsSent++
          }
        }

        return res.json({ message: `Reminder emails successfully sent to ${emailsSent} reviewer(s)` })
      }
    } catch (err: any) {
      next(err)
    }
  }
}