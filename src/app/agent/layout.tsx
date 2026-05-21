import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { Bell, Settings, Search } from "lucide-react";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f6f9" }}>
      <AgentSidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 sticky top-0 z-20">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search…"
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="h-9 w-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <Settings className="h-4 w-4" />
            </button>
            <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold ml-1" style={{ backgroundColor: "#0d2144" }}>
              AG
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
