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
                    i++; 
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
                if (char === '\r' && rawData[i + 1] === '\n') {
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
    
    let updatedCount = 0;
    
    // Process rows to update passwords
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 3) continue;
        
        const email = row[2]; // Institute Email ID
        const rollNo = row[row.length - 1]; // Roll Number is the last column
        
        if (email && rollNo) {
            try {
                const existing = await prisma.reviewer.findUnique({
                    where: { email }
                });
                
                if (existing && existing.password !== rollNo) {
                    await prisma.reviewer.update({
                        where: { email },
                        data: { password: rollNo }
                    });
                    console.log(`Updated password for ${email} to ${rollNo}`);
                    updatedCount++;
                } else if (existing) {
                    // Password already matches
                } else {
                    console.log(`Reviewer ${email} not found in database.`);
                }
            } catch (err) {
                console.error(`Failed to update ${email}:`, err);
            }
        }
    }
    
    console.log(`\nSuccessfully updated passwords for ${updatedCount} reviewers.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
