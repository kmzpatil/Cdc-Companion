import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const profileMapping: Record<string, string[]> = {
  'sde/quant': ['SOFTWARE', 'QUANT'],
  'software': ['SOFTWARE'],
  'data': ['DATA'],
  'core': ['CORE'],
  'product': ['PRODUCT_FMCG'],
  'fmcg': ['PRODUCT_FMCG'],
  'product_fmcg': ['PRODUCT_FMCG'],
  'product/fmcg': ['PRODUCT_FMCG'],
  'consult': ['CONSULT'],
  'finance': ['FINANCE'],
  'quant': ['QUANT'],
  'sde': ['SOFTWARE'],
};

async function main() {
    console.log("Fetching reviewers...");
    const reviewers = await prisma.reviewer.findMany();
    let rCount = 0;
    
    for (const reviewer of reviewers) {
        const newProfiles = new Set<string>();
        
        for (const p of reviewer.profiles) {
            const lower = p.toLowerCase().trim();
            if (profileMapping[lower]) {
                for (const mapped of profileMapping[lower]) {
                    newProfiles.add(mapped);
                }
            } else {
                // If it contains a slash or comma or 'and', maybe split it?
                // But we mainly know 'sde/quant'. 
                // Let's just keep unknown ones in uppercase.
                newProfiles.add(p.toUpperCase().trim());
            }
        }
        
        const newProfilesArray = Array.from(newProfiles).sort();
        const oldProfilesArray = [...reviewer.profiles].sort();
        
        if (JSON.stringify(newProfilesArray) !== JSON.stringify(oldProfilesArray)) {
            await prisma.reviewer.update({
                where: { id: reviewer.id },
                data: { profiles: newProfilesArray }
            });
            console.log(`Updated Reviewer ID ${reviewer.id} (${reviewer.name}):`);
            console.log(`  Old: ${oldProfilesArray}`);
            console.log(`  New: ${newProfilesArray}`);
            rCount++;
        }
    }
    
    console.log(`\nDone. Updated ${rCount} reviewers.`);
    
    console.log("\nFetching reviewees...");
    const reviewees = await prisma.reviewee.findMany();
    let reCount = 0;
    
    for (const reviewee of reviewees) {
        const lower = reviewee.profile.toLowerCase().trim();
        let newProfile = reviewee.profile;
        
        // Reviewees have a single profile field, typically "Software", "Data", "Core", "Product/FMCG", "Finance", "Consult", "Quant"
        // Let's keep them as they are formatted, or format them like "Software", "Data", etc.
        // The user specifically talked about reviewers because they have multiple profiles joined by | in export.
        // Wait, reviewees also have 'Software', 'Data'. Let's ensure reviewees match a standard.
        // We can capitalize them standardly.
        let standardized = newProfile;
        if (lower === 'sde' || lower === 'software') standardized = 'Software';
        else if (lower === 'data') standardized = 'Data';
        else if (lower === 'core') standardized = 'Core';
        else if (lower === 'product' || lower === 'fmcg' || lower === 'product_fmcg' || lower === 'product/fmcg') standardized = 'Product/FMCG';
        else if (lower === 'consult' || lower === 'consulting') standardized = 'Consult';
        else if (lower === 'finance') standardized = 'Finance';
        else if (lower === 'quant') standardized = 'Quant';
        
        if (standardized !== reviewee.profile) {
            await prisma.reviewee.update({
                where: { id: reviewee.id },
                data: { profile: standardized }
            });
            console.log(`Updated Reviewee ID ${reviewee.id} (${reviewee.name}): ${reviewee.profile} -> ${standardized}`);
            reCount++;
        }
    }
    console.log(`\nDone. Updated ${reCount} reviewees.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
