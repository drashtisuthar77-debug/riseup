import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { CheckCircle, Camera, MapPin, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const FieldVerification = () => {
  const { tasks, updateTaskStatus } = useApp();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [actualQuantity, setActualQuantity] = useState('');

  // Get only problematic tasks (Delayed or No-Show)
  const problematicTasks = tasks.filter(t => 
    t.status === 'Delayed' || t.status === 'No-Show'
  ).slice(0, 20);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleSubmitVerification = () => {
    if (!selectedTaskId || !verificationNotes) {
      toast.error('Please select a task and add verification notes');
      return;
    }

    updateTaskStatus(selectedTaskId, 'Completed', verificationNotes);
    toast.success('Verification submitted successfully!');
    setSelectedTaskId('');
    setVerificationNotes('');
    setActualQuantity('');
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Field Verification</h1>
          <p className="text-muted-foreground">Verify and update problematic pickup tasks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task List */}
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Tasks Requiring Verification</h3>
              <p className="text-sm text-muted-foreground">Delayed and No-Show tasks</p>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {problematicTasks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                  <p>No problematic tasks to verify!</p>
                </div>
              ) : (
                problematicTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`w-full p-4 text-left border-b hover:bg-muted/50 transition-colors ${
                      selectedTaskId === task.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm">{task.id}</span>
                      <StatusBadge status={task.status} size="sm" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{task.locality}</p>
                      <p className="text-muted-foreground">{task.ward} • {task.zone}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {format(task.date, 'MMM dd, yyyy')} at {task.scheduledTime}
                      </p>
                    </div>
                    {task.remarks && (
                      <p className="text-xs text-destructive mt-2 italic">
                        Reason: {task.remarks}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Verification Form */}
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Verification Details</h3>
            </div>
            <div className="p-4">
              {selectedTask ? (
                <div className="space-y-4">
                  {/* Selected Task Info */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm">{selectedTask.id}</span>
                      <StatusBadge status={selectedTask.status} />
                    </div>
                    <p className="font-medium">{selectedTask.locality}</p>
                    <p className="text-sm text-muted-foreground">{selectedTask.ward} • {selectedTask.zone}</p>
                    <p className="text-sm text-muted-foreground">Contractor: {selectedTask.contractor}</p>
                    <p className="text-sm text-muted-foreground">Scheduled: {selectedTask.scheduledTime}</p>
                    <p className="text-sm text-muted-foreground">
                      Original Qty: {selectedTask.quantityKg} kg ({selectedTask.wasteType})
                    </p>
                  </div>

                  {/* Verification Input */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Actual Quantity Collected (kg)</label>
                      <Input
                        type="number"
                        placeholder="Enter actual quantity"
                        value={actualQuantity}
                        onChange={(e) => setActualQuantity(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Verification Notes *</label>
                      <Textarea
                        placeholder="Enter verification notes, observations, or reasons for delay..."
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Camera className="w-4 h-4 mr-2" />
                        Attach Photo
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        Add Location
                      </Button>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={handleSubmitVerification}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Verification
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <MapPin className="w-12 h-12 mx-auto mb-3" />
                  <p>Select a task from the list to verify</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FieldVerification;
