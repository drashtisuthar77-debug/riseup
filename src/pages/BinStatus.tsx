import { useCriticalBins, useMarkBinEmptied } from '@/hooks/useBins';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, MapPin, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const BinStatus = () => {
  const { data: bins, isLoading, error } = useCriticalBins(80);
  const markEmptied = useMarkBinEmptied();

  const handleMarkEmptied = async (binId: string, binCode: string) => {
    try {
      await markEmptied.mutateAsync(binId);
      toast.success(`Bin ${binCode} marked as emptied!`);
    } catch (err) {
      toast.error('Failed to update bin status. Please try again.');
    }
  };

  const getFillLevelColor = (level: number) => {
    if (level >= 90) return 'bg-destructive text-destructive-foreground';
    if (level >= 80) return 'bg-warning text-warning-foreground';
    return 'bg-success text-success-foreground';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-40" />
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
              <p className="text-destructive">Failed to load bins. Please try again later.</p>
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
          <h1 className="text-2xl font-bold text-foreground">Bin Status</h1>
          <p className="text-muted-foreground">Bins at 80% or higher capacity requiring collection</p>
        </div>

        {bins && bins.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
              <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
              <p className="text-muted-foreground">No bins currently need emptying. Great job!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bins?.map(bin => (
              <Card key={bin.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        {bin.bin_code}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{bin.type} Waste</p>
                    </div>
                    <Badge className={cn("text-xs", getFillLevelColor(bin.fill_level))}>
                      {bin.fill_level}% Full
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{bin.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Zone:</span>
                    <span className="font-medium">{bin.ward} • {bin.zone}</span>
                  </div>

                  {/* Fill level bar */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className={cn("h-full transition-all", getFillLevelColor(bin.fill_level))}
                      style={{ width: `${bin.fill_level}%` }}
                    />
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => handleMarkEmptied(bin.id, bin.bin_code)}
                    disabled={markEmptied.isPending}
                  >
                    {markEmptied.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Mark as Emptied
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default BinStatus;
