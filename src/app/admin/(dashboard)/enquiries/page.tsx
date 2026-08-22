import { prisma } from "@/lib/prisma"
import EnquiriesClient from "./EnquiriesClient"

export default async function EnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    include: {
      product: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' }
  })

  // Get all session IDs from enquiries to fetch their visits
  const sessionIds = enquiries.map(e => e.sessionId).filter(Boolean) as string[]
  
  const visits = await prisma.visit.findMany({
    where: { sessionId: { in: sessionIds } },
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { name: true } } }
  })

  // Map visits back to their respective enquiries to match the expected client structure
  const enquiriesWithSessions = enquiries.map(enquiry => {
    if (!enquiry.sessionId) return { ...enquiry, session: null }
    return {
      ...enquiry,
      session: {
        visits: visits.filter(v => v.sessionId === enquiry.sessionId)
      }
    }
  })

  return <EnquiriesClient enquiries={enquiriesWithSessions as any} />
}
