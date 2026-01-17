import { Contractor } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ContractorTableProps {
  contractors: Contractor[];
}

const riskConfig = {
  Low: { icon: CheckCircle, className: 'text-success bg-success/10' },
  Medium: { icon: AlertTriangle, className: 'text-warning bg-warning/10' },
  High: { icon: AlertCircle, className: 'text-destructive bg-destructive/10' }
};

export const ContractorTable = ({ contractors }: ContractorTableProps) => {
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Contractor Performance</h3>
        <p className="text-sm text-muted-foreground">Overview of all registered contractors and their compliance scores</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Contractor</th>
              <th>Contact</th>
              <th>Assigned Wards</th>
              <th>Compliance</th>
              <th>Tasks (Total)</th>
              <th>On-Time</th>
              <th>Delayed</th>
              <th>No-Show</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {contractors.map((contractor) => {
              const RiskIcon = riskConfig[contractor.riskLevel].icon;
              return (
                <tr key={contractor.id} className="hover:bg-muted/50 transition-colors">
                  <td>
                    <div>
                      <div className="font-medium">{contractor.name}</div>
                      <div className="text-xs text-muted-foreground">{contractor.id}</div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="text-sm">{contractor.contactPerson}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contractor.phone}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {contractor.assignedWards.map(ward => (
                        <span key={ward} className="px-2 py-0.5 text-xs rounded bg-muted font-medium">
                          {ward}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-sm font-bold",
                          contractor.complianceScore >= 85 ? "text-success" :
                          contractor.complianceScore >= 70 ? "text-warning" : "text-destructive"
                        )}>
                          {contractor.complianceScore}%
                        </span>
                      </div>
                      <Progress 
                        value={contractor.complianceScore} 
                        className="h-2"
                      />
                    </div>
                  </td>
                  <td className="text-center font-medium">{contractor.totalTasks}</td>
                  <td className="text-center text-success font-medium">{contractor.completedOnTime}</td>
                  <td className="text-center text-warning font-medium">{contractor.delayed}</td>
                  <td className="text-center text-destructive font-medium">{contractor.noShow}</td>
                  <td>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      riskConfig[contractor.riskLevel].className
                    )}>
                      <RiskIcon className="w-3.5 h-3.5" />
                      {contractor.riskLevel} Risk
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
