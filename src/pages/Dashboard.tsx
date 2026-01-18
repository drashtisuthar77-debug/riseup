import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTodaysTasks, useContractors, useTaskStats, useBinStats } from '@/hooks/useData';
import { KPICard } from '@/components/dashboard/KPICard';
import { ContractorTable } from '@/components/dashboard/ContractorTable';
import { 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Scale, 
  Calendar,
  Download,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
} from 'recharts';
import { format } from 'date-fns';

const COLORS = {
  Completed: 'hsl(var(--success))',
  Pending: 'hsl(var(--warning))',
  Delayed: 'hsl(var(--chart-3))',
  'No-Show': 'hsl(var(--destructive))'
};

const Dashboard = () => {
  const { role, profile } = useAuth();
  const { data: tasks, isLoading: tasksLoading } = useTodaysTasks();
  const { data: contractors } = useContractors();
  const { data: taskStats, isLoading: statsLoading } = useTaskStats();
  const { data: binStats } = useBinStats();

  const stats = useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, pending: 0, delayed: 0, noShow: 0, totalWaste: 0 };
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      delayed: tasks.filter(t => t.status === 'Delayed').length,
      noShow: tasks.filter(t => t.status === 'No-Show').length,
      totalWaste: tasks.reduce((sum, t) => sum + (t.quantity_kg || 0), 0),
    };
  }, [tasks]);

  const statusData = [
    { name: 'Completed', value: stats.completed, color: COLORS.Completed },
    { name: 'Pending', value: stats.pending, color: COLORS.Pending },
    { name: 'Delayed', value: stats.delayed, color: COLORS.Delayed },
    { name: 'No-Show', value: stats.noShow, color: COLORS['No-Show'] }
  ].filter(d => d.value > 0);

  const getRoleTitle = () => {
    switch (role) {
      case 'officer': return 'Municipality Officer Dashboard';
      case 'contractor': return 'Contractor Dashboard';
      case 'verifier': return 'Field Verifier Dashboard';
      case 'analyst': return 'Ministry Analytics Dashboard';
      default: return 'Dashboard';
    }
  };

  const isLoading = tasksLoading || statsLoading;

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{getRoleTitle()}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              title="Total Pickups"
              value={stats.total}
              icon={<Truck className="w-6 h-6 text-primary" />}
              variant="default"
            />
            <KPICard
              title="Completed"
              value={stats.completed}
              icon={<CheckCircle2 className="w-6 h-6 text-success" />}
              variant="success"
            />
            <KPICard
              title="Pending"
              value={stats.pending}
              icon={<AlertTriangle className="w-6 h-6 text-warning" />}
              variant="warning"
            />
            <KPICard
              title="Delayed/No-Show"
              value={stats.delayed + stats.noShow}
              icon={<XCircle className="w-6 h-6 text-destructive" />}
              variant="danger"
            />
            <KPICard
              title="Critical Bins"
              value={binStats?.critical || 0}
              icon={<Trash2 className="w-6 h-6 text-info" />}
              variant="info"
            />
          </div>
        )}

        {/* Charts - Officer and Analyst only */}
        {(role === 'officer' || role === 'analyst') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <h3 className="font-semibold mb-4">Today's Status Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-lg border shadow-sm p-6 lg:col-span-2">
              <h3 className="font-semibold mb-4">System Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{binStats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Bins</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{binStats?.avgFillLevel || 0}%</p>
                  <p className="text-sm text-muted-foreground">Avg Fill Level</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{contractors?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Contractors</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{taskStats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">All Tasks</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contractor Table - Officer and Analyst only */}
        {(role === 'officer' || role === 'analyst') && contractors && (
          <ContractorTable contractors={contractors.map(c => ({
            id: c.id,
            name: c.name,
            contactPerson: c.contact_person,
            phone: c.phone,
            email: c.email,
            assignedWards: c.assigned_wards,
            complianceScore: c.compliance_score,
            totalTasks: c.total_tasks,
            completedOnTime: c.completed_on_time,
            delayed: c.delayed,
            noShow: c.no_show,
            riskLevel: c.risk_level,
          }))} />
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
