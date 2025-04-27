import { createClient } from '@supabase/supabase-js';

// These environment variables will be set after connecting to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database schema
export type Class = {
  id: string;
  name: string;
  section: string;
  grade: string;
  teacher_id: string;
  created_at: string;
};

export type Student = {
  id: string;
  name: string;
  roll: string;
  class_id: string;
  created_at: string;
};

export type McqQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_option: number;
};

export type Mcq = {
  id: string;
  title: string;
  description: string;
  class_id: string;
  questions: McqQuestion[];
  created_at: string;
  teacher_id: string;
};