import { AgentSidebar } from "@/components/agent/agent-sidebar";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AgentSidebar />
      <main className="ml-56 min-h-screen">
        <div className="p-6 max-w-screen-xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
