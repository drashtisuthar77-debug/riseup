import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  FileText, 
  MapPinned,
  ChevronLeft, 
  ChevronRight, 
  Truck, 
  Building2, 
  MapPin,
  LogOut,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, roleDisplayNames } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: AppRole[];
}

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/',
    roles: ['officer', 'contractor', 'verifier', 'analyst']
  },
  {
    icon: ClipboardList,
    label: 'Task Management',
    path: '/tasks',
    roles: ['officer', 'contractor']
  },
  {
    icon: Users,
    label: 'Contractors',
    path: '/contractors',
    roles: ['officer', 'analyst']
  },
  {
    icon: ClipboardCheck,
    label: 'Verification Queue',
    path: '/verification',
    roles: ['officer', 'verifier']
  },
  {
    icon: FileText,
    label: 'Reports',
    path: '/reports',
    roles: ['officer', 'analyst']
  },
  {
    icon: MapPinned,
    label: 'Live Tracking',
    path: '/tracking',
    roles: ['officer']
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    path: '/analytics',
    roles: ['officer', 'analyst']
  },
  {
    icon: MapPin,
    label: 'Bin Status',
    path: '/bins',
    roles: ['contractor']
  },
];

const roleIcons: Record<AppRole, React.ElementType> = {
  officer: Building2,
  contractor: Truck,
  verifier: MapPin,
  analyst: BarChart3,
};

export const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const filteredNavItems = navItems.filter(item => 
    role && item.roles.includes(role)
  );
  
  const isExpanded = !sidebarCollapsed || isHovered;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    navigate('/auth');
  };

  const RoleIcon = role ? roleIcons[role] : Building2;

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-in-out sticky top-0",
        isExpanded ? "w-64" : "w-16"
      )} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <Truck className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {isExpanded && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm truncate">Urban Waste</h1>
            <p className="text-xs text-sidebar-foreground/70 truncate">Management System</p>
          </div>
        )}
      </div>

      {/* User Info */}
      {isExpanded && profile && (
        <div className="p-3 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
                {profile.full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.full_name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {profile.email}
              </p>
            </div>
          </div>
          {role && (
            <div className="flex items-center gap-2 px-1 py-1.5 bg-sidebar-accent rounded-md">
              <RoleIcon className="w-4 h-4 text-sidebar-primary" />
              <span className="text-xs font-medium">{roleDisplayNames[role]}</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-sidebar-foreground/50" />
          </div>
        ) : (
          filteredNavItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </Link>
            );
          })
        )}
      </nav>

      {/* Sign Out & Collapse */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {isExpanded && (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5 mr-2" />
            )}
            Sign Out
          </Button>
        )}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
          {isExpanded && (
            <span className="text-sm">{sidebarCollapsed ? 'Expand' : 'Collapse'}</span>
          )}
        </button>
      </div>
    </aside>
  );
};
