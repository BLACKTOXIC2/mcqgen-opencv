import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Class, McqQuestion, Mcq } from '../lib/supabase';

export default function McqEditPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<McqQuestion[]>([
    {
      id: '1',
      question: '',
      options: ['', '', '', ''],
      correct_option: 0
    }
  ]);
  
  useEffect(() => {
    fetchMcq();
    fetchClasses();
  }, [user, id]);
  
  const fetchMcq = async () => {
    try {
      if (!user || !id) return;
      
      const { data, error } = await supabase
        .from('mcqs')
        .select('*')
        .eq('id', id)
        .eq('teacher_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setTitle(data.title);
        setDescription(data.description || '');
        setClassId(data.class_id);
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching MCQ:', error);
      navigate('/mcqs');
    }
  };
  
  const fetchClasses = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([
      ...questions,
      {
        id: newId,
        question: '',
        options: ['', '', '', ''],
        correct_option: 0
      }
    ]);
  };
  
  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) return; // Keep at least one question
    setQuestions(questions.filter(q => q.id !== id));
  };
  
  const handleQuestionChange = (id: string, field: string, value: string | number) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };
  
  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };
  
  const handleCorrectOptionChange = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, correct_option: optionIndex };
      }
      return q;
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !id) return;
    
    // Validate
    if (!title || !classId || questions.length === 0) {
      alert('Please fill all required fields');
      return;
    }
    
    // Check if all questions and options are filled
    const isValid = questions.every(q => 
      q.question.trim() !== '' && 
      q.options.every(opt => opt.trim() !== '')
    );
    
    if (!isValid) {
      alert('Please fill all questions and options');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('mcqs')
        .update({
          title,
          description,
          class_id: classId,
          questions,
        })
        .eq('id', id)
        .eq('teacher_id', user.id);
      
      if (error) throw error;
      
      // Navigate back to MCQs page after successful save
      navigate('/mcqs');
    } catch (error) {
      console.error('Error updating MCQ:', error);
      alert('Failed to update MCQ. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Layout title="Loading MCQ...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Edit MCQ">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<ArrowLeft size={16} />}
        onClick={() => navigate('/mcqs')}
        className="mb-6"
      >
        Back to MCQs
      </Button>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-medium">MCQ Details</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="MCQ Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 5 Assessment"
                required
              />
              <Select
                label="Class"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                options={[
                  { value: '', label: 'Select a class' },
                  ...classes.map(c => ({ value: c.id, label: `${c.name} - Section ${c.section}` }))
                ]}
                required
              />
            </div>
            <div className="mt-4">
              <TextArea
                label="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief description of this MCQ"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
        <AnimatePresence>
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Question {index + 1}
                  </h3>
                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 size={16} />}
                      onClick={() => handleRemoveQuestion(question.id)}
                    >
                      Remove
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <TextArea
                    label="Question"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
                    placeholder="Enter your question here"
                    required
                  />
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Options
                    </label>
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-start space-x-2">
                        <div className="mt-2">
                          <input
                            type="radio"
                            id={`question-${question.id}-option-${optIndex}`}
                            name={`question-${question.id}-correct`}
                            checked={question.correct_option === optIndex}
                            onChange={() => handleCorrectOptionChange(question.id, optIndex)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                        </div>
                        <div className="flex-grow">
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(question.id, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            required
                          />
                        </div>
                      </div>
                    ))}
                    <div className="text-xs text-gray-500 ml-6 mt-1">
                      * Select the radio button next to the correct answer
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            type="button"
            variant="outline"
            leftIcon={<Plus size={16} />}
            onClick={handleAddQuestion}
            className="mb-6"
          >
            Add Question
          </Button>
        </motion.div>
        
        <Card>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/mcqs')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              leftIcon={<Save size={16} />}
              isLoading={isSaving}
            >
              Update MCQ
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Layout>
  );
} 