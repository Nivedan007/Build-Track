"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { UserCircle, Settings, LogOut, Lock, Eye, Bell, Palette } from "lucide-react";
import { useNotifications } from "@/lib/notifications";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SETTINGS_KEY = "buildtrack-settings";

export default function SettingsPage() {
  const router = useRouter();
  const { logout, token } = useAuthStore();
  const { addNotification } = useNotifications();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: true,
    darkMode: true,
    twoFactorEnabled: false
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setSettings((current) => ({ ...current, ...parsed }));
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error(error);
    }
  }, [settings]);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-300">Please log in to access settings</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    addNotification({
      type: "info",
      title: "Logged out",
      message: "You have been successfully logged out"
    });
    router.push("/login");
  };

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    addNotification({
      type: "success",
      title: "Setting updated",
      message: `${key} has been updated`
    });
  };

  return (
    <div className="min-h-screen bg-mesh fade-grid">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-slate-50">Settings</h1>
            <p className="text-slate-400 mt-2">Manage your account and preferences</p>
          </div>

          {/* Profile Card */}
          <motion.div
            whileHover={{ borderColor: "rgba(6, 182, 212, 0.4)" }}
            className="glass rounded-2xl p-6 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <UserCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Account</p>
                <p className="text-lg font-semibold text-slate-100">BuildTrack User</p>
                <p className="text-sm text-slate-400">Premium Member</p>
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-semibold text-slate-100">Notifications</h2>
            </div>
            <div className="space-y-4">
              {[
                { key: "emailNotifications" as const, label: "Email Notifications", desc: "Get updates via email" },
                {
                  key: "desktopNotifications" as const,
                  label: "Desktop Notifications",
                  desc: "Receive browser alerts"
                }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
                  <div>
                    <p className="text-slate-100 font-medium">{item.label}</p>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange(item.key)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      settings[item.key]
                        ? "bg-cyan-500/30"
                        : "bg-slate-700/50"
                    }`}
                  >
                    <div
                      className={`absolute h-5 w-5 rounded-full bg-cyan-400 transition ${
                        settings[item.key]
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-semibold text-slate-100">Privacy & Security</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-slate-900/40 rounded-lg hover:bg-slate-900/60 transition">
                <div className="text-left">
                  <p className="text-slate-100 font-medium">Change Password</p>
                  <p className="text-sm text-slate-400">Update your password</p>
                </div>
                <Lock className="h-4 w-4 text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-slate-900/40 rounded-lg hover:bg-slate-900/60 transition">
                <div className="text-left">
                  <p className="text-slate-100 font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-400">Enhance account security</p>
                </div>
                <Eye className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-semibold text-slate-100">Appearance</h2>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
              <div>
                <p className="text-slate-100 font-medium">Dark Mode</p>
                <p className="text-sm text-slate-400">Currently enabled</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-cyan-500/30">
                <div className="h-5 w-5 rounded-full bg-cyan-400 ml-5.5 mt-0.5" />
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div className="glass rounded-2xl p-6 border-red-500/20">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Danger Zone</h2>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/20 transition font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
