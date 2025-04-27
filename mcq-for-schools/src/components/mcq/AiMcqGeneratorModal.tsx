import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import TextArea from '../ui/TextArea';
import { generateMCQs, isGeminiAvailable } from '../../lib/gemini';
import { Class } from '../../lib/supabase';

type AiMcqGeneratorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onMcqsGenerated: (mcqs: any[]) => void;
  classes: Class[];
};

export default function AiMcqGeneratorModal({ 
  isOpen, 
  onClose, 
  onMcqsGenerated, 
  classes 
}: AiMcqGeneratorModalProps) {
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [description, setDescription] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !classId || numberOfQuestions <= 0) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      // Check if the Gemini API key is configured
      if (!isGeminiAvailable()) {
        setError('Google Gemini API key is not configured. Please add the VITE_GOOGLE_GEMINI_API_KEY in your .env file.');
        return;
      }

      // Find class level from selected class
      const selectedClass = classes.find(c => c.id === classId);
      const classLevel = selectedClass ? `${selectedClass.name} - ${selectedClass.section}` : '';

      // Generate MCQs using the Gemini AI
      const generatedMcqs = await generateMCQs({
        title,
        description,
        numberOfQuestions,
        classLevel,
        subject,
      });

      // Pass the generated MCQs back to the parent component
      onMcqsGenerated(generatedMcqs);
      
      // Close the modal
      onClose();
    } catch (err: any) {
      console.error('Error generating MCQs:', err);
      setError(err.message || 'Failed to generate MCQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-primary-500 mr-2" />
            <h2 className="text-lg font-semibold">Generate MCQs with AI</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Photosynthesis Quiz"
              required
            />
          </div>

          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
              Class*
            </label>
            <Select
              id="class"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              options={[
                { value: '', label: 'Select a class' },
                ...classes.map(c => ({ 
                  value: c.id, 
                  label: `${c.name} - Section ${c.section}` 
                }))
              ]}
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject (Optional)
            </label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Biology, Mathematics"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description/Instructions (Optional)
            </label>
            <TextArea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details or specific topics to include..."
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="numberOfQuestions" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Questions*
            </label>
            <Input
              id="numberOfQuestions"
              type="number"
              min={1}
              max={30}
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 1)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Maximum: 30 questions</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="pt-3 border-t flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            >
              {loading ? 'Generating...' : 'Generate MCQs'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 