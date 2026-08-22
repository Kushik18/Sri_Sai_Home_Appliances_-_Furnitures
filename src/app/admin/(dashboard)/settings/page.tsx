import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import SettingsClient from "./SettingsClient"

export const metadata = {
  title: "Admin Settings",
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your admin account credentials.
        </p>
      </div>
      <SettingsClient currentUsername={session.user?.name || ""} />
    </div>
  )
}
