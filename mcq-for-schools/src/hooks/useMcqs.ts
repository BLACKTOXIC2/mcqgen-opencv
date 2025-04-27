import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export type McqQueryFilter = {
  classId?: string;
  searchTerm?: string;
};

export function useMcqs(filters: McqQueryFilter = {}) {
  const { user } = useAuth();
  const { classId = '', searchTerm = '' } = filters;
  
  return useQuery({
    queryKey: ['mcqs', user?.id, classId, searchTerm],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      
      let query = supabase
        .from('mcqs')
        .select('*, classes(name, section)')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      
      if (classId) {
        query = query.eq('class_id', classId);
      }
      
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user, // Only run the query if the user is logged in
  });
} 