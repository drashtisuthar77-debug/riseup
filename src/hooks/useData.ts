import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['waste_pickup_tasks']['Row'];
type Contractor = Database['public']['Tables']['contractors']['Row'];
type Truck = Database['public']['Tables']['trucks']['Row'];

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waste_pickup_tasks')
        .select(`
          *,
          contractor:contractors(*),
          truck:trucks(*)
        `)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useTodaysTasks = () => {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waste_pickup_tasks')
        .select(`
          *,
          contractor:contractors(*),
          truck:trucks(*)
        `)
        .eq('scheduled_date', today)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useTasksByZone = (zones: string[]) => {
  return useQuery({
    queryKey: ['tasks', 'byZone', zones],
    queryFn: async () => {
      if (!zones.length) return [];
      
      const { data, error } = await supabase
        .from('waste_pickup_tasks')
        .select(`
          *,
          contractor:contractors(*),
          truck:trucks(*)
        `)
        .in('ward', zones)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: zones.length > 0,
  });
};

export const useContractors = () => {
  return useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .order('compliance_score', { ascending: false });

      if (error) throw error;
      return data as Contractor[];
    },
  });
};

export const useTrucks = () => {
  return useQuery({
    queryKey: ['trucks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trucks')
        .select(`
          *,
          contractor:contractors(*)
        `)
        .order('last_update', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Analytics queries
export const useTaskStats = () => {
  return useQuery({
    queryKey: ['taskStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waste_pickup_tasks')
        .select('status, quantity_kg');

      if (error) throw error;

      const stats = {
        total: data.length,
        completed: data.filter(t => t.status === 'Completed').length,
        pending: data.filter(t => t.status === 'Pending').length,
        delayed: data.filter(t => t.status === 'Delayed').length,
        noShow: data.filter(t => t.status === 'No-Show').length,
        totalWaste: data.reduce((sum, t) => sum + (t.quantity_kg || 0), 0),
      };

      return stats;
    },
  });
};

export const useBinStats = () => {
  return useQuery({
    queryKey: ['binStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bins')
        .select('fill_level, status, type');

      if (error) throw error;

      const stats = {
        total: data.length,
        critical: data.filter(b => b.fill_level >= 80).length,
        full: data.filter(b => b.status === 'Full').length,
        active: data.filter(b => b.status === 'Active').length,
        avgFillLevel: data.length > 0 
          ? Math.round(data.reduce((sum, b) => sum + b.fill_level, 0) / data.length)
          : 0,
      };

      return stats;
    },
  });
};
