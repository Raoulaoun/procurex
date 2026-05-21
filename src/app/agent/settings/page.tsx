"use client";

import { User, Bell, Lock, Globe } from "lucide-react";

const sections = [
  { icon: User, label: "Profile", description: "Manage your personal information and contact details" },
  { icon: Bell, label: "Notifications", description: "Configure email and in-app notification preferences" },
  { icon: Lock, label: "Security", description: "Password, two-factor authentication, and session settings" },
  { icon: Globe, label: "Language & Region", description: "Set your preferred language, timezone, and currency format" },
];

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences</p>
      </div>

      <div className="space-y-3 max-w-2xl">
        {sections.map(({ icon: Icon, label, description }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#f0f4ff" }}>
              <Icon className="h-5 w-5" style={{ color: "#1e4db7" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
