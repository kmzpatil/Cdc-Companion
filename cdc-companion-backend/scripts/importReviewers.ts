import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const csvPath = 'c:\\Users\\kmzpa\\Desktop\\Cdc comp\\CV Review Drive (Responses) - Form responses 1.csv';

async function main() {
    const rawData = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV properly handling quotes and newlines
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;
    
    for (let i = 0; i < rawData.length; i++) {
        const char = rawData[i];
        
        if (inQuotes) {
            if (char === '"') {
                if (i + 1 < rawData.length && rawData[i + 1] === '"') {
                    currentCell += '"';
                    i++; // Skip escaped quote
                } else {
                    inQuotes = false;
                }
            } else {
                currentCell += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentCell.trim());
                currentCell = '';
            } else if (char === '\r' || char === '\n') {
                // handle \r\n
                if (char === '\r' && i + 1 < rawData.length && rawData[i + 1] === '\n') {
                    i++;
                }
                currentRow.push(currentCell.trim());
                if (currentRow.length > 1 || currentRow[0] !== '') {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
    }
    
    if (currentCell !== '' || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
    }
    
    // Process rows
    let added = 0;
    let duplicates = 0;
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 5) continue; // Skip empty/invalid lines
        
        const timestamp = row[0];
        const name = row[1];
        const email = row[2];
        const rawProfiles = row[3];
        const numCVsStr = row[4];
        const questions = row[5] || '';
        
        if (!email) continue;
        
        // Check for duplicate
        const existing = await prisma.reviewer.findUnique({
            where: { email }
        });
        
        if (existing) {
            console.log(`Duplicate found, skipping: ${email}`);
            duplicates++;
            continue;
        }
        
        // Parse profiles
        const profiles = rawProfiles.split(',').map(p => p.trim()).filter(p => p);
        const reviewsNumber = parseInt(numCVsStr, 10) || 5;
        
        // Simple heuristic based on the "Any questions" column
        const interestedInMockInterview = !questions.toLowerCase().includes('not mock interviews');
        
        await prisma.reviewer.create({
            data: {
                name,
                email,
                password: email.split('@')[0], // Use email prefix as default password
                profiles: profiles,
                reviewsNumber,
                interestedInMockInterview
            }
        });
        
        console.log(`Added reviewer: ${name} (${email})`);
        added++;
    }
    
    console.log(`\nImport complete! Added: ${added}, Skipped (duplicates): ${duplicates}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
