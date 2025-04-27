import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function useClasses() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['classes', user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user, // Only run the query if the user is logged in
  });
} 