import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const p of products) {
    if (p.description) {
      const parts = p.description.split('\n\n');
      if (parts.length >= 2) {
        const firstPart = parts[0].trim();
        const rest = parts.slice(1).join('\n\n').trim();
        
        // Check if first part looks like a short_description
        // Usually it's one sentence, and much shorter than the rest.
        // It often starts with "Get" or "Introducing" or just is a single sentence.
        // Let's just check if it's a single sentence (or two) and length < 250, and the rest is longer.
        if (firstPart.length < 250 && firstPart.length < rest.length) {
          // If firstPart and rest share the product name, it's definitely the redundant short_description
          const nameTokens = p.name.split(' ').filter(t => t.length > 3);
          const hasSharedToken = nameTokens.some(t => firstPart.includes(t) && rest.includes(t));
          
          if (hasSharedToken || firstPart.endsWith('.')) {
            console.log(`Updating ${p.name}... Removing first paragraph: "${firstPart}"`);
            await prisma.product.update({
              where: { id: p.id },
              data: { description: rest }
            });
            updatedCount++;
          }
        }
      }
    }
  }
  console.log(`Updated ${updatedCount} products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
