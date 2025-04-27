import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Maximize2, Minimize2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Mcq } from '../lib/supabase';
import { useMcq } from '../hooks/useMcq';

export default function McqViewPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [showAnswers, setShowAnswers] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Using React Query to fetch MCQ
  const { data: mcq, isLoading } = useMcq(id);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    }
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  if (isLoading) {
    return (
      <Layout title="Loading MCQ...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (!mcq) {
    return (
      <Layout title="MCQ Not Found">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">This MCQ does not exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/mcqs')}>Back to MCQs</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="View MCQ">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/mcqs')}
        >
          Back to MCQs
        </Button>
        <div className="flex gap-2">
          <Button
            leftIcon={<Eye size={16} />}
            onClick={() => setShowAnswers(!showAnswers)}
          >
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </Button>
          <Button
            variant="outline"
            leftIcon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">{mcq.title}</h2>
          {mcq.description && (
            <p className="mt-2 text-gray-600">{mcq.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Class: {(mcq as any).classes?.name}
            </span>
            <span className="text-sm text-gray-500">
              Questions: {mcq.questions.length}
            </span>
            <span className="text-sm text-gray-500">
              Created: {new Date(mcq.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
      </Card>

      <div className={`space-y-6 ${isFullscreen ? 'px-4 py-2' : ''}`}>
        {mcq.questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-primary-100 text-primary-700 text-sm font-medium px-2 py-1 rounded">
                    Question {index + 1}
                  </span>
                </div>

                <p className="text-lg font-medium text-gray-900 mb-6">
                  {question.question}
                </p>

                <div className="space-y-3">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-4 rounded-lg border transition-all ${
                        showAnswers && question.correct_option === optIndex
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full border text-sm mr-3">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className={showAnswers && question.correct_option === optIndex ? 'font-medium' : ''}>
                          {option}
                        </span>
                        {showAnswers && question.correct_option === optIndex && (
                          <span className="ml-auto flex items-center text-green-600 text-sm font-medium">
                            Correct Answer
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </Layout>
  );
}