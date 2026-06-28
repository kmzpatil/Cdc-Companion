import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { sendReviewerRegistrationEmail } from '../src/controllers/mailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

// These were duplicates during the import, we skip them
const DUPLICATES = [
  'koushik2005debnath@kgpian.iitkgp.ac.in',
  'harjag2005@kgpian.iitkgp.ac.in',
  'jauhalsamarth@kgpian.iitkgp.ac.in',
  'kunalmandalgk@kgpian.iitkgp.ac.in'
];

async function main() {
  const allReviewers = await prisma.reviewer.findMany();
  
  // To avoid sending emails to older reviewers who are not in the sheet,
  // we could either read the sheet again, or just send to those who were added today, 
  // or those whose email is NOT in DUPLICATES (assuming the db was empty or mostly empty).
  // The user said "those who were imported from the shhet". Let's assume it's everyone 
  // in the DB who is NOT a duplicate, or better yet, read the sheet again and intersect.
  
  const csvPath = 'c:\\Users\\kmzpa\\Desktop\\Cdc comp\\CV Review Drive (Responses) - Form responses 1.csv';
  const rawData = fs.readFileSync(csvPath, 'utf8');
  
  const emailsInSheet = new Set<string>();
  
  let currentCell = '';
  let inQuotes = false;
  let rowCount = 0;
  let cellCount = 0;
  
  for (let i = 0; i < rawData.length; i++) {
      const char = rawData[i];
      if (inQuotes) {
          if (char === '"' && i + 1 < rawData.length && rawData[i + 1] === '"') {
              currentCell += '"'; i++;
          } else if (char === '"') {
              inQuotes = false;
          } else {
              currentCell += char;
          }
      } else {
          if (char === '"') inQuotes = true;
          else if (char === ',') {
              if (rowCount > 0 && cellCount === 2) { // Column 2 is Email
                  emailsInSheet.add(currentCell.trim());
              }
              currentCell = '';
              cellCount++;
          } else if (char === '\r' || char === '\n') {
              if (char === '\r' && rawData[i + 1] === '\n') i++;
              if (rowCount > 0 && cellCount === 2) emailsInSheet.add(currentCell.trim());
              rowCount++;
              cellCount = 0;
              currentCell = '';
          } else {
              currentCell += char;
          }
      }
  }
  if (rowCount > 0 && cellCount === 2) emailsInSheet.add(currentCell.trim());

  let sent = 0;
  
  for (const reviewer of allReviewers) {
    if (emailsInSheet.has(reviewer.email) && !DUPLICATES.includes(reviewer.email)) {
      console.log(`Sending email to ${reviewer.email}...`);
      try {
        await sendReviewerRegistrationEmail(
          reviewer.email,
          reviewer.name,
          reviewer.password,
          reviewer.profiles
        );
        console.log(`Successfully sent email to ${reviewer.email}`);
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${reviewer.email}:`, err);
      }
    }
  }
  
  console.log(`Total emails sent: ${sent}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
