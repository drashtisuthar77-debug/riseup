import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className={cn(
        "flex-1 min-h-screen overflow-x-hidden transition-all duration-300"
      )}>
        {children}
      </main>
    </div>
  );
};
