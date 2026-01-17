import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { KPICard } from '@/components/dashboard/KPICard';
import { TasksTable } from '@/components/dashboard/TasksTable';
import { ContractorTable } from '@/components/dashboard/ContractorTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { mockContractors } from '@/lib/mockData';
import { 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Scale, 
  TrendingUp,
  Calendar,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  BarChart,
  Bar
} from 'recharts';
import { format, subDays } from 'date-fns';

const COLORS = {
  Completed: 'hsl(var(--success))',
  Pending: 'hsl(var(--warning))',
  Delayed: 'hsl(var(--chart-3))',
  'No-Show': 'hsl(var(--destructive))'
};

const Dashboard = () => {
  const { userRole, tasks } = useApp();

  // Calculate KPIs
  const todaysTasks = tasks.filter(t => 
    t.date.toDateString() === new Date().toDateString()
  );
  
  const stats = useMemo(() => {
    const total = todaysTasks.length;
    const completed = todaysTasks.filter(t => t.status === 'Completed').length;
    const pending = todaysTasks.filter(t => t.status === 'Pending').length;
    const delayed = todaysTasks.filter(t => t.status === 'Delayed').length;
    const noShow = todaysTasks.filter(t => t.status === 'No-Show').length;
    const totalWaste = todaysTasks.reduce((sum, t) => sum + t.quantityKg, 0);
    
    return { total, completed, pending, delayed, noShow, totalWaste };
  }, [todaysTasks]);

  // Status distribution for pie chart
  const statusData = [
    { name: 'Completed', value: stats.completed, color: COLORS.Completed },
    { name: 'Pending', value: stats.pending, color: COLORS.Pending },
    { name: 'Delayed', value: stats.delayed, color: COLORS.Delayed },
    { name: 'No-Show', value: stats.noShow, color: COLORS['No-Show'] }
  ].filter(d => d.value > 0);

  // Trend data for last 7 days
  const trendData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTasks = tasks.filter(t => 
        t.date.toDateString() === date.toDateString()
      );
      last7Days.push({
        date: format(date, 'EEE'),
        Completed: dayTasks.filter(t => t.status === 'Completed').length,
        Delayed: dayTasks.filter(t => t.status === 'Delayed').length,
        'No-Show': dayTasks.filter(t => t.status === 'No-Show').length
      });
    }
    return last7Days;
  }, [tasks]);

  const getRoleTitle = () => {
    switch (userRole) {
      case 'municipality': return 'Municipality Officer Dashboard';
      case 'contractor': return 'Contractor Dashboard';
      case 'field': return 'Field Verifier Dashboard';
      case 'ministry': return 'Ministry Analytics Dashboard';
      default: return 'Dashboard';
    }
  };

  const exportToCSV = () => {
    const headers = ['Task ID', 'Date', 'Ward', 'Zone', 'Locality', 'Contractor', 'Status', 'Waste Type', 'Quantity (Kg)'];
    const csvData = todaysTasks.map(t => [
      t.id, format(t.date, 'yyyy-MM-dd'), t.ward, t.zone, t.locality, t.contractor, t.status, t.wasteType, t.quantityKg
    ]);
    
    const csv = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste-pickup-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

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
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total Pickups"
            value={stats.total}
            icon={<Truck className="w-6 h-6 text-primary" />}
            change={8}
            variant="default"
          />
          <KPICard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle2 className="w-6 h-6 text-success" />}
            change={12}
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
            change={-5}
            variant="danger"
          />
          <KPICard
            title="Waste Collected"
            value={`${(stats.totalWaste / 1000).toFixed(1)}T`}
            icon={<Scale className="w-6 h-6 text-info" />}
            change={15}
            variant="info"
          />
        </div>

        {/* Charts Row */}
        {(userRole === 'municipality' || userRole === 'ministry') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Distribution Pie Chart */}
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

            {/* 7-Day Trend Line Chart */}
            <div className="bg-card rounded-lg border shadow-sm p-6 lg:col-span-2">
              <h3 className="font-semibold mb-4">7-Day Performance Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Completed" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--success))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Delayed" 
                      stroke="hsl(var(--warning))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--warning))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="No-Show" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--destructive))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Contractor Performance - Municipality and Ministry Only */}
        {(userRole === 'municipality' || userRole === 'ministry') && (
          <ContractorTable contractors={mockContractors} />
        )}

        {/* Tasks Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {userRole === 'contractor' ? 'Your Assigned Tasks' : 'Today\'s Pickup Tasks'}
          </h2>
          <TasksTable 
            tasks={todaysTasks} 
            showActions={userRole !== 'ministry'} 
            contractorView={userRole === 'contractor'}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
