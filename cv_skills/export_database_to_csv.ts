import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const escapeCsv = (value: unknown): string => {
  if (value === null || value === undefined) {
    return ''
  }

  let text: string
  if (value instanceof Date) {
    text = value.toISOString()
  } else if (Array.isArray(value)) {
    text = value.join(' | ')
  } else if (typeof value === 'object') {
    text = JSON.stringify(value)
  } else {
    text = String(value)
  }

  return `"${text.replace(/"/g, '""')}"`
}

const writeCsv = (filePath: string, headers: string[], rows: Array<Record<string, unknown>>) => {
  const lines = [headers.join(',')]
  for (const row of rows) {
    const line = headers.map(header => escapeCsv(row[header])).join(',')
    lines.push(line)
  }
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8')
}

const main = async () => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL must be set in the environment.')
    process.exit(1)
  }

  const outputDir = path.resolve(__dirname, '../exports')
  fs.mkdirSync(outputDir, { recursive: true })

  try {
    const reviewees = await prisma.reviewee.findMany({})
    const reviewers = await prisma.reviewer.findMany({})
    const reviews = await prisma.review.findMany({})

    writeCsv(
      path.join(outputDir, 'reviewees.csv'),
      ['id', 'name', 'rollNo', 'email', 'password', 'cvLink', 'profile', 'status', 'submittedAt', 'otpCode', 'otpExpires', 'lastOtpSent', 'assignedToId'],
      reviewees.map(item => ({
        id: item.id,
        name: item.name,
        rollNo: item.rollNo,
        email: item.email,
        password: item.password,
        cvLink: item.cvLink,
        profile: item.profile,
        status: item.status,
        submittedAt: item.submittedAt,
        otpCode: item.otpCode,
        otpExpires: item.otpExpires,
        lastOtpSent: item.lastOtpSent,
        assignedToId: item.assignedToId,
      }))
    )

    writeCsv(
      path.join(outputDir, 'reviewers.csv'),
      ['id', 'name', 'password', 'profiles', 'reviewsNumber', 'reviewedCount', 'email', 'admin'],
      reviewers.map(item => ({
        id: item.id,
        name: item.name,
        password: item.password,
        profiles: item.profiles,
        reviewsNumber: item.reviewsNumber,
        reviewedCount: item.reviewedCount,
        email: item.email,
        admin: item.admin,
      }))
    )

    writeCsv(
      path.join(outputDir, 'reviews.csv'),
      ['id', 'comments', 'aiSuggestions', 'editCount', 'createdAt', 'revieweeId', 'reviewerId'],
      reviews.map(item => ({
        id: item.id,
        comments: item.comments,
        aiSuggestions: item.aiSuggestions,
        editCount: item.editCount,
        createdAt: item.createdAt,
        revieweeId: item.revieweeId,
        reviewerId: item.reviewerId,
      }))
    )

    console.log(`Export completed. CSV files written to ${outputDir}`)
  } catch (error) {
    console.error('Export failed:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
