import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileUp, Scan, Info, Check, AlertTriangle, Plus, Trash2, ArrowRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Mcq, Student } from '../lib/supabase';

/**
 * Test Checking Page
 * 
 * NOTE: The AI-powered OCR functionality previously provided by Google Gemini has been removed.
 * You'll need to implement your own OCR solution to process the answer sheets.
 */

// Define types for OCR processing results
type OcrProcessingSuccessResult = {
  success: true;
  student: any;
  score: number;
  totalQuestions: number;
  percentage: number;
  questionResults: Array<{
    questionNumber: number;
    questionText: string;
    studentAnswer: string;
    studentOptionIndex: number;
    correctAnswer: string;
    correctOptionIndex: number;
    isCorrect: boolean;
    isUnanswered?: boolean;
    confidence?: 'high' | 'medium' | 'low' | 'very-low';
  }>;
  rawOcrData: any;
  testTitle?: string;
  classInfo?: string;
  extractedStudentInfo?: Record<string, string>;
};

type ScanResultFailure = {
  failure: true;
  errorMessage: string;
  studentName?: string;
  rollNumber?: string;
  imageIndex: number;
};

type ScanResultSuccess = OcrProcessingSuccessResult;

export default function TestCheckingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [mcqs, setMcqs] = useState<Mcq[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedMcq, setSelectedMcq] = useState<string>('');
  const [mcqDetails, setMcqDetails] = useState<Mcq | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [processingStatus, setProcessingStatus] = useState<Record<string, string>>({});
  const [finalResults, setFinalResults] = useState<any[]>([]);
  const [savingResults, setSavingResults] = useState(false);
  const [processingErrors, setProcessingErrors] = useState<ScanResultFailure[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const [editingResult, setEditingResult] = useState<ScanResultSuccess | null>(null);
  const [editedAnswers, setEditedAnswers] = useState<Record<number, string>>({});
  const [duplicateDetected, setDuplicateDetected] = useState(false);

  useEffect(() => {
    fetchMcqs();
  }, [user]);

  useEffect(() => {
    if (selectedMcq) {
      fetchMcqDetails();
      fetchStudents();
    }
  }, [selectedMcq]);

  const fetchMcqs = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('mcqs')
        .select('*, classes(name, section)')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMcqs(data || []);
    } catch (error) {
      console.error('Error fetching MCQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMcqDetails = async () => {
    try {
      if (!user || !selectedMcq) return;

      const { data, error } = await supabase
        .from('mcqs')
        .select('*')
        .eq('id', selectedMcq)
        .eq('teacher_id', user.id)
        .single();

      if (error) throw error;
      
      // Log the full MCQ data to understand its structure
      console.log('Raw MCQ data from database:', data);
      
      if (data && data.questions) {
        console.log('MCQ questions structure sample:', data.questions[0]);
        // Log the correct_option value to ensure it exists and is accessible
        console.log('First question correct_option:', 
          data.questions[0]?.correct_option !== undefined ? 
          data.questions[0].correct_option : 'undefined');
      }
      
      setMcqDetails(data);
    } catch (error) {
      console.error('Error fetching MCQ details:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      if (!user || !selectedMcq) return;

      // First get the class_id from the selected MCQ
      const { data: mcqData, error: mcqError } = await supabase
        .from('mcqs')
        .select('class_id')
        .eq('id', selectedMcq)
        .single();

      if (mcqError) throw mcqError;

      // Then fetch students belonging to this class
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', mcqData.class_id)
        .eq('teacher_id', user.id)
        .order('roll', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // Reset the input value if no files were selected
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      const newFiles = Array.from(e.target.files);
      
      // Validate file types (only images)
      const validFiles = newFiles.filter(file => {
        return file.type.startsWith('image/');
      });
      
      if (validFiles.length !== newFiles.length) {
        alert('Only image files are allowed.');
      }
      
      // Add valid files to state
      if (validFiles.length > 0) {
        setUploadedImages(prev => [...prev, ...validFiles]);
        
        // Create preview URLs
        const newUrls = validFiles.map(file => URL.createObjectURL(file));
        setImageUrls(prev => [...prev, ...newUrls]);
      }
      
      // Reset the input so the same file can be selected again if needed
      e.target.value = '';
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Failed to process files. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const scanAnswerSheets = async () => {
    if (!selectedMcq || uploadedImages.length === 0 || !mcqDetails) {
      return;
    }

    setProcessing(true);
    setProcessingStatus({});
    setScanResults([]);
    setFinalResults([]);  // Clear final results before starting scan
    setDuplicateDetected(false); // Reset duplicate detection warning
    
    // Reset previous errors
    setProcessingErrors([]);

    try {
      // Connect to the actual OpenCV API
      const apiBaseUrl = import.meta.env.VITE_OPENCV_API_URL || 'https://api.mcqgen.xyz';
      
      for (let i = 0; i < uploadedImages.length; i++) {
        // Update status to "processing"
        setProcessingStatus(prev => ({ ...prev, [i]: 'processing' }));
        
        try {
          console.log(`Processing image ${i + 1}/${uploadedImages.length}...`);
          
          // Get answer key from the MCQ
          let answerKey = '';
          if (mcqDetails && mcqDetails.questions) {
            answerKey = mcqDetails.questions.map(q => {
              // Convert numeric index to letter (0 = A, 1 = B, etc.)
              if (q.correct_option !== undefined) {
                return String.fromCharCode(65 + q.correct_option);
              }
              return '';
            }).join('');
          }
          
          console.log('Using answer key:', answerKey);

          // Instead of using the webhook API, we'll use the direct process-omr API
          // which accepts file uploads rather than URLs
          const formData = new FormData();
          formData.append('file', uploadedImages[i]);
          
          if (answerKey) {
            formData.append('answer_key', answerKey);
          }
          
          console.log(`Sending image to ${apiBaseUrl}/api/analyze-omr`);
          
          // Use the analyze-omr endpoint which provides detailed results
          const response = await fetch(`${apiBaseUrl}/api/analyze-omr`, {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
          }
          
          const responseData = await response.json();
          console.log('API response:', responseData);
          
          if (!responseData.success) {
            throw new Error(responseData.error || 'Unknown error from API');
          }
          
          // We'll choose a default student for display purposes, but will allow manual selection
          // IMPORTANT - The student info would ideally come from the OMR API's student info detection
          const studentIndex = i % students.length;
          const defaultStudent = students[studentIndex];
          
          // Try to extract student information from the API response
          const extractedStudentInfo = responseData.student_info || {};
          let matchedStudent = defaultStudent;
          
          if (extractedStudentInfo) {
            // Try to match the extracted student info with our stored students
            const extractedName = extractedStudentInfo.name || '';
            const extractedRoll = extractedStudentInfo.roll_number || '';
            
            if (extractedName || extractedRoll) {
              console.log(`Extracted student info - Name: '${extractedName}', Roll: '${extractedRoll}'`);
              
              // Try to find a matching student
              const matchByName = students.find(s => 
                s.name.toLowerCase() === extractedName.toLowerCase());
              
              const matchByRoll = students.find(s => 
                s.roll.toLowerCase() === extractedRoll.toLowerCase());
              
              if (matchByRoll) {
                matchedStudent = matchByRoll;
                console.log(`Matched student by roll number: ${matchedStudent.name} (${matchedStudent.roll})`);
              } else if (matchByName) {
                matchedStudent = matchByName;
                console.log(`Matched student by name: ${matchedStudent.name} (${matchedStudent.roll})`);
              }
            }
          }
          
          // Map the API responses to our expected format
          const questionResults = [];
          for (const answer of responseData.opencv_answers || []) {
            const questionNumber = answer.question;
            const optionIndex = answer.marked_option_index;
            const studentAnswer = answer.marked_option || '';
            const correctAnswer = answer.expected_option || '';
            const isCorrect = answer.correct === true;
            
            // Add to question results
            questionResults.push({
              questionNumber,
              questionText: `Question ${questionNumber}`,
              studentAnswer,
              studentOptionIndex: optionIndex,
              correctAnswer,
              correctOptionIndex: correctAnswer ? correctAnswer.charCodeAt(0) - 65 : -1,
              isCorrect,
              confidence: 'high' as 'high' | 'medium' | 'low' | 'very-low'
            });
          }
          
          // Extract student information if available
          let studentInfo = responseData.student_info || {};
          if (studentInfo) {
            console.log('Student info from API:', studentInfo);
          }
          
          // Calculate score
          const totalQuestions = questionResults.length;
          const correctAnswers = questionResults.filter(q => q.isCorrect).length;
          const score = correctAnswers;
          const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
          
          // Create result object
          const processingResult: ScanResultSuccess = {
            success: true,
            student: matchedStudent,
            score: score,
            totalQuestions: totalQuestions,
            percentage: percentage,
            questionResults: questionResults,
            rawOcrData: responseData,
            testTitle: mcqDetails?.title || 'Unknown Test',
            classInfo: 'Class Info',
            extractedStudentInfo: extractedStudentInfo // Store original extracted info for reference
          };
          
          // Update status to "success"
          setProcessingStatus(prev => ({ ...prev, [i]: 'success' }));
          
          // Add to scan results
          setScanResults(prev => [...prev, processingResult]);
          
          // Add to final results - Check if this student already exists in results to prevent duplicates
          setFinalResults(prev => {
            // Check if we already have a result for this student
            const existingResultIndex = prev.findIndex(r => 
              r.student && r.student.id === matchedStudent.id
            );
            
            if (existingResultIndex >= 0) {
              // Replace the existing result with the new one (better accuracy)
              console.log(`Found duplicate result for student ${matchedStudent.name}, updating...`);
              // Set duplicateDetected to true to show warning
              setDuplicateDetected(true);
              const updatedResults = [...prev];
              updatedResults[existingResultIndex] = processingResult;
              return updatedResults;
            } else {
              // Add as a new result
              return [...prev, processingResult];
            }
          });
          
          console.log(`Successfully processed image ${i + 1} for student ${matchedStudent.name}`);
        } catch (error) {
          console.error("Error processing image:", error);
          setProcessingStatus(prev => ({ ...prev, [i]: 'error' }));
          
          setProcessingErrors(prev => [
            ...prev,
            {
              failure: true,
              errorMessage: `Error processing OMR sheet: ${error instanceof Error ? error.message : String(error)}`,
              studentName: "Unknown",
              rollNumber: "Unknown",
              imageIndex: i
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error scanning answer sheets:', error);
      alert(`An error occurred during scanning: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setProcessing(false);
    }
  };

  // Add new function to reassign student for a result
  const reassignStudent = (resultIndex: number, newStudentId: string) => {
    const updatedResults = [...scanResults];
    const newStudent = students.find(s => s.id === newStudentId);
    
    if (newStudent && updatedResults[resultIndex]) {
      // Create a new result object with the updated student
      updatedResults[resultIndex] = {
        ...updatedResults[resultIndex],
        student: newStudent
      };
      
      // Update both scan results and final results
      setScanResults(updatedResults);
      setFinalResults(updatedResults);
      
      console.log(`Reassigned result to student: ${newStudent.name} (${newStudent.roll})`);
    }
  };

  const saveResults = async () => {
    if (finalResults.length === 0 || !user || !selectedMcq) {
      return;
    }

    // Check for and handle duplicate student entries before showing confirmation
    const uniqueStudentMap = new Map();
    
    // Group results by student ID and keep only the highest score or most recent
    finalResults.forEach(result => {
      const studentId = result.student.id;
      
      if (!uniqueStudentMap.has(studentId)) {
        uniqueStudentMap.set(studentId, result);
      } else {
        // If duplicate exists, keep the one with higher score
        const existingResult = uniqueStudentMap.get(studentId);
        if (result.score > existingResult.score) {
          uniqueStudentMap.set(studentId, result);
          console.log(`Keeping higher score (${result.score}) result for student ${result.student.name}`);
        } else {
          console.log(`Keeping existing score (${existingResult.score}) for student ${existingResult.student.name}`);
        }
      }
    });
    
    // Create a deduplicated array of results
    const uniqueResults = Array.from(uniqueStudentMap.values());
    
    // Update final results with deduplicated list
    setFinalResults(uniqueResults);

    // Confirmation prompt to verify student assignments
    const confirmMessage = `Please verify the student assignments:
${uniqueResults.map((result, idx) => 
  `${idx + 1}. ${result.student.name} (Roll: ${result.student.roll}) - Score: ${result.score}/${result.totalQuestions}`
).join('\n')}

Are you sure you want to save these results?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSavingResults(true);

    try {
      // We'll save just the result data without attempting to upload the images
      // since we're receiving the processed result images directly from the API
      console.log(`Starting to save ${uniqueResults.length} results to database...`);
      
      // Format image URLs as an array for the database schema
      console.log('Preparing image URLs...');

      // Save results to database
      for (const result of uniqueResults) {
        try {
          if (!result.student || !result.student.id) {
            console.error('Missing student information for this result, skipping:', result);
            continue;
          }
          
          console.log(`Saving result for student: ${result.student.name} (ID: ${result.student.id})`);
          
          // Format student answers to match the expected jsonb schema
          // This is critical - must ensure scanned_answers is properly formatted as jsonb
          const formattedAnswers = result.questionResults.map((qr: {
            questionNumber: number;
            questionText: string;
            studentAnswer: string;
            studentOptionIndex: number;
            correctAnswer: string;
            correctOptionIndex: number;
            isCorrect: boolean;
            confidence?: 'high' | 'medium' | 'low' | 'very-low';
          }) => ({
            question_number: qr.questionNumber,
            selected_option: qr.studentAnswer,
            is_correct: qr.isCorrect,
            confidence: qr.confidence || 'medium'
          }));
          
          // Extract image URLs from the API response or use empty array
          const imageUrls = [];
          if (result.rawOcrData && result.rawOcrData.result_image_url) {
            const fullUrl = `${import.meta.env.VITE_OPENCV_API_URL || 'https://api.mcqgen.xyz'}${result.rawOcrData.result_image_url}`;
            imageUrls.push(fullUrl);
          }
          
          // Ensure the data matches the database schema exactly
          const resultData = {
            student_id: result.student.id,
            mcq_id: selectedMcq,
            score: result.score,
            total_questions: result.totalQuestions,
            percentage: Number(result.percentage.toFixed(2)), // Ensure this is numeric(5,2)
            scanned_answers: formattedAnswers, // This will be converted to jsonb
            image_urls: imageUrls, // Must be text[] array
            teacher_id: user.id,
            created_at: new Date().toISOString()
          };
          
          console.log(`Prepared result data for ${result.student.name}:`, JSON.stringify(resultData, null, 2));

          // Check if result already exists - important for honoring the UNIQUE constraint
          const { data: existingResult, error: checkError } = await supabase
            .from('student_results')
            .select('id')
            .eq('student_id', result.student.id)
            .eq('mcq_id', selectedMcq)
            .maybeSingle();

          if (checkError) {
            console.error('Error checking for existing result:', checkError);
            throw checkError;
          }

          if (existingResult) {
            // Update existing result
            console.log(`Found existing result (ID: ${existingResult.id}) for student ${result.student.name}, updating...`);
            
            const { data: updateData, error: updateError } = await supabase
              .from('student_results')
              .update(resultData)
              .eq('id', existingResult.id)
              .select();

            if (updateError) {
              console.error('Error updating result:', updateError);
              console.error('Error details:', updateError.details, updateError.hint, updateError.message);
              throw updateError;
            }
            
            console.log('Successfully updated existing result:', updateData);
          } else {
            // Insert new result
            console.log(`No existing result found for student ${result.student.name}, creating new record...`);
            
            const { data: insertData, error: insertError } = await supabase
              .from('student_results')
              .insert([resultData])
              .select();

            if (insertError) {
              console.error('Error inserting new result:', insertError);
              console.error('Error details:', insertError.details, insertError.hint, insertError.message);
              throw insertError;
            }
            
            console.log('Successfully inserted new result:', insertData);
          }
        } catch (saveError) {
          console.error(`Error saving result for student ${result.student?.name || 'Unknown'}:`, saveError);
          // Continue with other students instead of failing completely
        }
      }

      // Reset state
      setUploadedImages([]);
      setImageUrls([]);
      setScanResults([]);
      setFinalResults([]);
      setSelectedMcq('');
      setMcqDetails(null);
      
      // Navigate to student analytics
      if (uniqueResults.length === 1) {
        navigate(`/students/${uniqueResults[0].student.id}/analytics`);
      } else {
        // Show success message or navigate to a summary page
        alert('Results saved successfully!');
      }
    } catch (error) {
      console.error('Error saving results:', error);
      // Show more detailed error message to help debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save results: ${errorMessage}`);
    } finally {
      setSavingResults(false);
    }
  };

  // New function to handle manual corrections
  const handleManualCorrection = (result: ScanResultSuccess) => {
    // Initialize the editing state with current answers
    const initialAnswers: Record<number, string> = {};
    result.questionResults.forEach(qr => {
      initialAnswers[qr.questionNumber] = qr.studentAnswer;
    });
    
    setEditedAnswers(initialAnswers);
    setEditingResult(result);
  };

  // Function to save manual corrections
  const saveManualCorrections = () => {
    if (!editingResult || !mcqDetails) return;
    
    // Create a modified copy of the result with updated answers
    const updatedResult: ScanResultSuccess = {
      ...editingResult,
      questionResults: editingResult.questionResults.map(qr => {
        // If this question has an edited answer, update it
        if (qr.questionNumber in editedAnswers) {
          const newOption = editedAnswers[qr.questionNumber];
          
          // If the new option is empty, mark as unanswered
          if (!newOption) {
            return {
              ...qr,
              studentAnswer: "",
              studentOptionIndex: -1,
              isCorrect: false
            };
          }
          
          // Convert option letter to index (A=0, B=1, etc.)
          let newOptionIndex = -1;
          
          if (newOption === 'A') newOptionIndex = 0;
          else if (newOption === 'B') newOptionIndex = 1;
          else if (newOption === 'C') newOptionIndex = 2; 
          else if (newOption === 'D') newOptionIndex = 3;
          
          // Check if the new answer is correct
          const questionData = mcqDetails.questions[qr.questionNumber - 1];
          const correctOptionIndex = Number(questionData?.correct_option);
          const isCorrect = !isNaN(correctOptionIndex) && newOptionIndex === correctOptionIndex;
          
          return {
            ...qr,
            studentAnswer: newOption,
            studentOptionIndex: newOptionIndex,
            isCorrect
          };
        }
        return qr;
      })
    };
    
    // Recalculate score
    let newScore = 0;
    updatedResult.questionResults.forEach(qr => {
      if (qr.isCorrect) newScore++;
    });
    
    updatedResult.score = newScore;
    updatedResult.percentage = parseFloat(((newScore / updatedResult.totalQuestions) * 100).toFixed(2));
    
    // Update the results in state
    setFinalResults(prev => 
      prev.map(r => 
        r.student.id === updatedResult.student.id ? updatedResult : r
      )
    );
    
    setScanResults(prev => 
      prev.map(r => 
        r.student.id === updatedResult.student.id ? updatedResult : r
      )
    );
    
    // Clear editing state
    setEditingResult(null);
    setEditedAnswers({});
  };

  // Function to cancel manual corrections
  const cancelManualCorrections = () => {
    setEditingResult(null);
    setEditedAnswers({});
  };

  // Function to change an answer during manual correction
  const handleAnswerChange = (questionNumber: number, newOption: string) => {
    setEditedAnswers(prev => ({
      ...prev,
      [questionNumber]: newOption
    }));
  };

  return (
    <Layout title="Test Checking">
      <div className="mb-6">
        <p className="text-gray-600">
          Upload and scan student answer sheets for automated grading using the OpenCV OMR processing system
        </p>
        
        {/* Add duplicate detection notification */}
        {duplicateDetected && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-yellow-800 font-medium">⚠️ Duplicate Student Detected</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Multiple answer sheets were detected for the same student. The system has kept the result with the higher score.
              Please review the results carefully before saving.
            </p>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-blue-800 font-medium">ℹ️ Integration Information</h3>
          <p className="text-sm text-blue-700 mt-1">
            This application is now connected to the OpenCV OMR processing system. Images are sent directly 
            to the OpenCV API running at {import.meta.env.VITE_OPENCV_API_URL || 'https://api.mcqgen.xyz'}.
            Make sure the OpenCV server is running before scanning answer sheets.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            <strong>Note:</strong> You may need to adjust CORS settings on the OpenCV server if you encounter connection issues.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Select MCQ */}
        <Card className={`h-full ${selectedMcq ? 'border-primary-100' : ''}`}>
          <CardHeader>
            <h2 className="font-medium flex items-center">
              <span className="bg-primary-50 text-primary-700 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">1</span>
              Select MCQ
            </h2>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedMcq}
              onChange={(e) => setSelectedMcq(e.target.value)}
              options={[
                { value: '', label: 'Select an MCQ' },
                ...mcqs.map(mcq => ({ 
                  value: mcq.id, 
                  label: `${mcq.title} (${(mcq as any).classes?.name || 'Unknown class'})` 
                }))
              ]}
              disabled={loading || processing}
            />

            {mcqDetails && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h3 className="font-medium text-sm">{mcqDetails.title}</h3>
                <p className="text-xs text-gray-600">{mcqDetails.questions.length} questions</p>
                {students.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">{students.length} students in class</p>
                )}
              </div>
            )}

            {/* Debug Mode Toggle */}
            <div className="mt-3 flex items-center">
              <input
                type="checkbox"
                id="debug-mode"
                checked={debugMode}
                onChange={() => setDebugMode(!debugMode)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="debug-mode" className="ml-2 text-sm text-gray-600">
                Enable Debug Mode
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Upload Answer Sheets */}
        <Card className={`h-full ${uploadedImages.length > 0 ? 'border-primary-100' : ''}`}>
          <CardHeader>
            <h2 className="font-medium flex items-center">
              <span className="bg-primary-50 text-primary-700 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">2</span>
              Upload Answer Sheets
            </h2>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-primary-300 transition-colors">
              <FileUp className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">Upload scanned answer sheets</p>
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={!selectedMcq || processing}
              />
              <label htmlFor="file-upload" className={`inline-block ${!selectedMcq || processing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <div className={`flex items-center justify-center px-4 py-2 rounded-md ${!selectedMcq || processing ? 'bg-gray-200 text-gray-500' : 'bg-primary-500 text-white hover:bg-primary-600'} transition-colors`}>
                  <Plus size={16} className="mr-2" />
                  Add Images
                </div>
              </label>
            </div>

            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Uploaded Images ({uploadedImages.length})</p>
                <div className="grid grid-cols-2 gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative rounded-md overflow-hidden border border-gray-200 bg-gray-50">
                      <img 
                        src={url} 
                        alt={`Uploaded ${index + 1}`} 
                        className="w-full h-32 object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik01LjUgMjMgNSA1IDQuNSA5LjVIMlYxaC4yNWMxLjM3NCAwIDIuNzUuMjAzIDQuMDk5LjYwNCAxLjQ0NS40OTYgMi42OTkgMS4yNDMgMy43NSAyLjIyN2EzLjM5OSAzLjM5OSAwIDAgMCAuNDY0LjM5NEMxMS41NjMgNS4wNjggMTIuNCAzLjk4MyAxNC4xIDMuMDg2IDE1LjQ1IDIuMzQ3IDE2Ljk1IDIgMTguNSAySDIwdjhoLTJ2LTZoLS4yNWMtMS4wMjEgMC0yLjAyNy4yNDMtMi45NzguNzExLTEuMDQxLjUxMy0xLjgxNiAxLjEzNC0yLjI5NyAxLjg0NEMxMS45MyA3LjQxOCAxMS41MjkgOC40MjMgMTAuOTc4IDkuMzA4IDEwLjM2NyAxMC4yOTggOS42MyAxMSA4LjUgMTFoLTJ2OC42ODRDNi4zNDQgMTkuODkxIDYgMjAuMzQyIDYgMjAuODV2LjE1SDVjLS4xMSAwLS4yLTEuMDItLjUtMnoiIGZpbGw9IiNkZGQiLz48L3N2Zz4=';
                          target.classList.add('p-4');
                        }}
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                        disabled={processing}
                        aria-label="Remove image"
                      >
                        <Trash2 size={14} />
                      </button>
                      {processingStatus[index] && (
                        <div className={`absolute bottom-0 left-0 right-0 text-xs p-1 text-white text-center
                          ${processingStatus[index] === 'processing' ? 'bg-blue-500' : 
                            processingStatus[index] === 'success' ? 'bg-green-500' : 
                            processingStatus[index] === 'student_not_found' ? 'bg-yellow-500' : 
                            'bg-red-500'}`}>
                          {processingStatus[index] === 'processing' ? 'Processing...' : 
                           processingStatus[index] === 'success' ? 'Success' : 
                           processingStatus[index] === 'student_not_found' ? 'No Match' : 
                           'Error'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Scan and Process */}
        <Card className="h-full">
          <CardHeader>
            <h2 className="font-medium flex items-center">
              <span className="bg-primary-50 text-primary-700 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">3</span>
              Process and Save
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                leftIcon={<Scan size={16} />}
                className="w-full"
                disabled={!selectedMcq || uploadedImages.length === 0 || processing}
                isLoading={processing}
                onClick={scanAnswerSheets}
              >
                Scan Answer Sheets
              </Button>

              <div className="p-3 bg-yellow-50 rounded-md text-yellow-700 text-sm">
                OCR functionality has been removed. You need to implement your own solution.
              </div>

              {scanResults.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Results:</p>
                  <div className="space-y-2">
                    {scanResults.map((result, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{result.student.name}</p>
                              
                              {/* Add student selection dropdown */}
                              <Select
                                value={result.student.id}
                                onChange={(e) => reassignStudent(index, e.target.value)}
                                className="ml-2 text-xs py-1 px-1 h-7 min-h-0"
                                aria-label="Reassign student"
                                options={students.map(student => ({
                                  value: student.id,
                                  label: `${student.name} (Roll: ${student.roll})`
                                }))}
                              />
                            </div>
                            <p className="text-xs text-gray-600">Roll: {result.student.roll}</p>
                            
                            {/* Show extracted student info if available */}
                            {result.extractedStudentInfo && Object.keys(result.extractedStudentInfo).length > 0 && (
                              <div className="mt-1 text-xs text-gray-500">
                                <p>Extracted info: {result.extractedStudentInfo.name ? `Name: ${result.extractedStudentInfo.name}` : ''}
                                {result.extractedStudentInfo.roll_number ? `, Roll: ${result.extractedStudentInfo.roll_number}` : ''}</p>
                              </div>
                            )}
                            
                            {result.testTitle && result.testTitle !== "Unknown Test" && (
                              <p className="text-xs text-gray-600">Test: {result.testTitle}</p>
                            )}
                            {result.classInfo && (
                              <p className="text-xs text-gray-600">Class: {result.classInfo}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary-700">{result.score}/{result.totalQuestions}</p>
                            <p className="text-xs text-gray-600">{result.percentage}%</p>
                          </div>
                        </div>
                        
                        {/* Answer comparison */}
                        <div className="mt-2 border-t pt-2">
                          <div className="text-xs text-gray-500 mb-1">Answer Summary:</div>
                          <div className="flex flex-wrap gap-1">
                            {result.questionResults.map((qResult: {
                              questionNumber: number;
                              questionText: string;
                              studentAnswer: string;
                              studentOptionIndex: number;
                              correctAnswer: string;
                              correctOptionIndex: number;
                              isCorrect: boolean;
                              confidence?: 'high' | 'medium' | 'low';
                            }, i: number) => {
                              // Skip empty answers
                              if (!qResult.studentAnswer || qResult.studentOptionIndex === -1) {
                                return null;
                              }
                              
                              const isCorrect = qResult.isCorrect;
                              
                              // Determine confidence indicator
                              const confidenceIndicator = qResult.confidence === 'high' 
                                ? "★★★" 
                                : qResult.confidence === 'medium' 
                                  ? "★★☆" 
                                  : "★☆☆";
                              
                              return (
                                <div 
                                  key={i} 
                                  className={`text-xs px-2 py-1 rounded flex items-center ${
                                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}
                                  title={`${qResult.questionText.substring(0, 50)}${qResult.questionText.length > 50 ? '...' : ''} (Confidence: ${qResult.confidence || 'medium'})`}
                                >
                                  <span>Q{qResult.questionNumber}: {qResult.studentAnswer}</span>
                                  {isCorrect ? 
                                    <Check size={12} className="ml-1" /> : 
                                    <span className="ml-1 text-xs">≠{qResult.correctAnswer}</span>
                                  }
                                  <span className="ml-1 text-xs opacity-60" title={`Scan confidence: ${qResult.confidence || 'medium'}`}>
                                    {confidenceIndicator}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Detailed results (expandable) */}
                          {result.questionResults.length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-primary-600 cursor-pointer">
                                Show detailed answers
                              </summary>
                              <div className="mt-2 space-y-2 border-t pt-2">
                                {result.questionResults.map((qResult: {
                                  questionNumber: number;
                                  questionText: string;
                                  studentAnswer: string;
                                  studentOptionIndex: number;
                                  correctAnswer: string;
                                  correctOptionIndex: number;
                                  isCorrect: boolean;
                                  isUnanswered?: boolean;
                                  confidence?: 'high' | 'medium' | 'low' | 'very-low';
                                }, i: number) => {
                                  const questionData = mcqDetails?.questions[qResult.questionNumber - 1];
                                  
                                  // For unanswered questions, show special UI
                                  if (qResult.studentOptionIndex === -1) {
                                    return (
                                      <div key={i} className="text-xs p-2 border rounded bg-gray-50">
                                        <div className="font-medium mb-1 flex justify-between">
                                          <span>Q{qResult.questionNumber}: {qResult.questionText}</span>
                                          <span className="text-gray-500 text-xs">No Answer</span>
                                        </div>
                                        <div className="p-1 rounded bg-gray-100 text-gray-600">
                                          <span className="font-medium">Not answered by student</span>
                                        </div>
                                        <div className="mt-1 p-1 rounded bg-green-50">
                                          <span className="font-medium">Correct answer:</span> {qResult.correctAnswer}
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  const confidenceLabel = qResult.confidence === 'high' 
                                    ? "High Confidence" 
                                    : qResult.confidence === 'medium' 
                                      ? "Medium Confidence" 
                                      : "Low Confidence";
                                  
                                  const confidenceColor = qResult.confidence === 'high' 
                                    ? "text-green-600" 
                                    : qResult.confidence === 'medium' 
                                      ? "text-amber-600" 
                                      : "text-red-600";
                                  
                                  return (
                                    <div key={i} className="text-xs p-2 border rounded">
                                      <div className="font-medium mb-1 flex justify-between">
                                        <span>Q{qResult.questionNumber}: {qResult.questionText}</span>
                                        <span className={`${confidenceColor} text-xs`}>{confidenceLabel}</span>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-1">
                                        <div className={`p-1 rounded ${qResult.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                                          <span className="font-medium">Student answered:</span> {qResult.studentAnswer}
                                        </div>
                                        <div className="p-1 rounded bg-green-50">
                                          <span className="font-medium">Correct answer:</span> {qResult.correctAnswer}
                                        </div>
                                      </div>
                                      {questionData?.options && (
                                        <div className="mt-1 grid grid-cols-2 gap-1">
                                          {questionData.options.map((option: string, j: number) => (
                                            <div 
                                              key={j}
                                              className={`p-1 rounded text-xs ${
                                                j === qResult.correctOptionIndex ? 'bg-green-50 border-green-200 border' : 
                                                j === qResult.studentOptionIndex && !qResult.isCorrect ? 'bg-red-50 border-red-200 border' : 
                                                'bg-gray-50'
                                              }`}
                                            >
                                              <span className="font-medium">{String.fromCharCode(65 + j)}:</span> {option}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    leftIcon={<Check size={16} />}
                    className="w-full mt-4"
                    disabled={scanResults.length === 0 || savingResults}
                    isLoading={savingResults}
                    onClick={saveResults}
                  >
                    Save Results
                  </Button>

                  {scanResults.length === 1 && (
                    <Button
                      rightIcon={<ArrowRight size={16} />}
                      variant="outline"
                      className="w-full mt-2"
                      disabled={savingResults}
                      onClick={() => navigate(`/students/${scanResults[0].student.id}/analytics`)}
                    >
                      View Student Analytics
                    </Button>
                  )}
                </div>
              )}

              {uploadedImages.length > 0 && scanResults.length === 0 && !processing && (
                <div className="p-3 bg-blue-50 rounded-md text-blue-700 text-sm">
                  <Info size={16} className="inline-block mr-1" />
                  Click "Scan Answer Sheets" to begin processing images with Gemini AI
                </div>
              )}

              {/* Display processing errors */}
              {processingErrors.length > 0 && (
                <div className="mt-4 border border-yellow-200 rounded-md bg-yellow-50 p-3">
                  <div className="flex items-center text-yellow-800 mb-2">
                    <AlertTriangle size={16} className="mr-2" />
                    <p className="text-sm font-medium">
                      {processingErrors.length === 1 
                        ? "1 answer sheet couldn't be processed" 
                        : `${processingErrors.length} answer sheets couldn't be processed`}
                    </p>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    {processingErrors.map((error, index) => (
                      <div key={index} className="bg-white p-2 rounded border border-yellow-100 text-xs">
                        <div className="flex justify-between">
                          <div>
                            <span className="font-medium">Image {error.imageIndex + 1}:</span>
                            {error.studentName && error.studentName !== 'Unknown' && (
                              <span className="ml-1">{error.studentName}</span>
                            )}
                            {error.rollNumber && error.rollNumber !== 'Unknown' && (
                              <span className="ml-1">(#{error.rollNumber})</span>
                            )}
                          </div>
                          <div className="text-red-600">{error.errorMessage}</div>
                        </div>
                        <div className="mt-1 text-gray-600">
                          {error.errorMessage.includes('No matching student') ? (
                            <div className="flex items-center">
                              <Info size={12} className="mr-1" />
                              <span>Tip: Check if student name or roll number matches exactly with your records</span>
                            </div>
                          ) : error.errorMessage.includes('parsing') ? (
                            <div className="flex items-center">
                              <Info size={12} className="mr-1" />
                              <span>Tip: Check image quality and ensure answer sheet is visible</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Info size={12} className="mr-1" />
                              <span>Tip: Try re-uploading a clearer image</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.values(processingStatus).some(status => 
                status === 'error' || status === 'student_not_found') && (
                <div className="p-3 bg-yellow-50 rounded-md text-yellow-700 text-sm">
                  <AlertTriangle size={16} className="inline-block mr-1" />
                  Some sheets couldn't be processed. Check for image quality or verify student information.
                </div>
              )}
              
              {/* Debug Information Panel */}
              {debugMode && mcqDetails && (
                <div className="mt-4 border border-blue-200 rounded-md bg-blue-50 p-3">
                  <div className="flex items-center text-blue-800 mb-2">
                    <Info size={16} className="mr-2" />
                    <p className="text-sm font-medium">Debug Information</p>
                  </div>
                  
                  <div className="text-xs">
                    <details>
                      <summary className="cursor-pointer text-blue-700 hover:text-blue-900">MCQ Structure Data</summary>
                      <div className="mt-2 p-2 bg-white rounded border border-blue-100">
                        <p><strong>Title:</strong> {mcqDetails.title}</p>
                        <p><strong>Questions:</strong> {mcqDetails.questions?.length || 0}</p>
                        <p className="mt-2"><strong>First 3 Questions' Correct Answers:</strong></p>
                        {mcqDetails.questions?.slice(0, 3).map((q, i) => (
                          <div key={i} className="mt-1 p-1 border-t">
                            <p>
                              <strong>Q{i+1}:</strong> {q.correct_option !== undefined ? 
                                <span className="font-medium text-green-600">
                                  {["A", "B", "C", "D"][q.correct_option]}
                                </span> : 
                                <span className="text-red-600">Unknown</span>
                              }
                              {' '}- Type: <code>{typeof q.correct_option}</code>, 
                              Raw value: <code>{q.correct_option}</code>
                            </p>
                          </div>
                        ))}
                      </div>
                    </details>
                    
                    {scanResults.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-700 hover:text-blue-900">Scoring Data</summary>
                        <div className="mt-2 p-2 bg-white rounded border border-blue-100">
                          {scanResults.map((result, idx) => (
                            <div key={idx} className="mb-3">
                              <p><strong>{result.student.name}</strong> (Roll: {result.student.roll}):</p>
                              <p>Score: {result.score}/{result.totalQuestions} ({result.percentage}%)</p>
                              <p>Answers found: {result.questionResults.length}</p>
                              
                              <table className="w-full mt-1 border-collapse border border-gray-200">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="p-1 border text-center">Q#</th>
                                    <th className="p-1 border text-center">Student</th>
                                    <th className="p-1 border text-center">Correct</th>
                                    <th className="p-1 border text-center">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {result.questionResults.map((qr: { questionNumber: number; studentAnswer: string; correctAnswer: string; isCorrect: boolean }, qIdx: number) => (
                                    <tr key={qIdx} className={qr.isCorrect ? "bg-green-50" : "bg-red-50"}>
                                      <td className="p-1 border text-center">{qr.questionNumber}</td>
                                      <td className="p-1 border text-center">{qr.studentAnswer}</td>
                                      <td className="p-1 border text-center">{qr.correctAnswer}</td>
                                      <td className="p-1 border text-center">
                                        {qr.isCorrect ? 
                                          <span className="text-green-600">✓</span> : 
                                          <span className="text-red-600">✗</span>
                                        }
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Correction Modal */}
      {editingResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Manual Correction</h2>
              <p className="text-sm text-gray-600">
                {editingResult.testTitle && editingResult.testTitle !== "Unknown Test" 
                  ? editingResult.testTitle 
                  : mcqDetails?.title || "Answer Sheet"}
                {editingResult.classInfo && ` • ${editingResult.classInfo}`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Correct any recognition errors for {editingResult.student.name}'s answer sheet
              </p>
            </div>
            
            <div className="p-4">
              <div className="mb-4 flex justify-between">
                <div>
                  <p className="font-medium">{editingResult.student.name}</p>
                  <p className="text-sm text-gray-600">Roll: {editingResult.student.roll}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-700">{editingResult.score}/{editingResult.totalQuestions}</p>
                  <p className="text-sm text-gray-600">{editingResult.percentage}%</p>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Q#</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Question</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Detected</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Correct</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editingResult.questionResults.map((qr, idx) => {
                      const currentAnswer = editedAnswers[qr.questionNumber] || qr.studentAnswer;
                      const optionChanged = currentAnswer !== qr.studentAnswer;
                      
                      // Dynamic calculation for correctness based on edited option
                      let isCorrectNow = qr.isCorrect;
                      if (optionChanged && mcqDetails) {
                        const questionData = mcqDetails.questions[qr.questionNumber - 1];
                        const correctOptionIndex = Number(questionData?.correct_option);
                        let currentOptionIndex = -1;
                        
                        if (currentAnswer === 'A') currentOptionIndex = 0;
                        else if (currentAnswer === 'B') currentOptionIndex = 1;
                        else if (currentAnswer === 'C') currentOptionIndex = 2; 
                        else if (currentAnswer === 'D') currentOptionIndex = 3;
                        
                        isCorrectNow = !isNaN(correctOptionIndex) && currentOptionIndex === correctOptionIndex;
                      }
                      
                      return (
                        <tr key={idx} className={optionChanged ? "bg-blue-50" : ""}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{qr.questionNumber}</td>
                          <td className="px-3 py-2 text-sm max-w-xs truncate">{qr.questionText}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {qr.studentAnswer ? qr.studentAnswer : <span className="text-gray-400">Not answered</span>}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <select 
                              value={currentAnswer || ""}
                              onChange={(e) => handleAnswerChange(qr.questionNumber, e.target.value)}
                              className="border rounded p-1 text-sm"
                            >
                              <option value="">None</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {currentAnswer ? (
                              isCorrectNow ? (
                                <span className="text-green-600 flex items-center">
                                  <Check size={14} className="mr-1" /> Correct
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  Incorrect (✓ {qr.correctAnswer})
                                </span>
                              )
                            ) : (
                              <span className="text-gray-400">Not answered</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={cancelManualCorrections}
              >
                Cancel
              </Button>
              <Button
                onClick={saveManualCorrections}
              >
                Save Corrections
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {finalResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Test Results Summary</h2>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {finalResults.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{result.student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{result.student.roll}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{result.score}/{result.totalQuestions}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          result.percentage >= 70 ? 'text-green-600' : 
                          result.percentage >= 40 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {result.percentage}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManualCorrection(result)}
                          >
                            Edit Answers
                          </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/students/${result.student.id}/analytics`)}
                        >
                          View Analytics
                        </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </Layout>
  );
} 