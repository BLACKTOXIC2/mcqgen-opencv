import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export type StudentQueryFilter = {
  classId?: string;
  searchTerm?: string;
};

export function useStudents(filters: StudentQueryFilter = {}) {
  const { user } = useAuth();
  const { classId = '', searchTerm = '' } = filters;
  
  return useQuery({
    queryKey: ['students', user?.id, classId, searchTerm],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      
      let query = supabase
        .from('students')
        .select('*, classes(name, section)')
        .eq('teacher_id', user.id)
        .order('name', { ascending: true });
      
      if (classId) {
        query = query.eq('class_id', classId);
      }
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
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