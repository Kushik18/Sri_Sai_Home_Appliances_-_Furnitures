"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function addBestSeller(productId: string, currentLength: number) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  // Use length as the 0-indexed order, so it's placed at the end of the current store's featured list
  await prisma.product.update({
    where: { id: productId },
    data: { 
      isBestSeller: true,
      bestSellerOrder: currentLength 
    }
  })
  
  revalidatePath("/")
  revalidatePath("/appliances")
  revalidatePath("/furniture")
  revalidatePath("/admin/bestsellers")
}

export async function removeBestSeller(productId: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  await prisma.product.update({
    where: { id: productId },
    data: { 
      isBestSeller: false,
      bestSellerOrder: 0
    }
  })
  
  revalidatePath("/")
  revalidatePath("/appliances")
  revalidatePath("/furniture")
  revalidatePath("/admin/bestsellers")
}

export async function reorderBestSellers(productIds: string[]) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  // We receive the sorted array of IDs for the CURRENT store.
  // We just assign bestSellerOrder = index for each.
  // We can do this with a transaction to ensure all or nothing.
  
  const updates = productIds.map((id, index) => {
    return prisma.product.update({
      where: { id },
      data: { bestSellerOrder: index }
    })
  })
  
  await prisma.$transaction(updates)
  
  revalidatePath("/")
  revalidatePath("/appliances")
  revalidatePath("/furniture")
  revalidatePath("/admin/bestsellers")
}
