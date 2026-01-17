import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { mockContractors, generateHistoricalReports } from '@/lib/mockData';
import { KPICard } from '@/components/dashboard/KPICard';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Scale,
  CheckCircle2,
  Clock,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { format, subDays } from 'date-fns';

const Analytics = () => {
  const { tasks } = useApp();
  const reports = useMemo(() => generateHistoricalReports(30), []);

  // Calculate overall metrics
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const avgCompliance = mockContractors.reduce((sum, c) => sum + c.complianceScore, 0) / mockContractors.length;
    const highRiskContractors = mockContractors.filter(c => c.riskLevel === 'High').length;
    const totalWaste = tasks.reduce((sum, t) => sum + t.quantityKg, 0);
    
    return {
      totalTasks,
      completionRate: totalTasks > 0 ? ((completed / totalTasks) * 100).toFixed(1) : '0',
      avgCompliance: avgCompliance.toFixed(1),
      highRiskContractors,
      totalWaste: (totalWaste / 1000).toFixed(1)
    };
  }, [tasks]);

  // 30-day trend data
  const trendData = useMemo(() => {
    return reports
      .slice(0, 30)
      .reverse()
      .map(r => ({
        date: format(r.date, 'MMM dd'),
        Completed: r.completed,
        Delayed: r.delayed,
        'No-Show': r.noShow,
        Waste: Math.round(r.wasteCollectedKg / 1000)
      }));
  }, [reports]);

  // Contractor performance radial chart
  const contractorRadialData = mockContractors.map((c, index) => ({
    name: c.name.split(' ').slice(0, 2).join(' '),
    score: c.complianceScore,
    fill: `hsl(${index * 60}, 70%, 50%)`
  }));

  // Ward-wise breakdown
  const wardData = useMemo(() => {
    const wardMap = new Map<string, { completed: number; delayed: number; noShow: number }>();
    
    tasks.forEach(task => {
      const current = wardMap.get(task.ward) || { completed: 0, delayed: 0, noShow: 0 };
      if (task.status === 'Completed') current.completed++;
      else if (task.status === 'Delayed') current.delayed++;
      else if (task.status === 'No-Show') current.noShow++;
      wardMap.set(task.ward, current);
    });
    
    return Array.from(wardMap.entries()).map(([ward, data]) => ({
      ward,
      ...data
    }));
  }, [tasks]);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            30-Day Performance Overview
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total Tasks (30d)"
            value={metrics.totalTasks}
            icon={<BarChart3 className="w-6 h-6 text-primary" />}
            change={8}
            variant="default"
          />
          <KPICard
            title="Completion Rate"
            value={`${metrics.completionRate}%`}
            icon={<CheckCircle2 className="w-6 h-6 text-success" />}
            change={5}
            variant="success"
          />
          <KPICard
            title="Avg Compliance"
            value={`${metrics.avgCompliance}%`}
            icon={<TrendingUp className="w-6 h-6 text-info" />}
            change={2}
            variant="info"
          />
          <KPICard
            title="High Risk"
            value={metrics.highRiskContractors}
            icon={<AlertTriangle className="w-6 h-6 text-destructive" />}
            variant="danger"
          />
          <KPICard
            title="Waste (Tonnes)"
            value={metrics.totalWaste}
            icon={<Scale className="w-6 h-6 text-warning" />}
            change={12}
            variant="warning"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 30-Day Trend */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              30-Day Performance Trend
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="Completed" 
                    stackId="1"
                    stroke="#22c55e" 
                    fill="#22c55e"
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Delayed" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="#f59e0b"
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="No-Show" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Contractor Compliance Radial */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Contractor Compliance Scores
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="20%" 
                  outerRadius="90%" 
                  data={contractorRadialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background
                    dataKey="score"
                    cornerRadius={5}
                    label={{ fill: 'hsl(var(--foreground))', position: 'insideStart', fontSize: 10 }}
                  />
                  <Tooltip />
                  <Legend 
                    iconSize={10}
                    layout="horizontal"
                    verticalAlign="bottom"
                    formatter={(value, entry: any) => <span className="text-xs">{entry.payload.name}</span>}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ward-wise Breakdown */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Ward-wise Performance
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="ward" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill="#22c55e" />
                  <Bar dataKey="delayed" name="Delayed" fill="#f59e0b" />
                  <Bar dataKey="noShow" name="No-Show" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Response Time Trend */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Waste Collection (Tonnes/Day)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="Waste" 
                    stroke="hsl(var(--info))" 
                    fill="hsl(var(--info))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
