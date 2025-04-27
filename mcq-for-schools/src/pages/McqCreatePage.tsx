import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Class, McqQuestion } from '../lib/supabase';
import { generateMCQs, isGeminiAvailable } from '../lib/gemini';

export default function McqCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
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
    fetchClasses();
  }, [user]);
  
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
      
      if (data && data.length > 0) {
        setClassId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
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
  
  const handleGenerateQuestions = async () => {
    console.log("Generate questions button clicked");
    setAiError(null);
    
    if (!title) {
      console.log("Title is empty");
      setAiError("Please enter a title for the MCQ before generating questions.");
      return;
    }
    
    if (!classId) {
      console.log("Class is not selected");
      setAiError("Please select a class before generating questions.");
      return;
    }
    
    try {
      console.log("Starting AI generation with:", { title, description, classId });
      setIsGenerating(true);
      
      // Check if the Gemini API key is configured
      if (!isGeminiAvailable()) {
        console.log("Gemini API key not configured");
        setAiError('Google Gemini API key is not configured. Please add the VITE_GOOGLE_GEMINI_API_KEY in your .env file.');
        return;
      }
      
      // Find class level from selected class
      const selectedClass = classes.find(c => c.id === classId);
      const classLevel = selectedClass ? `${selectedClass.name} - ${selectedClass.section}` : '';
      
      // Generate 10 MCQs or current question count, whichever is greater
      const questionCount = Math.max(10, questions.length);
      
      // Generate MCQs using the Gemini AI
      const generatedMcqs = await generateMCQs({
        title,
        description,
        numberOfQuestions: questionCount,
        classLevel,
        subject: '',
      });
      
      // Convert the generated MCQs to the format expected by the application
      const formattedQuestions: McqQuestion[] = generatedMcqs.map((mcq: any, index: number) => {
        // Ensure correct_option is a valid number between 0-3
        let correctOption = mcq.correct_option;
        
        // Make sure correct_option is a number and within range
        if (typeof correctOption !== 'number' || correctOption < 0 || correctOption > 3) {
          console.log(`Invalid correct_option for question ${index + 1}:`, correctOption);
          correctOption = 0; // Default to first option if invalid
        }
        
        return {
          id: (index + 1).toString(),
          question: mcq.question,
          options: mcq.options,
          correct_option: correctOption
        };
      });
      
      console.log("Formatted questions with correct options:", formattedQuestions);
      
      // Replace the current questions with the generated ones
      setQuestions(formattedQuestions);
      
    } catch (error: any) {
      console.error('Error generating MCQs:', error);
      setAiError(error.message || 'Failed to generate MCQs. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
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
        .insert([
          {
            title,
            description,
            class_id: classId,
            questions,
            teacher_id: user.id
          }
        ]);
      
      if (error) throw error;
      
      // Navigate back to MCQs page after successful save
      navigate('/mcqs');
    } catch (error) {
      console.error('Error saving MCQ:', error);
      alert('Failed to save MCQ. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Layout title="Create MCQ">
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
        
        {/* AI Generation Card */}
        <Card className="mb-6 border-2 border-primary-100">
          <CardContent className="py-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <Sparkles size={18} className="text-primary-500 mr-2" />
                <h3 className="text-lg font-medium text-primary-700">AI Question Generator</h3>
              </div>
              
              <p className="text-sm text-gray-600">
                Quickly generate multiple-choice questions using AI based on your MCQ title and class.
              </p>
              
              <Button
                type="button"
                leftIcon={isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                onClick={handleGenerateQuestions}
                disabled={isGenerating || !title || !classId}
                className="w-full"
              >
                {isGenerating ? 'Generating Questions...' : 'Generate Questions with AI'}
              </Button>
              
              {aiError && (
                <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-md mt-2">
                  {aiError}
                </div>
              )}
              
              <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                <span className="font-medium">Note:</span> Generating questions will replace any existing questions. Make sure to enter a title and select a class first.
              </div>
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
                      <div key={optIndex} className={`flex items-start space-x-2 p-2 rounded-md ${question.correct_option === optIndex ? 'bg-green-50 border border-green-100' : ''}`}>
                        <div className="mt-2">
                          <input
                            type="radio"
                            id={`question-${question.id}-option-${optIndex}`}
                            name={`question-${question.id}-correct`}
                            checked={question.correct_option === optIndex}
                            onChange={() => handleCorrectOptionChange(question.id, optIndex)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            key={`radio-${question.id}-${optIndex}-${question.correct_option === optIndex}`}
                          />
                        </div>
                        <div className="flex-grow">
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(question.id, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            required
                            className={question.correct_option === optIndex ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''}
                          />
                        </div>
                        {question.correct_option === optIndex && (
                          <div className="flex items-center text-xs text-green-600 font-medium">
                            Correct
                          </div>
                        )}
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
              Save MCQ
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Layout>
  );
}