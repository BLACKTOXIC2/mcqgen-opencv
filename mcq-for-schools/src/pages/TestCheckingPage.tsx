import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileUp, Scan, Info, Check, AlertTriangle, Plus, Trash2, ArrowRight, Camera, RefreshCcw, X, Save, RotateCcw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Mcq, Student } from '../lib/supabase';
import { Badge } from '../components/ui/Badge';

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

// Camera modal component
const CameraModal = ({
  isOpen,
  onClose,
  onImageCaptured,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImageCaptured: (imageDataUrl: string) => void;
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captureCount, setCaptureCount] = useState<number>(0);
  const [captureQuality, setCaptureQuality] = useState<number>(0.92);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [deviceOrientation, setDeviceOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      // Detect device orientation
      const updateOrientation = () => {
        if (window.innerHeight > window.innerWidth) {
          setDeviceOrientation('portrait');
        } else {
          setDeviceOrientation('landscape');
        }
      };
      
      // Initial check
      updateOrientation();
      
      // Add event listener for orientation changes
      window.addEventListener('resize', updateOrientation);
      
      startCamera();
      
      return () => {
        window.removeEventListener('resize', updateOrientation);
        stopCamera();
      };
    }
  }, [isOpen]);
  
  // Restart camera when facing mode changes
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
  }, [facingMode, isOpen, capturedImage]);
  
  const startCamera = async () => {
    try {
      setError(null);
      
      if (stream) {
        // Stop any existing stream
        stopCamera();
      }
      
      // Check if the device has multiple cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      // Set constraints based on device and desired orientation
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Apply styles based on orientation when video metadata is loaded
        videoRef.current.onloadedmetadata = () => {
          adjustVideoOrientation();
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access the camera. Please check permissions and try again.');
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  
  const adjustVideoOrientation = () => {
    if (!videoRef.current) return;
    
    // Check video dimensions to determine its natural orientation
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const isVideoPortrait = videoHeight > videoWidth;
    
    // Check device orientation
    const isDevicePortrait = window.innerHeight > window.innerWidth;
    
    // Set orientation based on both video and device orientation
    // For mobile devices, prioritize device orientation
    if (isDevicePortrait) {
      setOrientation('portrait');
    } else {
      setOrientation('landscape');
    }
  };
  
  const toggleOrientation = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };
  
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Get video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    // Match canvas to video aspect ratio
    if (orientation === 'portrait') {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    } else {
      // For landscape, maintain aspect ratio but possibly swap dimensions
      if (videoWidth > videoHeight) {
        // Video is naturally landscape
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      } else {
        // Video is portrait but we're in landscape mode
        canvas.width = videoHeight;
        canvas.height = videoWidth;
      }
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (orientation === 'portrait') {
      // Draw video directly for portrait mode
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } else {
      if (videoWidth > videoHeight) {
        // Naturally landscape video
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else {
        // Portrait video in landscape mode - rotate
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 2); // 90 degrees
        ctx.drawImage(video, -videoWidth / 2, -videoHeight / 2, videoWidth, videoHeight);
        ctx.restore();
      }
    }
    
    // Apply image processing to enhance readability if needed
    
    const imageSrc = canvas.toDataURL('image/jpeg', captureQuality);
    setCapturedImage(imageSrc);
    setCaptureCount(prev => prev + 1);
  };
  
  const confirmCapture = () => {
    if (capturedImage) {
      onImageCaptured(capturedImage);
      closeModal(); // Close modal after confirming the image
    }
  };
  
  const retakePhoto = () => {
    setCapturedImage(null);
  };
  
  const closeModal = () => {
    stopCamera();
    onClose();
  };
  
  // Switch camera facing mode
  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };
  
  // Calculate container styles based on orientation
  const containerClasses = `
    relative overflow-hidden border-4 border-purple-500 rounded-lg
    ${orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'}
    max-h-[75vh] w-full max-w-full
  `;

  // Mobile responsive styles
  const modalContainerClasses = `
    fixed inset-0 z-50 flex items-center justify-center 
    bg-black bg-opacity-75 p-2 sm:p-4 
    overflow-y-auto
  `;

  const modalContentClasses = `
    relative w-full max-w-lg mx-auto 
    bg-white rounded-lg shadow-xl overflow-hidden
    flex flex-col
  `;
  
  return (
    <>
      {isOpen && (
        <div className={modalContainerClasses}>
          <div className={modalContentClasses}>
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 z-10"
            >
              <X size={20} />
            </button>
            <h2 className="mb-2 mt-3 text-xl font-bold text-center text-purple-800">Capture Image</h2>
            
            <div className="relative px-2 pb-4 sm:px-4 flex-grow">
              {/* Camera view with purple border */}
              <div className={containerClasses}>
                {!capturedImage ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`object-cover w-full h-full ${orientation === 'landscape' ? 'transform' : ''}`}
                    />
                    <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-300"></div>
                    
                    {/* Loading indicator */}
                    {!stream && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </>
                ) : (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="object-contain w-full h-full"
                  />
                )}
                
                {/* Error message */}
                {error && (
                  <div className="absolute inset-x-0 bottom-0 bg-red-500 text-white p-2 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Canvas for capturing (hidden) */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera UI controls */}
              <div className="flex items-center justify-center mt-4 space-x-4">
                {!capturedImage ? (
                  <>
                    {stream && (
                      <button
                        onClick={takePhoto}
                        className="flex items-center justify-center w-16 h-16 text-white bg-purple-600 rounded-full hover:bg-purple-700 shadow-lg"
                        title="Take photo"
                      >
                        <Camera size={32} />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex justify-center w-full space-x-4">
                    <button
                      onClick={retakePhoto}
                      className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center text-gray-700"
                    >
                      <RefreshCcw size={20} className="mr-2" />
                      Retake
                    </button>
                    <button
                      onClick={confirmCapture}
                      className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center justify-center text-white"
                    >
                      <Check size={20} className="mr-2" />
                      Confirm
                    </button>
                  </div>
                )}
              </div>

              {/* Camera options */}
              {!capturedImage && stream && (
                <div className="absolute bottom-4 right-4 space-y-2 flex flex-col items-end">
                  <button
                    onClick={switchCamera}
                    className="p-3 text-white bg-purple-600 rounded-full hover:bg-purple-700 shadow-md"
                    title="Switch camera"
                  >
                    <RefreshCcw size={20} />
                  </button>
                  <button
                    onClick={toggleOrientation}
                    className="p-3 text-white bg-purple-600 rounded-full hover:bg-purple-700 shadow-md"
                    title="Toggle orientation"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>
              )}

              {!stream && !capturedImage && (
                <div className="flex flex-col items-center justify-center w-full p-8">
                  <p className="mb-4 text-gray-600">Camera access required to scan tests</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
                  >
                    <Camera size={20} className="mr-1 inline" />
                    Start Camera
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ScanProcessingSection = ({
  processingStatus,
  processingResults,
  processingErrors,
  onScanAgain,
  onSave
}: {
  processingStatus: 'idle' | 'processing' | 'success' | 'error' | 'student-not-found';
  processingResults: Array<OcrProcessingSuccessResult>;
  processingErrors: Array<ScanResultFailure>;
  onScanAgain: () => void;
  onSave: () => void;
}) => {
  const [showDebug, setShowDebug] = useState(false);
  const debugRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of debug when new errors are added
  useEffect(() => {
    if (showDebug && debugRef.current) {
      debugRef.current.scrollTop = debugRef.current.scrollHeight;
    }
  }, [processingErrors, showDebug]);

  // Function to get human-readable status text and color
  const getStatusInfo = () => {
    switch (processingStatus) {
      case 'processing':
        return { 
          text: 'Processing images...', 
          color: 'text-yellow-700 bg-yellow-50 border-yellow-200' 
        };
      case 'success':
        return { 
          text: 'Processing complete!', 
          color: 'text-green-700 bg-green-50 border-green-200' 
        };
      case 'student-not-found':
        return { 
          text: 'Student ID not recognized', 
          color: 'text-orange-700 bg-orange-50 border-orange-200' 
        };
      case 'error':
        return { 
          text: 'Failed to process some images', 
          color: 'text-red-700 bg-red-50 border-red-200' 
        };
      default:
        return { 
          text: 'Ready to scan', 
          color: 'text-gray-700 bg-gray-50 border-gray-200' 
        };
    }
  };

  const { text, color } = getStatusInfo();
  const hasResults = processingResults.length > 0;
  const hasErrors = processingErrors.length > 0;

  return (
    <div className="mt-6 space-y-4">
      {/* Status indicator */}
      <div className={`p-3 rounded-md border ${color} text-sm flex items-center space-x-2`}>
        {processingStatus === 'processing' ? (
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
        ) : processingStatus === 'success' ? (
          <Check size={16} className="mr-2" />
        ) : processingStatus === 'error' || processingStatus === 'student-not-found' ? (
          <AlertTriangle size={16} className="mr-2" />
        ) : null}
        <span>{text}</span>
      </div>
      
      {/* Results display section */}
      {hasResults && (
        <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium text-purple-800">Scan Results</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {processingResults.map((result, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">
                      Student: {result.studentName || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {result.studentId || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Score: <span className="font-medium text-purple-700">{result.score} / {result.totalQuestions}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Answers:</div>
                    <div className="mt-1 flex flex-wrap gap-1 justify-end max-w-[200px]">
                      {Object.entries(result.answers).map(([qNum, answer]) => (
                        <span 
                          key={qNum} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                          title={`Question ${qNum}: ${answer}`}
                        >
                          {qNum}:{answer}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {processingStatus === 'success' && (
            <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={onScanAgain}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-gray-700 flex items-center"
              >
                <Scan size={16} className="mr-1" />
                Scan Another
              </button>
              <button
                onClick={onSave}
                className="px-3 py-1.5 text-sm border border-transparent rounded-md shadow-sm bg-purple-600 hover:bg-purple-700 text-white flex items-center"
              >
                <Save size={16} className="mr-1" />
                Save Results
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Error display */}
      {hasErrors && (
        <div className="bg-white border border-red-200 rounded-md shadow-sm overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex justify-between items-center">
            <h3 className="font-medium text-red-800 flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              Failed to Process {processingErrors.length} Image{processingErrors.length !== 1 ? 's' : ''}
            </h3>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs px-2 py-1 rounded border border-red-300 bg-white text-red-700 hover:bg-red-50"
            >
              {showDebug ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showDebug && (
            <div 
              ref={debugRef}
              className="p-4 max-h-[300px] overflow-y-auto bg-gray-900 text-gray-200 font-mono text-xs"
            >
              {processingErrors.map((error, index) => (
                <div key={index} className="mb-3 border-b border-gray-700 pb-3 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <span className="text-red-400">Error ({new Date(error.timestamp).toLocaleTimeString()})</span>
                    <span className="text-gray-400 text-xs">{error.code}</span>
                  </div>
                  <div className="mt-1 text-gray-300 whitespace-pre-wrap">{error.message}</div>
                  {error.details && (
                    <div className="mt-2 text-gray-400 text-xs">{error.details}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3 border-t border-gray-200">
            <button
              onClick={onScanAgain}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-gray-700 flex items-center"
            >
              <RefreshCcw size={16} className="mr-1" />
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {/* Actions when idle */}
      {processingStatus === 'idle' && !hasResults && !hasErrors && (
        <div className="text-center p-6 bg-white border border-dashed border-gray-300 rounded-md">
          <div className="text-gray-400 mb-3">
            <Scan size={32} className="mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">Ready to scan answer sheets</p>
          <button
            onClick={onScanAgain}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-sm flex items-center mx-auto"
          >
            <Camera size={16} className="mr-2" />
            Start Scanning
          </button>
        </div>
      )}
    </div>
  );
};

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
  
  // Camera functionality
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    fetchMcqs();
  }, [user]);

  useEffect(() => {
    if (selectedMcq) {
      fetchMcqDetails();
      fetchStudents();
    }
  }, [selectedMcq]);
  
  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

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
  
  // Camera functionality
  const openCamera = () => {
    if (!selectedMcq) {
      alert('Please select an MCQ test first');
      return;
    }
    
    // Simply open the camera modal
    setIsCameraOpen(true);
  };
  
  const closeCamera = () => {
    setIsCameraOpen(false);
  };
  
  const handleImageCaptured = (imageDataUrl: string) => {
    if (imageDataUrl) {
      try {
        // Convert data URL to file
        fetch(imageDataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `captured-${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            // Add to uploaded images
            setUploadedImages(prev => [...prev, file]);
            setImageUrls(prev => [...prev, imageDataUrl]);
          })
          .catch(error => {
            console.error('Error converting captured image:', error);
          });
      } catch (error) {
        console.error('Error processing captured photo:', error);
      }
    }
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Scanning & Grading</h1>
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
        
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-md">
          <h3 className="text-purple-800 font-medium">ℹ️ Integration Information</h3>
          <p className="text-sm text-purple-700 mt-1">
            This application is now connected to the OpenCV OMR processing system. Images are sent directly 
            to the OpenCV API running at {import.meta.env.VITE_OPENCV_API_URL || 'https://api.mcqgen.xyz'}.
            Make sure the OpenCV server is running before scanning answer sheets.
          </p>
          <p className="text-sm text-purple-700 mt-2">
            <strong>Note:</strong> You may need to adjust CORS settings on the OpenCV server if you encounter connection issues.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Select MCQ */}
        <Card className={`h-full ${selectedMcq ? 'border-purple-100' : ''}`}>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <h2 className="font-medium flex items-center text-purple-700">
              <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">1</span>
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
              <div className="mt-4 p-3 bg-purple-50 rounded-md border border-purple-100">
                <h3 className="font-medium text-sm text-purple-800">{mcqDetails.title}</h3>
                <p className="text-xs text-purple-600">{mcqDetails.questions.length} questions</p>
                {students.length > 0 && (
                  <p className="text-xs text-purple-600 mt-1">{students.length} students in class</p>
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
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="debug-mode" className="ml-2 text-sm text-gray-600">
                Enable Debug Mode
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Upload Answer Sheets */}
        <Card className={`h-full ${uploadedImages.length > 0 ? 'border-purple-100' : ''}`}>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <h2 className="font-medium flex items-center text-purple-700">
              <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">2</span>
              Upload Answer Sheets
            </h2>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 border-2 border-dashed border-purple-200 rounded-md hover:border-purple-300 transition-colors">
              <FileUp className="mx-auto h-8 w-8 text-purple-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">Upload scanned answer sheets</p>
              
              <div className="flex justify-center gap-3 mt-4">
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
                  <div className={`flex items-center justify-center px-4 py-2 rounded-md ${!selectedMcq || processing ? 'bg-gray-200 text-gray-500' : 'bg-purple-600 text-white hover:bg-purple-700'} transition-colors`}>
                    <Plus size={16} className="mr-2" />
                    Add Images
                  </div>
                </label>
                
                <button
                  onClick={openCamera}
                  disabled={!selectedMcq || processing}
                  className={`flex items-center justify-center px-4 py-2 rounded-md ${!selectedMcq || processing ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'} transition-colors`}
                >
                  <Camera size={16} className="mr-2" />
                  Use Camera
                </button>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2 text-purple-700">Uploaded Images ({uploadedImages.length})</p>
                <div className="grid grid-cols-2 gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative rounded-md overflow-hidden border border-purple-200 group hover:shadow-md transition-all">
                      <div className="relative">
                        <img 
                          src={url} 
                          alt={`Uploaded ${index + 1}`} 
                          className="w-full h-32 object-contain" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik01LjUgMjMgNSA1IDQuNSA5LjVIMlYxaC4yNWMxLjM3NCAwIDIuNzUuMjAzIDQuMDk5LjYwNCAxLjQ0NS40OTYgMi42OTkgMS4yNDMgMy43NSAyLjIyN2EzLjM5OSAzLjM5OSAwIDAgMCAuNDY0LjM5NEMxMS41NjMgNS4wNjggMTIuNCAzLjk4MyAxNC4xIDMuMDg2IDE1LjQ1IDIuMzQ3IDE2Ljk1IDIgMTguNSAySDIwdjhoLTJ2LTZoLS4yNWMtMS4wMjEgMC0yLjAyNy4yNDMtMi45NzguNzExLTEuMDQxLjUxMy0xLjEzNC0yLjI5NyAxLjg0NEMxMS45MyA3LjQxOCAxMS41MjkgOC40MjMgMTAuOTc4IDkuMzA4IDEwLjM2NyAxMC4yOTggOS42MyAxMSA4LjUgMTFoLTJ2OC42ODRDNi4zNDQgMTkuODkxIDYgMjAuMzQyIDYgMjAuODV2LjE1SDVjLS4xMSAwLS4yLTEuMDItLjUtMnoiIGZpbGw9IiNkZGQiLz48L3N2Zz4=';
                            target.classList.add('p-4');
                          }}
                        />
                        <div className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-20 transition-all"></div>
                      </div>
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 opacity-80 hover:opacity-100"
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
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <h2 className="font-medium flex items-center text-purple-700">
              <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">3</span>
              Process and Save
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                leftIcon={<Scan size={16} />}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!selectedMcq || uploadedImages.length === 0 || processing}
                isLoading={processing}
                onClick={scanAnswerSheets}
              >
                Scan Answer Sheets
              </Button>

              <div className="p-3 bg-yellow-50 rounded-md text-yellow-700 text-sm border border-yellow-200">
                OCR functionality has been integrated. Use high quality images for best results.
              </div>

              {scanResults.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2 text-purple-700">Results:</p>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {scanResults.map((result, index) => (
                      <div key={index} className="p-3 bg-purple-50 rounded-md border border-purple-100 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{result.student.name}</p>
                              
                              {/* Add student selection dropdown */}
                              <Select
                                value={result.student.id}
                                onChange={(e) => reassignStudent(index, e.target.value)}
                                className="ml-2 text-xs py-1 px-1 h-7 min-h-0 border-purple-200"
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
                            <p className="font-bold text-purple-700">{result.score}/{result.totalQuestions}</p>
                            <p className="text-xs text-gray-600">{result.percentage}%</p>
                          </div>
                        </div>
                        
                        {/* Answer comparison */}
                        <div className="mt-2 border-t border-purple-100 pt-2">
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadedImages.length > 0 && scanResults.length === 0 && !processing && (
                <div className="p-3 bg-purple-50 rounded-md text-purple-700 text-sm border border-purple-100">
                  <Info size={16} className="inline-block mr-1" />
                  Click "Scan Answer Sheets" to process the uploaded images
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Camera Interface Modal */}
      {isCameraOpen && (
        <CameraModal
          isOpen={isCameraOpen}
          onClose={closeCamera}
          onImageCaptured={handleImageCaptured}
        />
      )}
      
      {/* Scan Failures Section */}
      {scanResults.length > 0 && processingErrors.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-yellow-800 font-medium flex items-center">
            <AlertTriangle size={16} className="mr-2" />
            Some answer sheets couldn't be processed
          </h3>
          
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {processingErrors.map((failure, index) => (
              <div key={index} className="p-3 bg-white rounded border border-yellow-200 text-sm">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-yellow-800">Image {index + 1}</p>
                    {failure.studentName && (
                      <p className="text-xs text-gray-600">Student: {failure.studentName}</p>
                    )}
                    {failure.rollNumber && (
                      <p className="text-xs text-gray-600">Roll Number: {failure.rollNumber}</p>
                    )}
                  </div>
                  <div>
                    <Badge color="yellow">
                      {failure.errorMessage}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Save Results Button */}
      {scanResults.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button
            leftIcon={<Save size={16} />}
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={saveResults}
            isLoading={savingResults}
            disabled={savingResults}
          >
            Save Results
          </Button>
        </div>
      )}
      
      {/* Debug Output */}
      {debugMode && processingErrors.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-gray-800 font-medium">Debug Output</h3>
            <button 
              onClick={() => setProcessingErrors([])}
              className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-gray-900 text-green-400 p-3 rounded-md overflow-x-auto font-mono text-xs">
            <pre className="whitespace-pre-wrap">
              {processingErrors.map((error, i) => (
                <div key={i} className="pb-1">
                  <span className="text-gray-500">[{new Date(error.timestamp).toLocaleTimeString()}]</span> {error.errorMessage}
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </Layout>
  );
} 