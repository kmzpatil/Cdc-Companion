  // src/controllers/ReviewerController.ts
  import { Request, Response, NextFunction } from 'express'
  import jwt from 'jsonwebtoken'
  import axios from 'axios'
  import pdfParse from 'pdf-parse'
  import { sendReviewEmail } from './mailer'
  import prisma from '../prisma'
  import path from 'path'

  interface JwtPayload {
    id: number
    name: string
    profiles: string[]
  }

  const getGoogleFileId = (url: string): { id: string | null; type: 'document' | 'file' | null } => {
    const docMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)
    if (docMatch) {
      return { id: docMatch[1], type: 'document' }
    }

    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
    if (fileMatch) {
      return { id: fileMatch[1], type: 'file' }
    }

    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/)
    if (idParamMatch) {
      return { id: idParamMatch[1], type: 'file' }
    }

    return { id: null, type: null }
  }

  const extractFromGoogleDoc = async (fileId: string): Promise<string> => {
    const exportUrl = `https://docs.google.com/document/d/${fileId}/export?format=txt`
    const response = await axios.get(exportUrl, { responseType: 'text', timeout: 20000 })
    return response.data
  }

  const extractFromPdfBuffer = async (buffer: Buffer): Promise<string> => {
    const result = await pdfParse(buffer as any)
    return result.text || ''
  }

  const extractFromGoogleDriveFile = async (fileId: string): Promise<string> => {
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
    const response = await axios.get(downloadUrl, { responseType: 'arraybuffer', timeout: 20000 })
    const contentType = String(response.headers['content-type'] || '').toLowerCase()
    const buffer = Buffer.from(response.data)

    if (contentType.includes('pdf') || buffer.slice(0, 4).toString() === '%PDF') {
      return extractFromPdfBuffer(buffer)
    }

    const bodyText = buffer.toString('utf8')
    if (contentType.includes('text/html') && bodyText.includes('docs.google.com')) {
      return extractFromGoogleDoc(fileId)
    }

    return bodyText
  }

  const extractTextFromLink = async (url: string): Promise<string> => {
    const { id, type } = getGoogleFileId(url)
    if (!id || !type) {
      return ''
    }

    try {
      if (type === 'document') {
        return await extractFromGoogleDoc(id)
      }

      return await extractFromGoogleDriveFile(id)
    } catch (error) {
      console.error('Text extraction failed for url:', url, error)
      return ''
    }
  }

  export default class ReviewerController {
    // POST /api/reviewer/signup
    async signup(req: Request, res: Response, next: NextFunction) {
      try {
        const { name, rollNo, email, contactNumber, profiles, reviewsNumber } = req.body

        if (!name || !rollNo || !email || !profiles || !reviewsNumber) {
          return res.status(400).json({ error: 'Missing required fields' })
        }

        const existing = await prisma.reviewer.findFirst({
          where: {
            OR: [
              { password: rollNo },
              { email }
            ]
          }
        })
        if (existing) {
          if (existing.password === rollNo) {
            return res.status(400).json({ error: 'A reviewer with this roll number already exists' })
          }
          if (existing.email === email) {
            return res.status(400).json({ error: 'A reviewer with this email already exists' })
          }
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
        const { email, password } = req.body
        if (!email || !password) {
          return res.status(400).json({ error: 'Missing email or password' })
        }
        const reviewer = await prisma.reviewer.findUnique({ where: { email } })
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
        const payload = req.user
        if (!payload) {
          return res.status(401).json({ error: 'Unauthenticated' })
        }

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
        const payload = req.user
        if (!payload) {
          return res.status(401).json({ error: 'Unauthenticated' })
        }

        const { revieweeId, comments } = req.body
        if (!Array.isArray(comments)) {
          return res.status(400).json({ error: 'Comments must be an array' })
        }

        const re = await prisma.reviewee.findUnique({
          where: { id: revieweeId },
          select: { email: true, name: true, cvLink: true, profile: true },
        })
        if (!re) {
          return res.status(404).json({ error: 'Reviewee not found' })
        }

        // Check if a review already exists to prevent duplicate reviewer count increments
        const existingReview = await prisma.review.findUnique({
          where: { revieweeId },
          select: { id: true, editCount: true },
        })

        // Enforce max 3 edits per reviewee
        if (existingReview && existingReview.editCount >= 3) {
          return res.status(403).json({
            error: 'Edit limit reached. You can only edit a review up to 3 times for the same candidate.'
          })
        }

        // 1. Extract CV text from link using a Node.js extractor
        let cvText = ''
        if (re.cvLink) {
          cvText = await extractTextFromLink(re.cvLink)
        }

        // 2. Generate AI Suggestions using Groq API with key rotation
        let aiSuggestions = ''
        const groqKeysStr = process.env.GROQ_API_KEYS || ''
        const groqKeys = groqKeysStr.split(',').map(k => k.trim()).filter(Boolean)
        const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
        
        if (groqKeys.length > 0) {
          const groqUrl = 'https://api.groq.com/openai/v1/chat/completions'
          
          const labels = [
            'Structure & Format',
            'Relevance to Domain',
            'Depth of Explanation',
            'Language and Grammar',
            'Improvements in Projects',
            'Additional Suggestions',
          ]
          const commentsText = comments.map((c, i) => `${labels[i] || 'Feedback'}: ${c}`).join('\n')

          const prompt = `
          You are a ruthless, expert technical resume reviewer for engineering and quantitative placements at IIT Kharagpur. You are reviewing a 1-page technical CV.
          
          CRITICAL CONSTRAINTS — YOU WILL BE PENALIZED FOR VIOLATING THESE:
          1. IGNORE TEXT PARSING ARTIFACTS: The provided CV text is machine-extracted. Table headers or columns may appear mashed together (e.g., "YearDegree/ExamInstituteCGPA/Marks"). DO NOT suggest formatting fixes for these obvious extraction artifacts.
          2. ZERO HR FLUFF: KGP resumes must be ruthlessly dense. NEVER suggest appending empty phrases like "demonstrating academic excellence", "showcasing problem-solving skills", or "demonstrating proficiency". Keep suggestions strictly technical and metric-driven.
          3. DO NOT REWRITE FOR STYLE: If a bullet point already starts with a strong action verb and contains technical details, LEAVE IT ALONE. Do not rewrite "Architected..." to "Designed and implemented..." just to give feedback. 
          4. DO NOT SUMMARIZE LISTS: If a candidate lists specific coursework or skills, do not suggest shortening or summarizing the list (e.g., do not suggest changing a list of 5 math courses into a summary of 3). 
          5. FILTER REVIEWER NOISE: If the human reviewer's feedback is a single word or vague (e.g., "nice", "well written", "perfect"), IGNORE THAT SECTION ENTIRELY. Do not invent arbitrary feedback to fill space.
          
          FORMATTING RULES:
          - DO NOT write any introduction, preamble, or commentary.
          - Start DIRECTLY with the first section heading.
          - Use markdown headings (###) for each section.
          - Use bullet points (-) for individual suggestions.
          - If providing a rewrite, use "**Before:**" and "**After:**" formatting.
          
          Candidate Profile/Track: ${re.profile}
          Reviewer's Diagnostic Feedback:
          ${commentsText}
          
          ${cvText ? `Student's CV (raw text):\n${cvText.slice(0, 8000)}` : 'CV text is not available. Generate actionable suggestions based purely on the reviewer feedback above.'}
          `

          // Try keys one by one
          for (let i = 0; i < groqKeys.length; i++) {
            const currentKey = groqKeys[i]
            try {
              const groqResponse = await fetch(groqUrl, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${currentKey}`
                },
                body: JSON.stringify({
                  model: groqModel,
                  messages: [
                    {
                      role: 'system',
                      content: 'You are an expert resume refiner. Provide direct, highly professional, actionable CV suggestions in clean markdown.'
                    },
                    {
                      role: 'user',
                      content: prompt
                    }
                  ],
                  temperature: 0.0
                })
              })

              if (groqResponse.ok) {
                const groqData = await groqResponse.json() as any
                const content = groqData.choices?.[0]?.message?.content || ''
                if (content.trim()) {
                  aiSuggestions = content
                  break; // Success! Break out of the rotation loop
                } else {
                  console.warn(`Groq API key ${i+1} succeeded but returned empty content. Trying next key.`)
                }
              } else {
                console.error(`Groq API key ${i+1} failed status:`, groqResponse.status)
              }
            } catch (groqErr) {
              console.error(`Error calling Groq API with key ${i+1}:`, groqErr)
            }
          }
        }

        // Offline fallback suggestions if Groq keys fail
        if (!aiSuggestions) {
          aiSuggestions = `### AI CV Refinement Suggestions (Offline Fallback)
  The AI assistant is temporarily busy or reached its request limit. Here is a summary of recommended actions based on the reviewer's feedback:
  * **Address Reviewer Comments**: Focus on the specific items highlighted by the reviewer (e.g., improve structure, add domain-specific terminology).
  * **Quantify Results**: Try to add metrics (percentages, numbers) to your project descriptions and work experience bullet points.
  * **Format Consistency**: Ensure consistent margins, font sizes, and bullet styles throughout the document.`
        }

        // Resolve reviewerId safely (especially if Admin)
        let reviewerId = payload.id
        if (payload.isAdmin) {
          const matchingReviewer = await prisma.reviewer.findFirst({
            where: { name: payload.name }
          })
          if (matchingReviewer) {
            reviewerId = matchingReviewer.id
          } else {
            const adminReviewer = await prisma.reviewer.findFirst({
              where: { admin: true }
            })
            if (adminReviewer) {
              reviewerId = adminReviewer.id
            } else {
              const anyReviewer = await prisma.reviewer.findFirst()
              if (anyReviewer) {
                reviewerId = anyReviewer.id
              } else {
                const defaultReviewer = await prisma.reviewer.create({
                  data: {
                    name: payload.name,
                    email: `${payload.name.toLowerCase().replace(/\s+/g, '')}@kgpian.iitkgp.ac.in`,
                    password: 'adminpassword',
                    reviewsNumber: 9999,
                    admin: true
                  }
                })
                reviewerId = defaultReviewer.id
              }
            }
          }
        }

        const review = await prisma.review.upsert({
          where: { revieweeId },
          update: {
            comments,
            aiSuggestions,
            reviewerId,
            editCount: { increment: 1 },
          },
          create: {
            revieweeId,
            reviewerId,
            comments,
            aiSuggestions,
            editCount: 1,
          },
        })

        await prisma.reviewee.update({
          where: { id: revieweeId },
          data: { status: true, submittedAt: new Date() },
        })

        if (!existingReview) {
          await prisma.reviewer.update({
            where: { id: reviewerId },
            data: { reviewedCount: { increment: 1 } },
          })
        }

        if (re.email) {
          const labels = [
            'Structure & Format',
            'Relevance to Domain',
            'Depth of Explanation',
            'Language and Grammar',
            'Improvements in Projects',
            'Additional Suggestions',
          ]

          const formattedComments = labels.map((label, idx) => 
            `${label}: ${comments[idx]}`
          )

          sendReviewEmail({
            to: re.email,
            userName: re.name,
            reviewComments: formattedComments,
            aiSuggestions: aiSuggestions || undefined,
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
        const payload = req.user
        if (!payload) {
          return res.status(401).json({ error: 'Unauthenticated' })
        }

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