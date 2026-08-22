"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateAdminCredentials(data: {
  currentPassword: string;
  newUsername?: string;
  newPassword?: string;
}) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.name) {
    throw new Error("Unauthorized")
  }

  const { currentPassword, newUsername, newPassword } = data

  if (!currentPassword) {
    throw new Error("Current password is required")
  }

  // Get current admin user
  const adminUser = await prisma.adminUser.findUnique({
    where: { username: session.user.name }
  })

  if (!adminUser) {
    throw new Error("Admin user not found")
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, adminUser.passwordHash)
  if (!isPasswordValid) {
    throw new Error("Incorrect current password")
  }

  const updateData: any = {}

  // Handle Username update
  if (newUsername && newUsername.trim() !== "" && newUsername !== adminUser.username) {
    // Check if new username is already taken
    const existingUser = await prisma.adminUser.findUnique({
      where: { username: newUsername }
    })
    
    if (existingUser) {
      throw new Error("Username already taken")
    }
    updateData.username = newUsername.trim()
  }

  // Handle Password update
  if (newPassword && newPassword.trim() !== "") {
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long")
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    updateData.passwordHash = newPasswordHash
  }

  if (Object.keys(updateData).length === 0) {
    return { success: true, message: "No changes requested" }
  }

  await prisma.adminUser.update({
    where: { id: adminUser.id },
    data: updateData
  })

  revalidatePath('/admin')
  
  return { 
    success: true, 
    message: "Credentials updated successfully. If you changed your username or password, you may need to sign in again." 
  }
}
