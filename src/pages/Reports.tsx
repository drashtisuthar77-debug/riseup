import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { generateHistoricalReports, mockContractors } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { CalendarIcon, Download, FileText, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = {
  completed: 'hsl(var(--success))',
  delayed: 'hsl(var(--warning))',
  noShow: 'hsl(var(--destructive))'
};

const Reports = () => {
  const { tasks } = useApp();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [selectedContractor, setSelectedContractor] = useState<string>('all');
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  const historicalReports = useMemo(() => generateHistoricalReports(90), []);

  // Filter data based on date range
  const filteredReports = useMemo(() => {
    return historicalReports.filter(report =>
      isWithinInterval(report.date, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to)
      })
    );
  }, [historicalReports, dateRange]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const inRange = isWithinInterval(task.date, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to)
      });
      const matchesContractor = selectedContractor === 'all' || task.contractor === selectedContractor;
      return inRange && matchesContractor;
    });
  }, [tasks, dateRange, selectedContractor]);

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'Completed').length;
    const delayed = filteredTasks.filter(t => t.status === 'Delayed').length;
    const noShow = filteredTasks.filter(t => t.status === 'No-Show').length;
    const totalWaste = filteredTasks.reduce((sum, t) => sum + t.quantityKg, 0);

    return {
      total,
      completed,
      delayed,
      noShow,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0',
      totalWaste: (totalWaste / 1000).toFixed(1)
    };
  }, [filteredTasks]);

  // Trend data for area chart
  const trendData = useMemo(() => {
    return filteredReports
      .slice()
      .reverse()
      .map(report => ({
        date: format(report.date, 'MMM dd'),
        Completed: report.completed,
        Delayed: report.delayed,
        'No-Show': report.noShow
      }));
  }, [filteredReports]);

  // Status distribution for pie chart
  const statusDistribution = [
    { name: 'Completed', value: aggregateStats.completed, color: '#22c55e' },
    { name: 'Delayed', value: aggregateStats.delayed, color: '#f59e0b' },
    { name: 'No-Show', value: aggregateStats.noShow, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Contractor comparison data
  const contractorComparison = useMemo(() => {
    const contractors = [...new Set(filteredTasks.map(t => t.contractor))];
    return contractors.map(contractor => {
      const contractorTasks = filteredTasks.filter(t => t.contractor === contractor);
      return {
        name: contractor.split(' ').slice(0, 2).join(' '),
        Completed: contractorTasks.filter(t => t.status === 'Completed').length,
        Delayed: contractorTasks.filter(t => t.status === 'Delayed').length,
        'No-Show': contractorTasks.filter(t => t.status === 'No-Show').length
      };
    });
  }, [filteredTasks]);

  // Quick date range presets
  const setQuickRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date()
    });
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Urban Waste Management Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Period: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`, 14, 30);
    doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, pageWidth - 70, 30);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Executive Summary
    doc.setFontSize(14);
    doc.text('Executive Summary', 14, 55);
    
    doc.setFontSize(10);
    const summaryY = 65;
    const summaryData = [
      ['Total Pickups', aggregateStats.total.toString()],
      ['Completed', `${aggregateStats.completed} (${aggregateStats.completionRate}%)`],
      ['Delayed', aggregateStats.delayed.toString()],
      ['No-Show', aggregateStats.noShow.toString()],
      ['Total Waste Collected', `${aggregateStats.totalWaste} Tonnes`]
    ];

    autoTable(doc, {
      startY: summaryY,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] }
    });

    // Contractor Performance
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Contractor Performance', 14, 20);

    const contractorData = mockContractors.map(c => [
      c.name,
      c.assignedWards.join(', '),
      `${c.complianceScore}%`,
      c.completedOnTime.toString(),
      c.delayed.toString(),
      c.noShow.toString(),
      c.riskLevel
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Contractor', 'Wards', 'Compliance', 'On-Time', 'Delayed', 'No-Show', 'Risk']],
      body: contractorData,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 }
      }
    });

    // Detailed Tasks (if detailed report)
    if (reportType === 'detailed') {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Detailed Task List', 14, 20);

      const taskData = filteredTasks.slice(0, 50).map(t => [
        t.id,
        format(t.date, 'MM/dd'),
        t.ward,
        t.locality,
        t.status,
        `${t.quantityKg} kg`
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['Task ID', 'Date', 'Ward', 'Locality', 'Status', 'Qty']],
        body: taskData,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 8 }
      });
    }

    // Save the PDF
    doc.save(`waste-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Historical Reports</h1>
            <p className="text-muted-foreground">Analyze past performance and generate downloadable reports</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border shadow-sm p-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.from, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => {
                      if (date) {
                        setDateRange(prev => ({ ...prev, from: date }));
                        setIsFromOpen(false);
                      }
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover open={isToOpen} onOpenChange={setIsToOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.to, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => {
                      if (date) {
                        setDateRange(prev => ({ ...prev, to: date }));
                        setIsToOpen(false);
                      }
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuickRange(7)}>7 Days</Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange(30)}>30 Days</Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange(90)}>90 Days</Button>
            </div>

            {/* Contractor Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Contractor</label>
              <Select value={selectedContractor} onValueChange={setSelectedContractor}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Contractors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contractors</SelectItem>
                  {mockContractors.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={(v) => setReportType(v as 'summary' | 'detailed')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Download Button */}
            <Button onClick={generatePDFReport} className="ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <p className="text-sm text-muted-foreground">Total Pickups</p>
            <p className="text-2xl font-bold">{aggregateStats.total}</p>
          </div>
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-success">{aggregateStats.completed}</p>
          </div>
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <p className="text-sm text-muted-foreground">Delayed</p>
            <p className="text-2xl font-bold text-warning">{aggregateStats.delayed}</p>
          </div>
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <p className="text-sm text-muted-foreground">No-Show</p>
            <p className="text-2xl font-bold text-destructive">{aggregateStats.noShow}</p>
          </div>
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold">{aggregateStats.completionRate}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div className="bg-card rounded-lg border shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Trend Analysis</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
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

          {/* Status Pie Chart */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Status Distribution</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Contractor Comparison */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Contractor Performance Comparison</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractorComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="name" className="text-xs" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Completed" stackId="a" fill="#22c55e" />
                <Bar dataKey="Delayed" stackId="a" fill="#f59e0b" />
                <Bar dataKey="No-Show" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports;
