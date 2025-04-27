import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function useMcq(id: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['mcq', id, user?.id],
    queryFn: async () => {
      if (!user || !id) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('mcqs')
        .select('*, classes(name, section)')
        .eq('id', id)
        .eq('teacher_id', user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!user && !!id, // Only run the query if the user is logged in and id exists
  });
} 