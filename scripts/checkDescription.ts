import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient(); 
async function main() { 
  const pList = await prisma.product.findMany({ 
    where: { 
      OR: [
        { description: { contains: '✅' } },
        { legacyDescription: { contains: '✅' } }
      ]
    } 
  }); 
  if (pList.length > 0) {
    const p = pList[0];
    const text = p.description || p.legacyDescription || "";
    console.log("RAW STRING DUMP:");
    console.log(JSON.stringify(text));
  } else {
    console.log("No product found with ✅");
  }
} 
main();
