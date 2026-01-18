import { usePendingReports, useUpdateReport } from '@/hooks/useReports';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const severityColors = {
  Low: 'bg-muted text-muted-foreground',
  Medium: 'bg-warning/10 text-warning border-warning/30',
  High: 'bg-destructive/10 text-destructive border-destructive/30',
  Critical: 'bg-destructive text-destructive-foreground',
};

const VerificationQueue = () => {
  const { data: reports, isLoading, error } = usePendingReports();
  const updateReport = useUpdateReport();

  const handleVerify = async (id: string, approved: boolean) => {
    try {
      await updateReport.mutateAsync({
        id,
        updates: {
          status: approved ? 'In Progress' : 'Resolved',
          resolution_notes: approved 
            ? 'Verified and forwarded for action' 
            : 'Rejected as invalid or spam',
        }
      });
      toast.success(approved ? 'Report verified and forwarded!' : 'Report rejected.');
    } catch (err) {
      toast.error('Failed to update report. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <p className="text-destructive">Failed to load reports. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verification Queue</h1>
          <p className="text-muted-foreground">Review and verify citizen-submitted reports</p>
        </div>

        {reports && reports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No pending reports to verify.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reports?.map(report => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium truncate">{report.reporter_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(severityColors[report.severity])}
                    >
                      {report.severity}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Image */}
                  {report.image_url ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={report.image_url} 
                        alt="Report" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-foreground line-clamp-3">
                    {report.description}
                  </p>

                  {/* Location */}
                  {report.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{report.address}</span>
                    </div>
                  )}

                  {/* Waste Type */}
                  {report.waste_type && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="secondary">{report.waste_type}</Badge>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleVerify(report.id, true)}
                      disabled={updateReport.isPending}
                    >
                      {updateReport.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleVerify(report.id, false)}
                      disabled={updateReport.isPending}
                    >
                      {updateReport.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default VerificationQueue;
