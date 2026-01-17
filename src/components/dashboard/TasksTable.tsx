import { useState } from 'react';
import { WastePickupTask, TaskStatus } from '@/lib/mockData';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Check, AlertTriangle, XCircle, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
interface TasksTableProps {
  tasks: WastePickupTask[];
  showActions?: boolean;
  contractorView?: boolean;
}
export const TasksTable = ({
  tasks,
  showActions = true,
  contractorView = false
}: TasksTableProps) => {
  const {
    updateTaskStatus,
    userRole
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.id.toLowerCase().includes(searchTerm.toLowerCase()) || task.locality.toLowerCase().includes(searchTerm.toLowerCase()) || task.contractor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesWard = wardFilter === 'all' || task.ward === wardFilter;
    return matchesSearch && matchesStatus && matchesWard;
  });
  const uniqueWards = [...new Set(tasks.map(t => t.ward))];
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
  };
  const canEdit = userRole === 'municipality' || userRole === 'contractor';
  return <div className="bg-card rounded-lg border shadow-sm">
      {/* Filters */}
      <div className="p-4 border-b flex flex-wrap gap-3 border border-solid border-secondary rounded">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Delayed">Delayed</SelectItem>
            <SelectItem value="No-Show">No-Show</SelectItem>
          </SelectContent>
        </Select>
        <Select value={wardFilter} onValueChange={setWardFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Ward" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Wards</SelectItem>
            {uniqueWards.map(ward => <SelectItem key={ward} value={ward}>{ward}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Task ID</th>
              <th>Date</th>
              <th>Ward/Zone</th>
              <th>Locality</th>
              {!contractorView && <th>Contractor</th>}
              <th>Scheduled</th>
              <th>Waste Type</th>
              <th>Qty (Kg)</th>
              <th>Status</th>
              {showActions && canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredTasks.slice(0, 20).map(task => <tr key={task.id} className="hover:bg-muted/50 transition-colors">
                <td className="font-mono text-sm">{task.id}</td>
                <td className="text-sm">{format(task.date, 'dd MMM yyyy')}</td>
                <td>
                  <div>
                    <div className="font-medium">{task.ward}</div>
                    <div className="text-xs text-muted-foreground">{task.zone}</div>
                  </div>
                </td>
                <td>{task.locality}</td>
                {!contractorView && <td className="text-sm">{task.contractor}</td>}
                <td className="text-sm">{task.scheduledTime}</td>
                <td>
                  <span className="px-2 py-0.5 text-xs rounded bg-muted font-medium">
                    {task.wasteType}
                  </span>
                </td>
                <td className="text-right font-medium">{task.quantityKg.toLocaleString()}</td>
                <td><StatusBadge status={task.status} size="sm" /></td>
                {showActions && canEdit && <td>
                    {task.status === 'Pending' && <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-success hover:text-success hover:bg-success/10" onClick={() => handleStatusChange(task.id, 'Completed')} title="Mark Completed">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-warning hover:text-warning hover:bg-warning/10" onClick={() => handleStatusChange(task.id, 'Delayed')} title="Mark Delayed">
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleStatusChange(task.id, 'No-Show')} title="Mark No-Show">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>}
                  </td>}
              </tr>)}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t text-sm text-muted-foreground">
        Showing {Math.min(20, filteredTasks.length)} of {filteredTasks.length} tasks
      </div>
    </div>;
};