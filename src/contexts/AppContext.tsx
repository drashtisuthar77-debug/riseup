import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { UserRole, WastePickupTask, generateMockTasks, TaskStatus } from '@/lib/mockData';

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  tasks: WastePickupTask[];
  updateTaskStatus: (taskId: string, status: TaskStatus, remarks?: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('municipality');
  const [tasks, setTasks] = useState<WastePickupTask[]>(() => generateMockTasks(30));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus, remarks?: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status, 
            remarks: remarks || task.remarks,
            completedTime: status === 'Completed' ? new Date().toTimeString().slice(0, 5) : task.completedTime
          } 
        : task
    ));
  }, []);

  const value = useMemo(() => ({
    userRole,
    setUserRole,
    tasks,
    updateTaskStatus,
    sidebarCollapsed,
    setSidebarCollapsed
  }), [userRole, tasks, updateTaskStatus, sidebarCollapsed]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
