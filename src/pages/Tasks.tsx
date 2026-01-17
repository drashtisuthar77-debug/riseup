import { MainLayout } from '@/components/layout/MainLayout';
import { TasksTable } from '@/components/dashboard/TasksTable';
import { useApp } from '@/contexts/AppContext';

const Tasks = () => {
  const { tasks } = useApp();

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground">Manage and track all waste pickup tasks</p>
        </div>

        <TasksTable tasks={tasks} showActions={true} />
      </div>
    </MainLayout>
  );
};

export default Tasks;
