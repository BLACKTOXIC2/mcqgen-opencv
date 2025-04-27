import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Student } from '../lib/supabase';

// Type for student creation/update
export type StudentMutationPayload = Omit<Student, 'id' | 'teacher_id' | 'created_at' | 'updated_at'>;

// Create student
export function useCreateStudent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newStudent: StudentMutationPayload) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('students')
        .insert([{ ...newStudent, teacher_id: user.id }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

// Update student
export function useUpdateStudent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StudentMutationPayload> }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: updatedData, error } = await supabase
        .from('students')
        .update(data)
        .eq('id', id)
        .eq('teacher_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', data.id] });
    },
  });
}

// Delete student
export function useDeleteStudent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
        .eq('teacher_id', user.id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.removeQueries({ queryKey: ['student', id] });
    },
  });
}

// Bulk create students
export function useBulkCreateStudents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (students: StudentMutationPayload[]) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const studentsWithTeacher = students.map(student => ({
        ...student,
        teacher_id: user.id
      }));

      const { data, error } = await supabase
        .from('students')
        .insert(studentsWithTeacher)
        .select();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
} 