import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Users, FileBarChart, MapPin, Settings, ChevronLeft, ChevronRight, Truck, Building2, ClipboardCheck, BarChart3, FileText, MapPinned } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/lib/mockData';
interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: UserRole[];
}
const navItems: NavItem[] = [{
  icon: LayoutDashboard,
  label: 'Dashboard',
  path: '/',
  roles: ['municipality', 'contractor', 'field', 'ministry']
}, {
  icon: ClipboardList,
  label: 'Task Management',
  path: '/tasks',
  roles: ['municipality', 'contractor']
}, {
  icon: Users,
  label: 'Contractors',
  path: '/contractors',
  roles: ['municipality', 'ministry']
}, {
  icon: ClipboardCheck,
  label: 'Field Verification',
  path: '/verification',
  roles: ['municipality', 'field']
}, {
  icon: FileText,
  label: 'Historical Reports',
  path: '/reports',
  roles: ['municipality', 'ministry']
}, {
  icon: MapPinned,
  label: 'Live Tracking',
  path: '/tracking',
  roles: ['municipality']
}, {
  icon: BarChart3,
  label: 'Analytics',
  path: '/analytics',
  roles: ['municipality', 'ministry']
}];
const roleLabels: Record<UserRole, {
  label: string;
  icon: React.ElementType;
}> = {
  municipality: {
    label: 'Municipality Officer',
    icon: Building2
  },
  contractor: {
    label: 'Contractor',
    icon: Truck
  },
  field: {
    label: 'Field Verifier',
    icon: MapPin
  },
  ministry: {
    label: 'Ministry Analyst',
    icon: BarChart3
  }
};
export const AppSidebar = () => {
  const location = useLocation();
  const {
    userRole,
    setUserRole,
    sidebarCollapsed,
    setSidebarCollapsed
  } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));
  const isExpanded = !sidebarCollapsed || isHovered;
  return <aside className={cn("h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-in-out sticky top-0", isExpanded ? "w-64" : "w-16")} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center gap-3 border-solid">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <Truck className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {isExpanded && <div className="overflow-hidden">
            <h1 className="font-bold text-sm truncate">Urban Waste</h1>
            <p className="text-xs text-sidebar-foreground/70 truncate">Management System</p>
          </div>}
      </div>

      {/* Role Selector */}
      {isExpanded && <div className="p-3 border-b border-sidebar-border">
          <label className="text-xs text-sidebar-foreground/70 uppercase tracking-wider mb-2 block">
            Switch Role
          </label>
          <Select value={userRole} onValueChange={v => setUserRole(v as UserRole)}>
            <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(roleLabels).map(([role, {
            label,
            icon: Icon
          }]) => <SelectItem key={role} value={role}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {filteredNavItems.map(item => {
        const isActive = location.pathname === item.path;
        return <Link key={item.path} to={item.path} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors border-solid border-primary border-2", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && <span className="text-sm font-medium truncate">{item.label}</span>}
            </Link>;
      })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {isExpanded && <span className="text-sm">{sidebarCollapsed ? 'Expand' : 'Collapse'}</span>}
        </button>
      </div>
    </aside>;
};