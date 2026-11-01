import { useState } from 'react';
import { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import DemoBanner from './DemoBanner';
import { isDemoMode } from '@/lib/supabase';
import { cn } from '@/lib/cn';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          // Desktop offset for sidebar
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        {isDemoMode && <DemoBanner />}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
