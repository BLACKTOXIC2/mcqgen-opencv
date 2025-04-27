import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, MoreVertical, BarChart2, UserRound, Hash, BookOpen, Upload, X, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { Student } from '../lib/supabase';
import { useStudents } from '../hooks/useStudents';
import { useClasses } from '../hooks/useClasses';
import { useCreateStudent, useUpdateStudent, useDeleteStudent, useBulkCreateStudents } from '../hooks/useStudentMutations';

export default function StudentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [classId, setClassId] = useState('');
  
  // AI Import states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<{columns: string[], rows: string[][]} | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  
  // React Query hooks
  const { data: students = [], isLoading: studentsLoading } = useStudents({
    classId: selectedClass
  });
  
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();
  const bulkCreateStudentsMutation = useBulkCreateStudents();
  
  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
      }
    };
    
    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openMenuId]);
  
  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    
    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      top: buttonRect.bottom + window.scrollY,
      left: buttonRect.right - 150 + window.scrollX, // Adjust 150px from right edge
    });
    setOpenMenuId(id);
  };
  
  const resetForm = () => {
    setName('');
    setRoll('');
    setClassId(classes.length > 0 ? classes[0].id : '');
    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user || !classId) return;
      
      const studentData = {
        name,
        roll,
        class_id: classId,
      };
      
      if (isEditing && editingId) {
        // Update existing student
        await updateStudentMutation.mutateAsync({
          id: editingId,
          data: studentData
        });
      } else {
        // Create new student
        await createStudentMutation.mutateAsync(studentData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };
  
  const handleEdit = (student: Student) => {
    setName(student.name);
    setRoll(student.roll);
    setClassId(student.class_id);
    setIsEditing(true);
    setEditingId(student.id);
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await deleteStudentMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };
  
  const handleViewAnalytics = (studentId: string) => {
    navigate(`/students/${studentId}/analytics`);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const content = event.target.result as string;
        setCsvContent(content);
        setIsImportModalOpen(true);
        
        // Try to parse locally first for preview
        const previewResults = parseCSVLocally(content);
        if (previewResults && previewResults.length > 0) {
          setPreviewData(preparePreviewData(previewResults));
        }
      }
    };
    reader.readAsText(file);
    
    // Reset the file input for future uploads
    if (e.target) {
      e.target.value = '';
    }
  };
  
  const processCSVWithGemini = async (csvContent: string) => {
    try {
      // First try with the local CSV parser as a fallback
      try {
        return parseCSVLocally(csvContent);
      } catch (localError) {
        console.log("Local parsing failed, trying Gemini API", localError);
      }
      
      // This is where you'd integrate with Google Gemini API
      const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
      
      // Check if API key is available
      if (!API_KEY) {
        throw new Error("Gemini API key not configured. Using local CSV parser instead.");
      }
      
      const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
      
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Process this CSV data of students and extract name, roll number, and potential class. Format your response as a JSON array of objects with name, roll, and class_name properties.
                  
                  CSV Content:
                  ${csvContent}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 8192,
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Extract the JSON from the text response
      // This assumes Gemini returns a properly formatted JSON structure or text that contains JSON
      let jsonStr = '';
      if (result.candidates && result.candidates[0] && result.candidates[0].content) {
        const textParts = result.candidates[0].content.parts.filter((part: any) => part.text);
        jsonStr = textParts.map((part: any) => part.text).join('');
      }
      
      // Try to extract the JSON array from the text
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error processing CSV with Gemini:", error);
      
      // As a final fallback, try to parse the CSV locally
      try {
        return parseCSVLocally(csvContent);
      } catch (fallbackError) {
        console.error("Fallback parsing also failed:", fallbackError);
        throw new Error("Failed to process CSV. Please check your file format.");
      }
    }
  };
  
  // Improve the parseCSVLocally function for better class detection
  const parseCSVLocally = (csvContent: string) => {
    // Split the CSV into lines
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error("CSV file must contain at least a header row and one data row");
    }
    
    // Extract headers (first row)
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    // Find the indices of name, roll and class columns - be more flexible with column names
    const nameIndex = headers.findIndex(h => 
      h.includes('name') || h === 'student' || h === 'student name' || h === 'studentname');
    
    const rollIndex = headers.findIndex(h => 
      h.includes('roll') || h === 'id' || h === 'number' || h === 'roll number' || 
      h === 'rollnumber' || h === 'enrollment' || h === 'enrollment number');
    
    const classIndex = headers.findIndex(h => 
      h.includes('class') || h === 'grade' || h === 'section' || h === 'standard' || 
      h === 'classroom' || h === 'batch' || h === 'division');
    
    if (nameIndex === -1 || rollIndex === -1) {
      throw new Error("CSV must contain columns for student name and roll number");
    }
    
    // Process data rows
    const students = [];
    
    for (let i = 1; i < lines.length; i++) {
      // Handle quoted values correctly (like "Class 6, Advanced")
      let values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;
      
      // Split by commas, but respect quotes
      for (let char of lines[i]) {
        if (char === '"' && insideQuotes) {
          insideQuotes = false;
        } else if (char === '"' && !insideQuotes) {
          insideQuotes = true;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim()); // Add the last value
      
      // Skip empty rows
      if (values.length < Math.max(nameIndex, rollIndex) + 1) {
        continue;
      }
      
      const student = {
        name: values[nameIndex],
        roll: values[rollIndex],
        class_name: classIndex !== -1 ? values[classIndex] : '',
        matched_class_id: '', // Will be populated in the preview step
        matched_class_name: '' // For display purposes
      };
      
      // Only add students with valid name and roll
      if (student.name && student.roll) {
        students.push(student);
      }
    }
    
    if (students.length === 0) {
      throw new Error("No valid student data found in the CSV");
    }
    
    return students;
  };
  
  // Add a smart class matcher function
  const findBestClassMatch = (className: string) => {
    if (!className || !classes.length) return null;
    
    // First try exact match
    let match = classes.find(c => 
      c.name.toLowerCase() === className.toLowerCase() ||
      `${c.name} ${c.section}`.toLowerCase() === className.toLowerCase() ||
      `${c.name} - Section ${c.section}`.toLowerCase() === className.toLowerCase()
    );
    
    if (match) return match;
    
    // Try to match just the class number/grade
    const classNumberMatch = className.match(/\b(class|grade)?\s*(\d+|[ivxlcdm]+)\b/i);
    if (classNumberMatch) {
      const classNumber = classNumberMatch[2];
      match = classes.find(c => 
        c.name.toLowerCase().includes(classNumber.toLowerCase()) ||
        c.name.match(new RegExp(`\\b${classNumber}\\b`, 'i'))
      );
      
      if (match) return match;
    }
    
    // Try to find section
    const sectionMatch = className.match(/\b(section|sec)\s*([a-z])\b/i);
    if (sectionMatch) {
      const section = sectionMatch[2];
      match = classes.find(c => 
        c.section.toLowerCase() === section.toLowerCase()
      );
      
      if (match) return match;
    }
    
    // Try partial matching by splitting and finding the most overlapping words
    const classWords = className.toLowerCase().split(/\s+/);
    let bestMatch = null;
    let highestScore = 0;
    
    for (const c of classes) {
      const fullClassString = `${c.name} ${c.section}`.toLowerCase();
      const words = fullClassString.split(/\s+/);
      
      let score = 0;
      for (const word of classWords) {
        if (word.length < 2) continue; // Skip very short words
        
        if (words.includes(word) || fullClassString.includes(word)) {
          score += 1;
        }
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = c;
      }
    }
    
    return highestScore > 0 ? bestMatch : null;
  };
  
  // Create a function to prepare preview data
  const preparePreviewData = (parsedData: any[]): { columns: string[], rows: string[][] } => {
    const columns = ['Name', 'Roll', 'Class', 'Matching Class'];
    
    // Create rows from the parsed data
    const rows = parsedData.map(item => {
      const originalClass = item.class || item.class_name || '';
      const bestMatch = findBestClassMatch(originalClass);
      
      return [
        item.name || '',
        item.roll || item.roll_number || '',
        originalClass,
        bestMatch ? `${bestMatch.name} - Section ${bestMatch.section}` : 'No match'
      ];
    });
    
    return { columns, rows };
  };
  
  const handleImportCSV = async () => {
    try {
      setIsProcessingCsv(true);
      setImportErrors([]);
      
      if (!user || !csvContent) {
        setImportErrors(['No CSV content or user not authenticated']);
        return;
      }
      
      // Process locally or with AI based on complexity
      let processedData: any[] = [];
      
      try {
        processedData = await processCSVWithGemini(csvContent);
      } catch (error) {
        console.error('Error processing with AI, falling back to local parser:', error);
        try {
          const locallyParsed = parseCSVLocally(csvContent);
          if (locallyParsed && locallyParsed.length > 0) {
            processedData = locallyParsed;
          } else {
            throw new Error('Failed to parse CSV data');
          }
        } catch (parseError) {
          throw new Error(`CSV parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
      }
      
      if (processedData.length === 0) {
        setImportErrors(['No valid data found in CSV']);
        return;
      }
      
      // Map the results to the database structure
      const studentsToInsert = processedData.map(item => {
        // Find the best matching class
        let classMatch = null;
        
        if (item.class_name || item.class) {
          const className = item.class_name || item.class || '';
          classMatch = findBestClassMatch(className);
        }
        
        if (!classMatch && classes.length > 0) {
          // Default to first class if no match found and classes exist
          classMatch = classes[0];
        }
        
        if (!classMatch) {
          throw new Error('No matching class found and no default class available');
        }
        
        return {
          name: item.name || 'Unknown',
          roll: item.roll || item.roll_number || String(Math.floor(Math.random() * 10000)),
          class_id: classMatch.id,
        };
      });
      
      // Save students to database
      const result = await bulkCreateStudentsMutation.mutateAsync(studentsToInsert);
      
      // Update UI with success
      setParsedStudents(studentsToInsert);
      
      // Show success message before closing
      setTimeout(() => {
        // Close the modal and reset states
        setIsImportModalOpen(false);
        setCsvContent(null);
        setParsedStudents([]);
        setPreviewData(null);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error during import:', error);
      setImportErrors([
        `Import failed: ${error.message || 'Unknown error'}`
      ]);
    } finally {
      setIsProcessingCsv(false);
    }
  };
  
  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setCsvContent(null);
    setParsedStudents([]);
    setPreviewData(null);
    setImportErrors([]);
  };
  
  // Loading state from React Query
  const loading = studentsLoading || classesLoading;

  // Add the renderImportModal function
  const renderImportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Upload size={20} className="text-primary-500 mr-2" />
            {isProcessingCsv ? "Processing Import" : "Import Students with AI"}
          </h3>
          <button 
            onClick={closeImportModal}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {importErrors.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-primary-50 p-5 rounded-lg border border-primary-100 flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <svg className="h-6 w-6 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-primary-800 font-medium">Import Status</h4>
                  <div className="mt-2 text-primary-700 text-sm">
                    {parsedStudents.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                          <div className="text-2xl font-bold text-primary-600">{parsedStudents.length}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Processed</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                          <div className="text-2xl font-bold text-green-600">{parsedStudents.length}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Added</div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-yellow-600">Import was not successful. Please check the errors below.</p>
                    )}
                  </div>
                </div>
              </div>
              
              {importErrors.map((error, index) => (
                <div key={index} className="rounded-lg border border-yellow-200 overflow-hidden">
                  <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
                    <h4 className="font-medium text-yellow-800 flex items-center">
                      <svg className="h-5 w-5 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.485 2.495c.873-1.756 3.157-1.756 4.03 0l5.598 11.985c.812 1.755-.476 3.52-2.015 3.52H2.902c-1.539 0-2.827-1.765-2.015-3.52L6.485 2.495zm1.015 7.5a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </h4>
                  </div>
                </div>
              ))}
              
              <div className="flex gap-3 mt-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={closeImportModal}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : previewData ? (
            <div>
              <div className="space-y-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Successfully parsed {previewData.rows.length} students from the CSV
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {previewData.columns.map((col, idx) => (
                        <th key={idx} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.rows.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {previewData.rows.length > 5 && (
                      <tr>
                        <td colSpan={previewData.columns.length} className="px-6 py-2 whitespace-nowrap text-sm text-gray-400 italic text-center">
                          + {previewData.rows.length - 5} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="w-1/2"
                  onClick={closeImportModal}
                >
                  Cancel
                </Button>
                <Button 
                  className="w-1/2"
                  onClick={handleImportCSV}
                  disabled={isProcessingCsv}
                >
                  {isProcessingCsv ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Import Students'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 bg-primary-50 p-4 rounded-full">
                <Upload size={32} className="text-primary-500" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload your student data</h4>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                Our AI will intelligently process your CSV file and match students to the appropriate classes.
              </p>
              
              <div className="w-full max-w-md">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    Select CSV File
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    CSV file with student name, roll number, and class
                  </p>
                </div>
                
                <div className="mt-4 border rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <p className="text-xs font-medium text-gray-500">SAMPLE FORMAT</p>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-gray-100 p-2 rounded mb-2">
                      <div>Name</div>
                      <div>Roll</div>
                      <div>Class</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <div>John Doe</div>
                      <div>101</div>
                      <div>Grade 7</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 border-t flex justify-between items-center">
                    <div className="text-xs font-mono text-gray-500">sample-students.csv</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => {
                        const sampleData = 'Name,Roll,Class\nJohn Doe,101,Grade 7\nJane Smith,102,Grade 7';
                        const blob = new Blob([sampleData], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'sample-students.csv';
                        document.body.appendChild(a);
                        a.click();
                        URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      }}
                    >
                      Download Sample
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="Students">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Students</h1>
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Manage your students and assign them to classes
          </p>
          {!isAdding && (
            <div className="flex gap-3">
              <Button
                leftIcon={<Upload size={16} />}
                onClick={() => setIsImportModalOpen(true)}
                size="md"
                variant="outline"
                className="transition-all hover:scale-105"
              >
                Import with AI
              </Button>
              <Button
                leftIcon={<Plus size={16} />}
                onClick={() => setIsAdding(true)}
                size="md"
                className="transition-all hover:scale-105"
              >
                Add Student
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Import Modal */}
      {isImportModalOpen && renderImportModal()}
      
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <Card className="border-2 border-primary-100">
              <CardHeader className="bg-primary-50">
                <h3 className="text-xl font-semibold text-primary-700">
                  {isEditing ? 'Edit Student Details' : 'Add New Student'}
                </h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <Input
                        label="Student Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        required
                        icon={<UserRound size={18} className="text-gray-500" />}
                      />
                      <p className="text-xs text-gray-500 pl-1">Full name of the student</p>
                    </div>
                    <div className="space-y-1">
                      <Input
                        label="Roll Number"
                        value={roll}
                        onChange={(e) => setRoll(e.target.value)}
                        placeholder="e.g. 101"
                        required
                        icon={<Hash size={18} className="text-gray-500" />}
                      />
                      <p className="text-xs text-gray-500 pl-1">Unique identifier for the student</p>
                    </div>
                    <div className="space-y-1">
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
                      <p className="text-xs text-gray-500 pl-1">The class the student belongs to</p>
                    </div>
                  </div>
                  {classes.length === 0 && (
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                      <div className="flex items-start">
                        <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.485 2.495c.873-1.756 3.157-1.756 4.03 0l5.598 11.985c.812 1.755-.476 3.52-2.015 3.52H2.902c-1.539 0-2.827-1.765-2.015-3.52L6.485 2.495zm1.015 7.5a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-yellow-700">Please add a class before adding students.</p>
                          <p className="text-xs text-yellow-600 mt-1">Students must be assigned to an existing class.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <CardFooter className="px-0 py-0 bg-transparent border-none flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={classes.length === 0}
                      rightIcon={isEditing ? <Pencil size={16} /> : <Plus size={16} />}
                    >
                      {isEditing ? 'Update Student' : 'Create Student'}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Class Filter */}
      <div className="mb-6">
        <div className="flex items-center">
          <Filter size={16} className="mr-2 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Filter by Class</h3>
        </div>
        <div className="mt-2">
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={[
              { value: '', label: 'All Classes' },
              ...classes.map(c => ({ value: c.id, label: `${c.name} - Section ${c.section}` }))
            ]}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="text-primary-600 font-medium">Loading your students...</p>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          >
            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll Number
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <motion.tr 
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { delay: index * 0.05 }
                        }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserRound size={18} className="text-primary-500 mr-2" />
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Hash size={18} className="text-gray-400 mr-2" />
                            <div className="text-sm text-gray-700">{student.roll}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BookOpen size={18} className="text-gray-400 mr-2" />
                            <div className="text-sm text-gray-700">
                              {(student as any).classes ? 
                                `${(student as any).classes.name} - Section ${(student as any).classes.section}` : 
                                'Unknown class'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="action-menu-container inline-block relative">
                            <button
                              onClick={(e) => toggleMenu(student.id, e)}
                              className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                              aria-label="Menu"
                              aria-haspopup="true"
                              aria-expanded={openMenuId === student.id}
                            >
                              <MoreVertical size={18} className="text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 px-6 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <UserRound size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students added yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {classes.length > 0 
                    ? 'Add your students to assign them to classes and start tracking their progress' 
                    : 'You need to create a class before you can add students'}
                </p>
                {!isAdding && (
                  <Button
                    leftIcon={<Plus size={16} />}
                    onClick={() => setIsAdding(true)}
                    disabled={classes.length === 0}
                    size="lg"
                    className="transition-all hover:scale-105"
                  >
                    {classes.length > 0 ? 'Add Your First Student' : 'Please Add a Class First'}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
      
      {/* Fixed position dropdown that's positioned based on the button */}
      <AnimatePresence>
        {openMenuId && (
          <motion.div 
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200 w-48"
            style={{ 
              top: `${menuPosition.top}px`, 
              left: `${menuPosition.left}px`
            }}
            role="menu"
            aria-orientation="vertical"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const student = students.find(s => s.id === openMenuId);
                if (student) {
                  handleViewAnalytics(student.id);
                }
              }}
              className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
              role="menuitem"
              autoFocus
            >
              <BarChart2 size={16} className="mr-3 text-primary-500" />
              View Analytics
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const student = students.find(s => s.id === openMenuId);
                if (student) {
                  handleEdit(student);
                }
                setOpenMenuId(null);
              }}
              className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
              role="menuitem"
            >
              <Pencil size={16} className="mr-3 text-blue-500" />
              Edit Student
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (openMenuId) {
                  handleDelete(openMenuId);
                }
                setOpenMenuId(null);
              }}
              className="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
              role="menuitem"
            >
              <Trash2 size={16} className="mr-3" />
              Delete Student
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}