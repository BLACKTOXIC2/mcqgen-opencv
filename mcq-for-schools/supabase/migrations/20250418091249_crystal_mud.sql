/*
  # Initial Schema Setup for MCQ Creator App

  1. New Tables
    - `classes` - Store class information for teachers
    - `students` - Store student information linked to classes
    - `mcqs` - Store multiple-choice questions with their answers

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  section text NOT NULL,
  grade text NOT NULL,
  teacher_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  roll text NOT NULL,
  class_id uuid REFERENCES classes(id) NOT NULL,
  teacher_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create MCQs table
CREATE TABLE IF NOT EXISTS mcqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  class_id uuid REFERENCES classes(id) NOT NULL,
  questions jsonb NOT NULL,
  teacher_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcqs ENABLE ROW LEVEL SECURITY;

-- Create policies for classes
CREATE POLICY "Users can create their own classes"
  ON classes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Users can view their own classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Users can update their own classes"
  ON classes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Users can delete their own classes"
  ON classes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Create policies for students
CREATE POLICY "Users can create their own students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Users can view their own students"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Users can update their own students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Users can delete their own students"
  ON students
  FOR DELETE
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Create policies for MCQs
CREATE POLICY "Users can create their own MCQs"
  ON mcqs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Users can view their own MCQs"
  ON mcqs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Users can update their own MCQs"
  ON mcqs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Users can delete their own MCQs"
  ON mcqs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS classes_teacher_id_idx ON classes (teacher_id);
CREATE INDEX IF NOT EXISTS students_teacher_id_idx ON students (teacher_id);
CREATE INDEX IF NOT EXISTS students_class_id_idx ON students (class_id);
CREATE INDEX IF NOT EXISTS mcqs_teacher_id_idx ON mcqs (teacher_id);
CREATE INDEX IF NOT EXISTS mcqs_class_id_idx ON mcqs (class_id);

-- Create student_results table for storing test scores
CREATE TABLE IF NOT EXISTS student_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) NOT NULL,
  mcq_id uuid REFERENCES mcqs(id) NOT NULL,
  score int NOT NULL,
  total_questions int NOT NULL,
  percentage numeric(5,2) NOT NULL,
  scanned_answers jsonb NOT NULL,
  image_urls text[],
  teacher_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(student_id, mcq_id)
);

-- Enable Row Level Security for student_results
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;

-- Create policies for student_results
CREATE POLICY "Users can create their own student results"
  ON student_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Users can view their own student results"
  ON student_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Users can update their own student results"
  ON student_results
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Users can delete their own student results"
  ON student_results
  FOR DELETE
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Create indexes for student_results
CREATE INDEX IF NOT EXISTS student_results_teacher_id_idx ON student_results (teacher_id);
CREATE INDEX IF NOT EXISTS student_results_student_id_idx ON student_results (student_id);
CREATE INDEX IF NOT EXISTS student_results_mcq_id_idx ON student_results (mcq_id);