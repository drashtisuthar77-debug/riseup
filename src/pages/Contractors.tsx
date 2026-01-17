import { MainLayout } from '@/components/layout/MainLayout';
import { ContractorTable } from '@/components/dashboard/ContractorTable';
import { mockContractors } from '@/lib/mockData';

const Contractors = () => {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contractors</h1>
          <p className="text-muted-foreground">View and manage contractor performance and compliance</p>
        </div>

        <ContractorTable contractors={mockContractors} />
      </div>
    </MainLayout>
  );
};

export default Contractors;
