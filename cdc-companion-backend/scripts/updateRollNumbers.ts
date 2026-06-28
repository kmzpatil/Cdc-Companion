import fs from 'fs';
import path from 'path';

const dbPath = 'c:\\Users\\kmzpa\\Desktop\\Cdc comp\\Responses Copy - Sheet1.csv';
const targetPath = 'c:\\Users\\kmzpa\\Desktop\\Cdc comp\\CV Review Drive (Responses) - Form responses 1.csv';

function normalizeName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

async function main() {
    // 1. Read DB and create a mapping of normalized name -> roll number
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    const dbLines = dbContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    const nameToRollNo = new Map<string, string>();
    
    for (const line of dbLines) {
        // Simple comma split is mostly fine here, but to be safe let's handle basic quotes if needed
        // Assuming the first 4 columns don't have commas: Timestamp, Name, Email, RollNo
        const parts = line.split(',');
        if (parts.length >= 4) {
            const rawName = parts[1];
            const rawRoll = parts[3];
            if (rawName && rawRoll) {
                nameToRollNo.set(normalizeName(rawName), rawRoll.trim().toUpperCase());
            }
        }
    }
    
    console.log(`Loaded ${nameToRollNo.size} names from DB.`);

    // 2. Read Target file and append Roll Number
    const targetContent = fs.readFileSync(targetPath, 'utf8');
    
    // We need a proper CSV parser for the target file because it has quoted fields with commas and newlines
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;
    
    for (let i = 0; i < targetContent.length; i++) {
        const char = targetContent[i];
        
        if (inQuotes) {
            if (char === '"') {
                if (i + 1 < targetContent.length && targetContent[i + 1] === '"') {
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
                if (char === '\r' && i + 1 < targetContent.length && targetContent[i + 1] === '\n') {
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
    
    let matchedCount = 0;
    
    // Process target rows
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (i === 0) {
            // Header
            row.push('Roll Number');
        } else {
            const rawName = row[1]; // Name is at index 1
            if (rawName) {
                const normalized = normalizeName(rawName);
                const rollNo = nameToRollNo.get(normalized) || '';
                if (rollNo) matchedCount++;
                row.push(rollNo);
            } else {
                row.push('');
            }
        }
    }
    
    // Reconstruct CSV
    const newCsvContent = rows.map(row => {
        return row.map(cell => {
            // If cell contains comma, quote, or newline, wrap in quotes
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',');
    }).join('\n');
    
    fs.writeFileSync(targetPath, newCsvContent, 'utf8');
    
    console.log(`Successfully updated ${targetPath}`);
    console.log(`Matched ${matchedCount} out of ${rows.length - 1} records.`);
}

main().catch(console.error);
