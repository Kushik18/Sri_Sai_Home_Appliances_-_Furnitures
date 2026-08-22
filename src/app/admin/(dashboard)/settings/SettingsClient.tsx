"use client"

import { useState } from "react"
import { updateAdminCredentials } from "./actions"
import { Button } from "@/components/ui/button"
import { Key, User, ShieldCheck, LogOut, CheckCircle2, XCircle } from "lucide-react"

export default function SettingsClient({ currentUsername }: { currentUsername: string }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newUsername, setNewUsername] = useState(currentUsername)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!currentPassword) {
      setMessage({ type: 'error', text: "Current password is required." })
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "New passwords do not match." })
      return
    }

    setLoading(true)
    try {
      const res = await updateAdminCredentials({
        currentPassword,
        newUsername: newUsername !== currentUsername ? newUsername : undefined,
        newPassword: newPassword ? newPassword : undefined
      })

      if (res.success) {
        setMessage({ type: 'success', text: res.message })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Something went wrong" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 md:p-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          Update Credentials
        </h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 border ${
            message.type === 'success' 
              ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800/60 text-green-800 dark:text-green-300"
              : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300"
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <XCircle className="w-5 h-5 mt-0.5" />}
            <div className="text-sm font-medium">{message.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 transition-colors"
                placeholder="New username"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Change Password</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <Key className="w-4 h-4 text-slate-400" />
                New Password <span className="text-gray-400 font-normal ml-1">(Leave blank to keep current)</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 transition-colors"
                placeholder="New password (min 8 chars)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 transition-colors"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Current Password Required
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                To apply any changes to your username or password, you must enter your current password.
              </p>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 transition-colors"
                placeholder="Enter current password to save changes"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={loading || !currentPassword}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            
            {(newUsername !== currentUsername || newPassword) && (
              <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
                <LogOut className="w-3.5 h-3.5" />
                You will need to sign in again after saving.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
