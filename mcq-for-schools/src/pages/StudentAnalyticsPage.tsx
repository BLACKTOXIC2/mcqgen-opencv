import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Award, 
  Clock, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Check, 
  Brain, 
  LineChart, 
  CalendarClock,
  Calendar,
  ChevronRight,
  X,
  Book,
  TrendingDown,
  ArrowUp
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function StudentAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [analytics, setAnalytics] = useState({
    totalMcqs: 0,
    completedMcqs: 0,
    averageScore: 0,
    recentPerformance: [] as any[],
    topSubjects: [] as any[],
    improvementAreas: [] as string[],
    progressTrend: 'stable' as 'improving' | 'declining' | 'stable',
    consistencyScore: 0,
    testFrequency: 0,
    questionTypeAnalysis: [] as any[],
    studyHabitInsights: [] as string[],
    lastTestDate: '',
    conceptualStrengths: [] as string[],
    conceptualWeaknesses: [] as string[],
    peerComparison: 0,
    recommendedTopics: [] as string[],
    learningPathProgress: 0
  });
  const [testResults, setTestResults] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [showResultDetails, setShowResultDetails] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, [id, user]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      if (!user || !id) return;

      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*, classes(name, section)')
        .eq('id', id)
        .eq('teacher_id', user.id)
        .single();

      if (studentError) throw studentError;
      if (!studentData) {
        console.error('Student not found');
        navigate('/students');
        return;
      }

      setStudent(studentData);

      // Fetch test results for this student
      const { data: resultsData, error: resultsError } = await supabase
        .from('student_results')
        .select('*, mcqs(title, questions)')
        .eq('student_id', id)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (resultsError) throw resultsError;
      
      // Save all test results to state
      setTestResults(resultsData || []);

      // If we have real test results, use them
      if (resultsData && resultsData.length > 0) {
        // Calculate average score
        const totalScore = resultsData.reduce((sum, result) => sum + result.percentage, 0);
        const averageScore = totalScore / resultsData.length;

        // Get performance trend from recent tests (most recent 5 or all if less than 5)
        const recentTests = resultsData.slice(0, Math.min(5, resultsData.length));
        const recentPerformance = recentTests.map(result => ({
          date: result.created_at,
          score: result.percentage,
          title: (result.mcqs as any).title
        }));

        // Determine progress trend by analyzing the last 3-5 test scores
        let progressTrend: 'improving' | 'declining' | 'stable' = 'stable';
        if (recentTests.length >= 3) {
          const scores = recentTests.map(r => r.percentage).reverse(); // Oldest to newest
          const improvements = scores.slice(1).map((score, i) => score - scores[i]);
          const avgImprovement = improvements.reduce((sum, val) => sum + val, 0) / improvements.length;
          
          if (avgImprovement > 3) progressTrend = 'improving';
          else if (avgImprovement < -3) progressTrend = 'declining';
        }

        // Calculate consistency score (inverse of standard deviation)
        const scoresMean = averageScore;
        const squaredDiffs = resultsData.map(r => Math.pow(r.percentage - scoresMean, 2));
        const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / resultsData.length;
        const stdDev = Math.sqrt(variance);
        const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev * 2)));

        // Calculate test frequency (average days between tests)
        let testFrequency = 0;
        if (resultsData.length > 1) {
          const dates = resultsData.map(r => new Date(r.created_at)).sort((a, b) => a.getTime() - b.getTime());
          const daysBetweenTests = dates.slice(1).map((date, i) => 
            Math.round((date.getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24))
          );
          testFrequency = daysBetweenTests.reduce((sum, days) => sum + days, 0) / daysBetweenTests.length;
        }

        // NEW: Extract all questions across all tests for advanced analysis
        const allQuestions: any[] = [];
        const topicFrequency: Record<string, number> = {};
        const subjectPerformance: Record<string, {correct: number, total: number}> = {};
        const conceptualUnderstanding: Record<string, {score: number, count: number}> = {};
        const bloomsAnalysis: Record<string, {score: number, count: number}> = {};
        
        // Process all test results for detailed analysis
        resultsData.forEach(result => {
          const mcqData = result.mcqs as any;
          if (!mcqData || !mcqData.questions) return;
          
          // Extract subject from test title
          const testTitle = mcqData.title || '';
          const subject = testTitle.split(' ')[0]; // Extract first word as subject
          
          if (!subjectPerformance[subject]) {
            subjectPerformance[subject] = {correct: 0, total: 0};
          }
          
          // Process each question in the test
          mcqData.questions.forEach((question: any, qIndex: number) => {
            // Add question to allQuestions array with test metadata
            allQuestions.push({
              ...question,
              testId: result.id,
              testTitle: mcqData.title,
              testDate: result.created_at,
              questionNumber: qIndex + 1
            });
            
            // Extract topic from question (first 2-3 significant words)
            const questionText = question.question || '';
            const wordCount = 3;
            const topic = questionText
              .split(' ')
              .filter((word: string) => word.length > 3 && !['what', 'which', 'when', 'where', 'define', 'explain'].includes(word.toLowerCase()))
              .slice(0, wordCount)
              .join(' ');
            
            if (topic) {
              topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
            }
            
            // Look for student's answer to this question in the scanned answers
            if (result.scanned_answers && Array.isArray(result.scanned_answers)) {
              const studentAnswer = result.scanned_answers.find((a: any) => a.questionNumber === qIndex + 1);
              
              if (studentAnswer) {
                // Track subject performance
                subjectPerformance[subject].total += 1;
                if (studentAnswer.isCorrect) {
                  subjectPerformance[subject].correct += 1;
                }
                
                // Analyze question type and cognitive level (simulated AI classification)
                // In a real application, you would use NLP to analyze the question
                
                // Identify conceptual type of question
                let conceptType = 'Unknown';
                if (questionText.match(/define|meaning|what is|describe/i)) {
                  conceptType = 'Definition';
                } else if (questionText.match(/why|reason|cause|effect/i)) {
                  conceptType = 'Causality';
                } else if (questionText.match(/compare|difference|similar|between/i)) {
                  conceptType = 'Comparison';
                } else if (questionText.match(/how does|function|work|process/i)) {
                  conceptType = 'Process';
                } else if (questionText.match(/apply|using|solve|calculate/i)) {
                  conceptType = 'Application';
                } else if (questionText.match(/analyze|examine|investigate/i)) {
                  conceptType = 'Analysis';
                }
                
                if (!conceptualUnderstanding[conceptType]) {
                  conceptualUnderstanding[conceptType] = {score: 0, count: 0};
                }
                conceptualUnderstanding[conceptType].count += 1;
                if (studentAnswer.isCorrect) {
                  conceptualUnderstanding[conceptType].score += 1;
                }
                
                // Classify according to Bloom's Taxonomy (educational framework)
                let bloomsLevel = 'Knowledge';
                if (questionText.match(/list|define|name|identify|recall|who|what|when|where/i)) {
                  bloomsLevel = 'Knowledge';
                } else if (questionText.match(/explain|describe|discuss|summarize|interpret|paraphrase/i)) {
                  bloomsLevel = 'Comprehension';
                } else if (questionText.match(/apply|demonstrate|use|illustrate|operate/i)) {
                  bloomsLevel = 'Application';
                } else if (questionText.match(/analyze|differentiate|compare|contrast|examine|categorize/i)) {
                  bloomsLevel = 'Analysis';
                } else if (questionText.match(/design|formulate|propose|develop|create|construct/i)) {
                  bloomsLevel = 'Synthesis';
                } else if (questionText.match(/evaluate|judge|critique|assess|recommend|justify/i)) {
                  bloomsLevel = 'Evaluation';
                }
                
                if (!bloomsAnalysis[bloomsLevel]) {
                  bloomsAnalysis[bloomsLevel] = {score: 0, count: 0};
                }
                bloomsAnalysis[bloomsLevel].count += 1;
                if (studentAnswer.isCorrect) {
                  bloomsAnalysis[bloomsLevel].score += 1;
                }
              }
            }
          });
        });
        
        // Calculate cognitive strengths and weaknesses based on conceptual understanding
        const conceptualStrengthsRaw = Object.entries(conceptualUnderstanding)
          .filter(([_, {count}]) => count >= 2) // Only consider areas with enough questions
          .map(([concept, {score, count}]) => ({
            concept,
            percentage: Math.round((score / count) * 100)
          }))
          .sort((a, b) => b.percentage - a.percentage);
          
        const conceptualStrengths = conceptualStrengthsRaw
          .filter(item => item.percentage >= 70)
          .map(item => item.concept);
        
        const conceptualWeaknesses = conceptualStrengthsRaw
          .filter(item => item.percentage < 60)
          .map(item => item.concept);
        
        // Identify top subjects and improvement areas based on aggregated data
        const topSubjects = Object.entries(subjectPerformance)
          .filter(([_, {total}]) => total >= 3) // Only consider subjects with enough questions
          .map(([subject, {correct, total}]) => ({
            subject,
            score: Math.round((correct / total) * 100)
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
          
        const improvementAreas = Object.entries(subjectPerformance)
          .filter(([_, {correct, total}]) => total >= 3 && (correct / total) < 0.7)
          .map(([subject]) => subject);
          
        // Analyze Bloom's Taxonomy performance for cognitive levels
        const bloomsPerformance = Object.entries(bloomsAnalysis)
          .map(([level, {score, count}]) => ({
            type: level,
            score: Math.round((score / count) * 100)
          }))
          .sort((a, b) => b.score - a.score);
          
        // Identify knowledge gaps by finding topics with low performance
        const questionsByTopic: Record<string, {correct: number, total: number}> = {};
        
        allQuestions.forEach(q => {
          // Extract key terms for topic identification (simplified for this example)
          const questionText = q.question || '';
          const keyTerms = questionText
            .split(' ')
            .filter((word: string) => word.length > 4 && !['what', 'which', 'when', 'where', 'how'].includes(word.toLowerCase()))
            .slice(0, 3)
            .join(' ');
            
          if (keyTerms) {
            if (!questionsByTopic[keyTerms]) {
              questionsByTopic[keyTerms] = {correct: 0, total: 0};
            }
            
            questionsByTopic[keyTerms].total += 1;
            
            // Check if student got this question right by matching with scanned answers
            const resultForQuestion = resultsData.find(r => r.id === q.testId);
            if (resultForQuestion && resultForQuestion.scanned_answers) {
              const answer = resultForQuestion.scanned_answers.find((a: any) => a.questionNumber === q.questionNumber);
              if (answer && answer.isCorrect) {
                questionsByTopic[keyTerms].correct += 1;
              }
            }
          }
        });
        
        // Identify knowledge gaps (topics with low performance)
        const knowledgeGaps = Object.entries(questionsByTopic)
          .filter(([_, {total}]) => total >= 2) // Only consider topics with enough questions
          .map(([topic, {correct, total}]) => ({
            topic,
            percentage: Math.round((correct / total) * 100)
          }))
          .filter(item => item.percentage < 60)
          .map(item => item.topic);
          
        // Create more targeted recommended topics based on knowledge gaps
        const recommendedTopics = knowledgeGaps.length > 0 
          ? knowledgeGaps.slice(0, 3) 
          : improvementAreas.map(area => {
              const topics = {
                'Mathematics': ['Algebra', 'Calculus', 'Geometry'],
                'Physics': ['Mechanics', 'Thermodynamics', 'Optics'],
                'Chemistry': ['Organic Chemistry', 'Periodic Table', 'Chemical Bonding'],
                'Biology': ['Cell Biology', 'Genetics', 'Ecosystems'],
                'History': ['World War II', 'Ancient Civilizations', 'Industrial Revolution'],
                'Geography': ['Physical Geography', 'Map Reading', 'Climate Systems']
              };
              
              // @ts-ignore - Dynamic property access
              const areaTopics = topics[area] || ['Fundamentals'];
              return areaTopics[Math.floor(Math.random() * areaTopics.length)];
            });
            
        // Analyze question type performance
        const questionTypeAnalysis = bloomsPerformance.length > 0 
          ? bloomsPerformance 
          : [
              { type: 'Knowledge', score: 85 },
              { type: 'Comprehension', score: 80 },
              { type: 'Application', score: 75 },
              { type: 'Analysis', score: 72 }
            ];
            
        // Advanced learning pattern analysis
        const learningPatterns = [];
        
        // Time-based pattern detection
        if (resultsData.length >= 3) {
          const testTimeData = resultsData.map(r => ({
            time: new Date(r.created_at).getHours(),
            score: r.percentage
          }));
          
          // Group by time of day
          const morningTests = testTimeData.filter(t => t.time >= 6 && t.time < 12);
          const afternoonTests = testTimeData.filter(t => t.time >= 12 && t.time < 18);
          const eveningTests = testTimeData.filter(t => t.time >= 18 || t.time < 6);
          
          // Calculate average scores by time of day
          const calcAvg = (tests: {time: number, score: number}[]) => 
            tests.length ? tests.reduce((sum, t) => sum + t.score, 0) / tests.length : 0;
            
          const morningAvg = calcAvg(morningTests);
          const afternoonAvg = calcAvg(afternoonTests);
          const eveningAvg = calcAvg(eveningTests);
          
          // Identify optimal time for learning
          if (morningTests.length && afternoonTests.length && eveningTests.length) {
            const bestTime = [
              {period: 'morning', avg: morningAvg},
              {period: 'afternoon', avg: afternoonAvg},
              {period: 'evening', avg: eveningAvg}
            ].sort((a, b) => b.avg - a.avg)[0].period;
            
            learningPatterns.push(`Best performance in the ${bestTime}`);
          }
          
          // Identify spacing effect (if applicable)
          if (testFrequency > 0) {
            if (testFrequency < 7) {
              learningPatterns.push('Frequent testing improves retention');
            } else if (testFrequency > 21) {
              learningPatterns.push('Long gaps between tests may affect retention');
            }
          }
          
          // Pattern in improvement
          if (progressTrend === 'improving') {
            learningPatterns.push('Consistent improvement shows effective learning strategy');
          } else if (progressTrend === 'declining') {
            learningPatterns.push('Recent decline suggests need for study method change');
          }
        }
        
        // Generate study habit insights based on all analytics
        const studyHabitInsights = [
          `Tests taken ${resultsData.length > 5 ? 'regularly' : 'sporadically'}`,
          `${progressTrend === 'improving' ? 'Consistent improvement' : progressTrend === 'declining' ? 'Performance declining' : 'Stable performance'}`,
          `${testFrequency > 14 ? 'Needs more frequent testing' : 'Good test frequency'}`,
          ...learningPatterns
        ];

        // Get last test date
        const lastTestDate = new Date(resultsData[0].created_at).toLocaleDateString();

        // Calculate peer comparison (mock data since we don't have class averages)
        // Assume class average is around 72%
        const classAverage = 72;
        const peerComparison = Math.round(averageScore - classAverage);

        // Learning path progress (mock data)
        const learningPathProgress = Math.min(100, Math.round(averageScore * 1.1));

        // Set analytics with real and enhanced AI-based analysis
        setAnalytics({
          totalMcqs: resultsData.length,
          completedMcqs: resultsData.length,
          averageScore: Math.round(averageScore),
          recentPerformance,
          topSubjects,
          improvementAreas,
          progressTrend,
          consistencyScore: Math.round(consistencyScore),
          testFrequency: Math.round(testFrequency),
          questionTypeAnalysis,
          studyHabitInsights,
          lastTestDate,
          conceptualStrengths,
          conceptualWeaknesses,
          peerComparison,
          recommendedTopics,
          learningPathProgress
        });
      } else {
        // Fall back to mock data if no results exist
        const mockAnalytics = {
          totalMcqs: 15,
          completedMcqs: 12,
          averageScore: 78,
          recentPerformance: [
            { date: '2023-01-15', score: 65, title: 'Physics Test 1' },
            { date: '2023-02-10', score: 72, title: 'Math Quiz' },
            { date: '2023-03-05', score: 80, title: 'Chemistry Test' },
            { date: '2023-04-20', score: 85, title: 'Biology MCQ' },
            { date: '2023-05-12', score: 88, title: 'Physics Test 2' }
          ],
          topSubjects: [
            { subject: 'Mathematics', score: 90 },
            { subject: 'Science', score: 85 },
            { subject: 'English', score: 82 }
          ],
          improvementAreas: ['History', 'Geography'],
          progressTrend: 'improving' as 'improving' | 'declining' | 'stable',
          consistencyScore: 82,
          testFrequency: 14,
          questionTypeAnalysis: [
            { type: 'Knowledge', score: 85 },
            { type: 'Comprehension', score: 80 },
            { type: 'Application', score: 75 },
            { type: 'Analysis', score: 72 }
          ],
          studyHabitInsights: [
            'Tests taken regularly',
            'Consistent improvement',
            'Good test frequency',
            'Best performance in the morning'
          ],
          lastTestDate: '2023-05-12',
          conceptualStrengths: ['Definition', 'Process'],
          conceptualWeaknesses: ['Analysis', 'Causality'],
          peerComparison: 6,
          recommendedTopics: ['Causality in History', 'Analytical Methods'],
          learningPathProgress: 86
        };

        setAnalytics(mockAnalytics);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetailedResults = async (resultId: string) => {
    try {
      const result = testResults.find(r => r.id === resultId);
      if (!result) {
        console.error("Test result not found");
        return;
      }

      // Access the scanned answers from the result
      let formattedAnswers = [];
      
      // Handle different possible formats of scanned_answers
      if (result.scanned_answers) {
        console.log("Raw scanned_answers data:", result.scanned_answers);
        
        // Check if we need to format the data
        if (Array.isArray(result.scanned_answers)) {
          // If scanned_answers is an array, format it consistently
          formattedAnswers = result.scanned_answers.map((answer: any) => {
            // Handle format from TestCheckingPage.tsx saveResults function
            if (answer.question_number !== undefined) {
              return {
                questionNumber: Number(answer.question_number),
                selectedOption: String(answer.selected_option || '').toUpperCase(),
                isCorrect: answer.is_correct
              };
            }
            // Handle if direct format from scanning
            else if (answer.questionNumber !== undefined) {
              return {
                questionNumber: Number(answer.questionNumber),
                selectedOption: String(answer.selectedOption || '').toUpperCase(),
                isCorrect: answer.isCorrect // might be undefined
              };
            }
            // Default fallback
            return answer;
          });
        }
      }
      
      console.log("Formatted answers after mapping:", formattedAnswers);
      
      // Get the MCQ details with questions 
      const mcqQuestions = result.mcqs?.questions || [];
      
      // Calculate isCorrect if not already present in the data
      formattedAnswers = formattedAnswers.map((answer: any) => {
        if (answer.isCorrect === undefined) {
          const questionIndex = answer.questionNumber - 1; // 0-based index
          const mcqQuestion = mcqQuestions[questionIndex];
          
          if (mcqQuestion && mcqQuestion.correct_option !== undefined) {
            const correctOptionLetter = ["A", "B", "C", "D"][mcqQuestion.correct_option];
            // Compare student answer with correct answer
            answer.isCorrect = answer.selectedOption === correctOptionLetter;
          }
        }
        return answer;
      });
      
      console.log("Formatted answers with isCorrect:", formattedAnswers);
      console.log("MCQ questions:", mcqQuestions);
      
      // Combine the data for display
      const detailedResult = {
        ...result,
        mcqQuestions,
        scannedAnswers: formattedAnswers,
      };
      
      setSelectedResult(detailedResult);
      setShowResultDetails(true);
    } catch (error) {
      console.error("Error loading detailed results:", error);
    }
  };

  if (loading) {
    return (
      <Layout title="Student Analytics">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout title="Student Not Found">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">This student does not exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/students')}>Back to Students</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${student.name} - Analytics`}>
      {/* Header with student details and actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/students')}
              className="mr-4"
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <div className="flex flex-wrap items-center text-gray-600 mt-1">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
                  Roll: {student.roll}
                </span>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mr-2">
                  Class: {(student as any).classes?.name}
                </span>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  Section: {(student as any).classes?.section}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Last Test: {analytics.lastTestDate}</span>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              analytics.progressTrend === 'improving' ? 'bg-green-100 text-green-800' :
              analytics.progressTrend === 'declining' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {analytics.progressTrend === 'improving' ? 'Improving' :
               analytics.progressTrend === 'declining' ? 'Needs Attention' :
               'Stable'}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="col-span-1"
        >
          <Card className="h-full hover:shadow-md transition-shadow border-l-4 border-blue-500">
            <CardContent className="flex items-center py-6">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">MCQs Completed</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.completedMcqs}/{analytics.totalMcqs}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ width: `${(analytics.completedMcqs / analytics.totalMcqs) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="col-span-1"
        >
          <Card className="h-full hover:shadow-md transition-shadow border-l-4 border-green-500">
            <CardContent className="flex items-center py-6">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageScore}%</p>
                <div className="flex items-center mt-1">
                  <div className="text-xs text-gray-500">
                    {analytics.peerComparison > 0 ? 
                      <span className="text-green-600">{analytics.peerComparison}% above class average</span> : 
                      analytics.peerComparison < 0 ?
                      <span className="text-red-600">{Math.abs(analytics.peerComparison)}% below class average</span> :
                      <span>At class average</span>
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="col-span-1"
        >
          <Card className="h-full hover:shadow-md transition-shadow border-l-4 border-purple-500">
            <CardContent className="flex items-center py-6">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Consistency</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.consistencyScore}/100</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full ${
                      analytics.consistencyScore > 80 ? 'bg-green-500' :
                      analytics.consistencyScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analytics.consistencyScore}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="col-span-1"
        >
          <Card className="h-full hover:shadow-md transition-shadow border-l-4 border-amber-500">
            <CardContent className="flex items-center py-6">
              <div className="p-3 rounded-full bg-amber-100 mr-4">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Test Frequency</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.testFrequency} days
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics.testFrequency <= 7 ? 
                    <span className="text-green-600">Excellent frequency</span> : 
                    analytics.testFrequency <= 14 ?
                    <span className="text-amber-600">Good frequency</span> :
                    <span className="text-red-600">Needs more frequent tests</span>
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Chart and Learning Path */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Performance History</h2>
                <p className="text-sm text-gray-500">Recent test scores over time</p>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 rounded-full bg-primary-500 mr-1"></div>
                <span className="text-gray-600 mr-3">Score (%)</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full relative">
                {/* Container for the chart */}
                <div className="absolute inset-0 flex items-end">
                  {/* Y-axis labels */}
                  <div className="h-full flex flex-col justify-between pr-2 py-2">
                    <span className="text-xs text-gray-500">100%</span>
                    <span className="text-xs text-gray-500">75%</span>
                    <span className="text-xs text-gray-500">50%</span>
                    <span className="text-xs text-gray-500">25%</span>
                    <span className="text-xs text-gray-500">0%</span>
                  </div>
                
                  {/* Chart area */}
                  <div className="flex-1 h-full flex items-end">
                    <div className="w-full h-full flex items-end relative">
                      {/* Background grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        <div className="border-b border-gray-200"></div>
                        <div className="border-b border-gray-200"></div>
                        <div className="border-b border-gray-200"></div>
                        <div className="border-b border-gray-200"></div>
                      </div>
                      
                      {/* Data bars */}
                      <div className="relative w-full h-full flex items-end">
                        {analytics.recentPerformance.map((item, index) => {
                          const normalizedIndex = analytics.recentPerformance.length - 1 - index;
                          const height = `${item.score}%`;
                          const barWidth = `calc(${100 / analytics.recentPerformance.length}% - 8px)`;
                          
                          return (
                            <div 
                              key={index} 
                              className="flex flex-col items-center justify-end mx-1 h-full"
                              style={{ width: barWidth }}
                            >
                              <div className="flex flex-col items-center w-full">
                                <div 
                                  className="w-full bg-primary-500 hover:bg-primary-700 transition-colors rounded-t relative group"
                                  style={{ height, opacity: 0.6 + (normalizedIndex * 0.1) }}
                                >
                                  {/* Tooltip on hover */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-1 rounded whitespace-nowrap">
                                    {item.title}: {item.score}%
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 truncate max-w-full" style={{ maxWidth: barWidth }}>
                                  {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Learning Path Progress</h2>
              <p className="text-sm text-gray-500">Overall curriculum completion</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-56">
                {/* Circular progress indicator */}
                <div className="relative w-48 h-48">
                  {/* Background circle */}
                  <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>
                  
                  {/* Progress circle - SVG for precise arc drawing */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 45 * analytics.learningPathProgress / 100} ${2 * Math.PI * 45 * (1 - analytics.learningPathProgress / 100)}`}
                      className="text-primary-500"
                    />
                  </svg>
                  
                  {/* Percentage in the middle */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold text-gray-800">{analytics.learningPathProgress}%</span>
                    <span className="text-sm text-gray-500">Completed</span>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center">
                  <CalendarClock className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    Next assessment recommended in {Math.max(1, analytics.testFrequency - 7)} days
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Strengths, Weaknesses and Question Types */}
      {/* This section has been removed */}

      {/* AI-Driven Cognitive Analysis */}
      {/* This section has been removed */}

      {/* Recommendations */}
      {/* This section has been removed */}

      {/* Test Results */}
      {testResults.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="mb-8"
        >
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Test History</h2>
                <p className="text-sm text-gray-500">Complete record of all assessments</p>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testResults.map((result, index) => {
                    // Calculate if this result is better or worse than the previous
                    const prevResult = testResults[index + 1];
                    let trend = 'stable';
                    if (prevResult) {
                      trend = result.percentage > prevResult.percentage ? 'improved' : 
                              result.percentage < prevResult.percentage ? 'declined' : 'stable';
                    }
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{(result.mcqs as any).title}</div>
                          <div className="text-xs text-gray-500">{result.total_questions} questions</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(result.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(result.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{result.score}/{result.total_questions}</div>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-1.5 rounded-full ${
                                result.percentage >= 70 ? 'bg-green-500' : 
                                result.percentage >= 40 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${result.percentage}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              result.percentage >= 70 ? 'bg-green-100 text-green-800' : 
                              result.percentage >= 40 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {result.percentage}%
                            </div>
                            
                            {trend !== 'stable' && (
                              <div className="ml-2">
                                {trend === 'improved' ? (
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => viewDetailedResults(result.id)}
                            className="inline-flex items-center px-3 py-1 border border-primary-500 text-xs font-medium rounded text-primary-600 bg-white hover:bg-primary-50 transition-colors"
                          >
                            View Details
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Test Results Detail Modal */}
      {showResultDetails && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{selectedResult.mcqs?.title} - Detailed Results</h2>
                <button 
                  onClick={() => setShowResultDetails(false)}
                  className="text-white hover:text-gray-200 transition-colors focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Add debug information toggle */}
              <div className="mb-4 border border-gray-200 rounded-lg p-2">
                <details className="text-sm text-gray-700">
                  <summary className="cursor-pointer font-medium">Debug Information</summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                    <p className="font-bold mb-1">Raw scanned_answers format:</p>
                    <pre>{JSON.stringify(selectedResult.scanned_answers || [], null, 2)}</pre>
                    
                    <p className="font-bold mt-3 mb-1">Formatted answers for display:</p>
                    <pre>{JSON.stringify(selectedResult.scannedAnswers || [], null, 2)}</pre>
                    
                    <p className="font-bold mt-3 mb-1">MCQ questions data:</p>
                    <pre>{JSON.stringify(selectedResult.mcqQuestions?.slice(0, 3) || [], null, 2)}</pre>
                    <p className="text-gray-500">(Showing first 3 questions only)</p>
                  </div>
                </details>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800 font-medium mb-1">Student</p>
                  <p className="text-lg font-bold text-blue-900">{student.name}</p>
                  <p className="text-xs text-blue-700 mt-1">Class: {(student as any).classes?.name} - {(student as any).classes?.section}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-800 font-medium mb-1">Score</p>
                  <p className="text-lg font-bold text-green-900">
                    {selectedResult.score}/{selectedResult.total_questions}
                  </p>
                  <div className="w-full bg-white rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        selectedResult.percentage >= 70 ? 'bg-green-500' :
                        selectedResult.percentage >= 40 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${selectedResult.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-green-700 mt-1">{selectedResult.percentage}% correct</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-800 font-medium mb-1">Test Date</p>
                  <p className="text-lg font-bold text-purple-900">
                    {new Date(selectedResult.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    {new Date(selectedResult.created_at).toLocaleTimeString(undefined, { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="mb-6 border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-medium text-gray-800">Answer Summary</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Q#</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student's Answer</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedResult.scannedAnswers && selectedResult.scannedAnswers.length > 0 ? (
                        selectedResult.scannedAnswers.map((answer: any, idx: number) => {
                          // Find the corresponding question from MCQ data
                          const questionIndex = answer.questionNumber - 1; // Convert to 0-based index
                          const mcqQuestion = selectedResult.mcqQuestions?.[questionIndex];
                          
                          // Get the correct option letter (A, B, C, D) based on correct_option index
                          const correctOptionLetter = mcqQuestion && mcqQuestion.correct_option !== undefined ? 
                            ["A", "B", "C", "D"][mcqQuestion.correct_option] : "?";
                          
                          // Check if student's answer matches the correct answer
                          const isCorrect = answer.isCorrect !== undefined ? 
                            answer.isCorrect : 
                            answer.selectedOption === correctOptionLetter;
                          
                          return (
                            <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-${isCorrect ? 'green' : 'red'}-50`}>
                              <td className="px-3 py-3 text-sm font-medium">{answer.questionNumber}</td>
                              <td className="px-3 py-3 text-sm">
                                {mcqQuestion ? 
                                  <div className="max-w-xs truncate" title={mcqQuestion.question}>
                                    {mcqQuestion.question?.substring(0, 60)}{mcqQuestion.question?.length > 60 ? "..." : ""}
                                  </div> : 
                                  "Question details not available"
                                }
                                {!mcqQuestion && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Question #{answer.questionNumber} not found in MCQ data
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-3">
                                <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${
                                  !answer.selectedOption ? 'bg-gray-100 text-gray-500' :
                                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                } font-medium text-sm`}>
                                  {answer.selectedOption || "–"}
                                </span>
                                {answer.selectedOption && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Student's choice
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-3">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-medium text-sm">
                                  {correctOptionLetter}
                                </span>
                                {correctOptionLetter === "?" && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Answer key not found
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-3 text-sm">
                                {isCorrect ? 
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <Check className="h-3 w-3 mr-1" />
                                    Correct
                                  </span> : 
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <X className="h-3 w-3 mr-1" />
                                    Incorrect
                                  </span>
                                }
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-sm text-center text-gray-500">
                            No detailed answer data available for this test.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add a performance summary */}
              {selectedResult.scannedAnswers && selectedResult.scannedAnswers.length > 0 && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-800 mb-3">Performance Summary</h3>
                    <div className="space-y-2">
                      {/* Calculate total correct and incorrect */}
                      {(() => {
                        const totalAnswered = selectedResult.scannedAnswers.filter((a: any) => a.selectedOption).length;
                        const correctAnswers = selectedResult.scannedAnswers.filter((a: any) => a.isCorrect).length;
                        const incorrectAnswers = totalAnswered - correctAnswers;
                        const skippedQuestions = selectedResult.total_questions - totalAnswered;
                        
                        return (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Correct Answers:</span>
                              <span className="font-medium text-green-600">{correctAnswers}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Incorrect Answers:</span>
                              <span className="font-medium text-red-600">{incorrectAnswers}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Unanswered:</span>
                              <span className="font-medium text-gray-600">{skippedQuestions}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t">
                              <span className="text-gray-600">Total:</span>
                              <span className="font-medium">{selectedResult.total_questions}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-800 mb-3">Result Analysis</h3>
                    <div className="flex justify-center items-center h-28">
                      {/* Simple pie chart visualization */}
                      <div className="relative w-28 h-28">
                        {/* Calculate percentages for visualization */}
                        {(() => {
                          const totalAnswered = selectedResult.scannedAnswers.filter((a: any) => a.selectedOption).length;
                          const correctAnswers = selectedResult.scannedAnswers.filter((a: any) => a.isCorrect).length;
                          const incorrectAnswers = totalAnswered - correctAnswers;
                          // Calculate skipped questions for use in the gradient calculation
                          // This is used indirectly in the gradient calculation
                          
                          const correctPercent = (correctAnswers / selectedResult.total_questions) * 100;
                          const incorrectPercent = (incorrectAnswers / selectedResult.total_questions) * 100;
                          // The skipped percentage is derived from: 100% - correctPercent - incorrectPercent
                          
                          // Create conic gradient based on percentages
                          const gradient = `conic-gradient(
                            #22c55e 0% ${correctPercent}%, 
                            #ef4444 ${correctPercent}% ${correctPercent + incorrectPercent}%, 
                            #94a3b8 ${correctPercent + incorrectPercent}% 100%
                          )`;
                          
                          return (
                            <>
                              <div 
                                className="absolute inset-0 rounded-full"
                                style={{ background: gradient }}
                              ></div>
                              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                <span className="text-xl font-bold">{selectedResult.percentage}%</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      
                      <div className="ml-4 text-sm space-y-1">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span>Correct</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span>Incorrect</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                          <span>Unanswered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  className="mr-2"
                  onClick={() => setShowResultDetails(false)}
                >
                  Close
                </Button>
                <Button
                  // Add the ability to download or print results
                  onClick={() => window.print()}
                >
                  Print Report
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
} 