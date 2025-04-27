import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Mcq } from '../lib/supabase';

// Type for MCQ creation/update payload
export type McqMutationPayload = Omit<Mcq, 'id' | 'teacher_id' | 'created_at' | 'updated_at'>;

// Create MCQ
export function useCreateMcq() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMcq: McqMutationPayload) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('mcqs')
        .insert([{ ...newMcq, teacher_id: user.id }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate the mcqs list query to refetch
      queryClient.invalidateQueries({ queryKey: ['mcqs'] });
    },
  });
}

// Update MCQ
export function useUpdateMcq() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<McqMutationPayload> }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: updatedData, error } = await supabase
        .from('mcqs')
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
      // Invalidate the specific mcq query and the list query
      queryClient.invalidateQueries({ queryKey: ['mcq', data.id] });
      queryClient.invalidateQueries({ queryKey: ['mcqs'] });
    },
  });
}

// Delete MCQ
export function useDeleteMcq() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('mcqs')
        .delete()
        .eq('id', id)
        .eq('teacher_id', user.id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      // Invalidate the list query and remove the specific query from cache
      queryClient.invalidateQueries({ queryKey: ['mcqs'] });
      queryClient.removeQueries({ queryKey: ['mcq', id] });
    },
  });
}

// Duplicate MCQ
export function useDuplicateMcq() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // 1. Fetch the MCQ to duplicate
      const { data: mcqToDuplicate, error: fetchError } = await supabase
        .from('mcqs')
        .select('*')
        .eq('id', id)
        .eq('teacher_id', user.id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (!mcqToDuplicate) {
        throw new Error('MCQ not found');
      }
      
      // 2. Create a duplicate with a new ID and "Copy of" title
      const duplicatedMcq = {
        title: `Copy of ${mcqToDuplicate.title}`,
        description: mcqToDuplicate.description,
        class_id: mcqToDuplicate.class_id,
        questions: mcqToDuplicate.questions,
        teacher_id: user.id
      };
      
      // 3. Insert the duplicate
      const { data: newMcq, error: insertError } = await supabase
        .from('mcqs')
        .insert([duplicatedMcq])
        .select()
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      return newMcq;
    },
    onSuccess: () => {
      // Invalidate the list query to refetch
      queryClient.invalidateQueries({ queryKey: ['mcqs'] });
    },
  });
} 