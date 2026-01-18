import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Bin = Database['public']['Tables']['bins']['Row'];
type BinUpdate = Database['public']['Tables']['bins']['Update'];

export const useBins = () => {
  return useQuery({
    queryKey: ['bins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bins')
        .select('*')
        .order('fill_level', { ascending: false });

      if (error) throw error;
      return data as Bin[];
    },
  });
};

export const useCriticalBins = (threshold: number = 80) => {
  return useQuery({
    queryKey: ['bins', 'critical', threshold],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bins')
        .select('*')
        .gte('fill_level', threshold)
        .order('fill_level', { ascending: false });

      if (error) throw error;
      return data as Bin[];
    },
  });
};

export const useBinsByZone = (zones: string[]) => {
  return useQuery({
    queryKey: ['bins', 'byZone', zones],
    queryFn: async () => {
      if (!zones.length) return [];
      
      const { data, error } = await supabase
        .from('bins')
        .select('*')
        .in('ward', zones)
        .order('fill_level', { ascending: false });

      if (error) throw error;
      return data as Bin[];
    },
    enabled: zones.length > 0,
  });
};

export const useUpdateBin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BinUpdate }) => {
      const { data, error } = await supabase
        .from('bins')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bins'] });
    },
  });
};

export const useMarkBinEmptied = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (binId: string) => {
      const { data, error } = await supabase
        .from('bins')
        .update({ 
          fill_level: 0, 
          last_collected: new Date().toISOString(),
          status: 'Active'
        })
        .eq('id', binId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bins'] });
    },
  });
};
