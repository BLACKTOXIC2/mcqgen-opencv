import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Eye, Trash2, Filter, Edit, MoreVertical, Copy, FileText, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Mcq, Class } from '../lib/supabase';
import AiMcqGeneratorModal from '../components/mcq/AiMcqGeneratorModal';
import { useMcqs } from '../hooks/useMcqs';
import { useClasses } from '../hooks/useClasses';
import { useDeleteMcq, useDuplicateMcq } from '../hooks/useMcqMutations';

export default function McqsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showTestPreview, setShowTestPreview] = useState(false);
  const [testPreviewData, setTestPreviewData] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  
  // Using React Query hooks
  const { data: mcqs = [], isLoading: mcqsLoading, refetch: refetchMcqs } = useMcqs({
    classId: selectedClass,
    searchTerm
  });
  
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  
  const deleteMcqMutation = useDeleteMcq();
  const duplicateMcqMutation = useDuplicateMcq();
  
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
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this MCQ?')) return;
    
    try {
      await deleteMcqMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting MCQ:', error);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchMcqs();
  };
  
  const handleClassFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedClass(value);
  };
  
  const handleClearFilters = () => {
    setSelectedClass('');
    setSearchTerm('');
  };
  
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
  
  const handleViewMcq = (id: string) => {
    console.log("View clicked for MCQ ID:", id);
    navigate(`/mcqs/${id}`);
    setOpenMenuId(null);
  };
  
  const handleEditMcq = (id: string) => {
    console.log("Edit clicked for MCQ ID:", id);
    navigate(`/mcqs/edit/${id}`);
    setOpenMenuId(null);
  };
  
  const handleDeleteMcq = (id: string) => {
    console.log("Delete clicked for MCQ ID:", id);
    handleDelete(id);
    setOpenMenuId(null);
  };
  
  const handleDuplicateMcq = async (id: string) => {
    console.log("Duplicate clicked for MCQ ID:", id);
    try {
      await duplicateMcqMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error duplicating MCQ:', error);
      alert('Failed to duplicate MCQ. Please try again.');
    } finally {
      setOpenMenuId(null);
    }
  };
  
  // Replace 'loading' with the React Query's isLoading states
  const loading = mcqsLoading || classesLoading;
  
  const handleGenerateTest = async (id: string) => {
    console.log("Generate Test clicked for MCQ ID:", id);
    try {
      if (!user) return;
      
      // 1. Fetch the MCQ details
      const { data: mcqData, error: mcqError } = await supabase
        .from('mcqs')
        .select('*, classes(id, name, section)')
        .eq('id', id)
        .eq('teacher_id', user.id)
        .single();
      
      if (mcqError) {
        console.error('Error fetching MCQ:', mcqError);
        alert('Error fetching MCQ details: ' + mcqError.message);
        return;
      }
      
      if (!mcqData) {
        console.error('MCQ not found');
        alert('MCQ not found. Please try again.');
        return;
      }
      
      // 2. Fetch students for the class
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', mcqData.class_id)
        .eq('teacher_id', user.id);
        
      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      }
      
      // Prepare complete test preview data
      const testData = {
        mcq: mcqData,
        class: mcqData.classes,
        students: studentsData || []
      };
      
      // Set the preview data and show the modal
      setTestPreviewData(testData);
      setShowTestPreview(true);
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error generating test:', error);
      alert('Failed to generate test. Please try again.');
    }
  };
  
  const handlePrintTests = () => {
    try {
      // Validate required data
      if (!testPreviewData || !testPreviewData.mcq || !testPreviewData.students || !testPreviewData.class) {
        console.error('Missing required data for printing tests');
        alert('Error: Missing data needed to generate test sheets');
        return;
      }
      
      // Prepare the document for printing
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('Please allow pop-ups to print test sheets');
        return;
      }
      
      const { mcq, students, class: classData } = testPreviewData;
      
      // Generate HTML content for the print window
      printWindow.document.write(`
        <html>
        <head>
          <title>MCQ Tests - ${mcq.title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0; 
              font-size: 11pt;
              color: #E32636;
            }
            .test-sheet { 
              page-break-after: always; 
              padding: 15px; 
              max-width: 700px; 
              margin: 0 auto;
              color: #E32636;
            }
            .header { 
              text-align: center; 
              margin-bottom: 15px; 
              border-bottom: 1px solid #E32636; 
              padding-bottom: 8px; 
            }
            .header h1 {
              font-size: 16pt;
              margin: 0 0 8px 0;
            }
            .header h2 {
              font-size: 12pt;
              margin: 0;
              font-weight: normal;
            }
            .student-info { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 15px; 
              font-size: 10pt;
            }
            .student-info div { 
              border: 1px solid #E32636; 
              padding: 6px; 
              width: 30%; 
            }
            .questions { 
              margin-top: 20px;
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              grid-gap: 4px 15px;
            }
            .question { 
              margin-bottom: 9px;
              font-size: 10pt;
            }
            .options { 
              display: flex;
              flex-wrap: nowrap;
            }
            .option {
              margin-right: 9px; 
              display: flex; 
              align-items: center;
              color: #E32636;
            }
            .circle {
              display: inline-block;
              width: 19px;
              height: 19px;
              border-radius: 50%;
              border: 1px solid #E32636;
            }
            .option-letter {
              margin-right: 4px;
              font-weight: bold;
            }
            
            
            @media print {
              body { font-size: 10pt; }
              .test-sheet { height: 100vh; box-sizing: border-box; }
              .option { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
      `);
      
      // Create a test sheet for each student
      students.forEach((student: { name?: string; roll?: string }, index: number) => {
        try {
          printWindow.document.write(`
            <div class="test-sheet">
              <div class="header">
                <h1>${mcq.title || 'Multiple Choice Questions'}</h1>
                <h2>${classData?.name || 'Class'} - Section ${classData?.section || ''}</h2>
              </div>
              
              <div class="student-info">
                <div>
                  <strong>Name:</strong> ${student.name || '_______________'}
                </div>
                <div>
                  <strong>Roll No.:</strong> ${student.roll || '_____'}
                </div>
                <div>
                  <strong>Date:</strong> ${new Date().toLocaleDateString()}
                </div>
              </div>
              
              <div className="questions">
                ${(mcq.questions || []).map((_q: any, qIndex: number) => `
                  <div class="question">
                    <p><strong>${qIndex + 1}.</strong>
                    <span class="options">
                      <span class="option">
                        <span class="option-letter">A</span>
                        <span class="circle"></span>
                      </span>
                      <span class="option">
                        <span class="option-letter">B</span>
                        <span class="circle"></span>
                      </span>
                      <span class="option">
                        <span class="option-letter">C</span>
                        <span class="circle"></span>
                      </span>
                      <span class="option">
                        <span class="option-letter">D</span>
                        <span class="circle"></span>
                      </span>
                    </span></p>
                  </div>
                `).join('')}
              </div>
            </div>
          `);
        } catch (error) {
          console.error(`Error rendering test sheet for student ${index}:`, error);
        }
      });
      
      printWindow.document.write(`
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Print after a small delay to ensure the content is loaded
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (error) {
          console.error('Error during printing:', error);
          alert('An error occurred during printing. Please check the console for details.');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error generating print layout:', error);
      alert('Failed to generate print layout. Please try again.');
    }
  };
  
  const handleGeneratedMcqs = async (generatedMcqs: any[], title?: string) => {
    try {
      if (!user) return;
      
      // Create a new MCQ in your database with the generated questions
      const newMcq = {
        title: title || 'Untitled MCQ',
        description: 'Automatically generated using Google Gemini AI',
        class_id: selectedClass || classes[0]?.id, // Use selected class or first available
        questions: generatedMcqs,
        teacher_id: user.id
      };
      
      const { data, error } = await supabase
        .from('mcqs')
        .insert([newMcq])
        .select();
      
      if (error) throw error;
      
      // Navigate to edit the newly created MCQ
      if (data && data.length > 0) {
        navigate(`/mcqs/edit/${data[0].id}`);
      } else {
        // Refresh the MCQ list if we don't navigate away
        refetchMcqs();
      }
      
    } catch (error) {
      console.error('Error saving generated MCQs:', error);
      alert('Failed to save generated MCQs. Please try again.');
    }
  };

  return (
    <Layout title="MCQs">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          Create and manage your multiple-choice questions
        </p>
        <div className="flex space-x-2">
          <Button 
            leftIcon={<Sparkles size={16} />}
            variant="outline"
            onClick={() => setShowAiGenerator(true)}
          >
            Generate with AI
          </Button>
          <Link to="/mcqs/create">
            <Button leftIcon={<Plus size={16} />}>
              Create MCQ
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center">
              <Filter size={16} className="mr-2 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={selectedClass}
                onChange={handleClassFilter}
                options={[
                  { value: '', label: 'All Classes' },
                  ...classes.map(c => ({ value: c.id, label: `${c.name} - Section ${c.section}` }))
                ]}
              />
              <div className="flex space-x-2">
                <Button type="submit" variant="outline">Search</Button>
                <Button type="button" variant="ghost" onClick={handleClearFilters}>Clear</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {mcqs.length > 0 ? (
            <div className="min-w-full divide-y divide-gray-200">
              <div className="bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5">Title</div>
                  <div className="col-span-2">Class</div>
                  <div className="col-span-2">Questions</div>
                  <div className="col-span-2">Created</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
              </div>
              <div className="bg-white divide-y divide-gray-200">
                {mcqs.map((mcq) => (
                  <motion.div 
                    key={mcq.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5">
                        <div className="text-sm font-medium text-gray-900">{mcq.title}</div>
                        <div className="text-sm text-gray-500 truncate">{mcq.description}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-500">
                          {(mcq as any).classes ? 
                            `${(mcq as any).classes.name} - Section ${(mcq as any).classes.section}` : 
                            'Unknown class'}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-500">{mcq.questions.length} questions</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-500">
                          {new Date(mcq.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="col-span-1 text-right action-menu-container">
                        <button
                          onClick={(e) => toggleMenu(mcq.id, e)}
                          className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                          aria-label="Menu"
                          aria-haspopup="true"
                          aria-expanded={openMenuId === mcq.id}
                        >
                          <MoreVertical size={18} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500 mb-4">
                {selectedClass || searchTerm 
                  ? 'No MCQs match your filters' 
                  : 'No MCQs created yet'}
              </p>
              {!selectedClass && !searchTerm && (
                <Link to="/mcqs/create">
                  <Button leftIcon={<Plus size={16} />}>
                    Create Your First MCQ
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Fixed position dropdown that's positioned based on the button */}
      {openMenuId && (
        <div 
          ref={dropdownRef}
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
              handleViewMcq(openMenuId);
            }}
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            role="menuitem"
            autoFocus
          >
            <Eye size={16} className="mr-2" />
            View
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleEditMcq(openMenuId);
            }}
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            role="menuitem"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleGenerateTest(openMenuId);
            }}
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            role="menuitem"
          >
            <FileText size={16} className="mr-2" />
            Generate Test
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicateMcq(openMenuId);
            }}
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            role="menuitem"
          >
            <Copy size={16} className="mr-2" />
            Duplicate
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMcq(openMenuId);
            }}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
            role="menuitem"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </button>
        </div>
      )}
      
      {/* Test Preview Modal */}
      {showTestPreview && testPreviewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <FileText size={16} className="mr-2 text-primary-500" />
                Test Preview - {testPreviewData.mcq?.title || 'Untitled MCQ'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Class: {testPreviewData.class?.name || 'Unknown'} - Section {testPreviewData.class?.section || 'N/A'} 
                • Students: {testPreviewData.students?.length || 0}
              </p>
            </div>
            
            <div className="p-4">
              {/* Debug information during development - only shown in dev mode */}
              {import.meta.env.DEV && (
                <div className="mb-3 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-20 hidden">
                  <pre>{JSON.stringify({
                    mcqId: testPreviewData.mcq?.id,
                    classId: testPreviewData.mcq?.class_id,
                    numQuestions: testPreviewData.mcq?.questions?.length,
                    studentSample: testPreviewData.students?.[0]
                  }, null, 2)}</pre>
                </div>
              )}

              <div className="border rounded-lg mb-4 overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b">
                  <h3 className="text-sm font-medium">Sample Test Sheet (Preview)</h3>
                </div>
                <div className="p-3">
                  {/* Sample Test Sheet Preview */}
                  <div className="border p-4 rounded">
                    <div className="text-center mb-3 pb-2 border-b">
                      <h2 className="text-base font-bold text-red-600">{testPreviewData.mcq?.title || 'Untitled MCQ'}</h2>
                      <p className="text-sm text-red-600">{testPreviewData.class?.name || 'Class'} - Section {testPreviewData.class?.section || 'N/A'}</p>
                    </div>
                    
                    <div className="flex justify-between mb-3 text-sm">
                      <div className="border border-red-600 p-1 w-1/3 mr-1">
                        <p className="text-red-600"><strong>Name:</strong> Student</p>
                      </div>
                      <div className="border border-red-600 p-1 w-1/3 mr-1">
                        <p className="text-red-600"><strong>Roll:</strong> XXX</p>
                      </div>
                      <div className="border border-red-600 p-1 w-1/3">
                        <p className="text-red-600"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {testPreviewData.mcq?.questions ? (
                        <>
                          {(testPreviewData.mcq.questions.slice(0, 8) || []).map((_question: any, index: number) => (
                            <div key={index} className="pb-1 mb-1">
                              <p className="font-medium text-red-600">
                                {index + 1}.
                                <span className="inline-flex ml-1">
                                  <span className="inline-flex flex-row items-center mr-2">
                                    <span className="text-red-600 mr-1">A</span>
                                    <span className="w-5 h-5 rounded-full border border-red-600 flex items-center justify-center"></span>
                                  </span>
                                  <span className="inline-flex flex-row items-center mr-2">
                                    <span className="text-red-600 mr-1">B</span>
                                    <span className="w-5 h-5 rounded-full border border-red-600 flex items-center justify-center"></span>
                                  </span>
                                  <span className="inline-flex flex-row items-center mr-2">
                                    <span className="text-red-600 mr-1">C</span>
                                    <span className="w-5 h-5 rounded-full border border-red-600 flex items-center justify-center"></span>
                                  </span>
                                  <span className="inline-flex flex-row items-center">
                                    <span className="text-red-600 mr-1">D</span>
                                    <span className="w-5 h-5 rounded-full border border-red-600 flex items-center justify-center"></span>
                                  </span>
                                </span>
                              </p>
                              {index < testPreviewData.mcq.questions.length - 1 &&
                               <hr className="border-t border-red-600 opacity-30 my-1" />
                              }
                            </div>
                          ))}
                          
                          {testPreviewData.mcq.questions.length > 8 && (
                            <p className="text-xs text-red-600 italic col-span-2 text-center">
                              (+ {testPreviewData.mcq.questions.length - 8} more questions)
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-center text-red-500 col-span-2">
                          No questions available for this MCQ.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs space-y-1 text-gray-600">
                <p>
                  • A separate test sheet will be generated for each student in the class.
                </p>
                <p>
                  • Each sheet includes student info and answer circles for all {testPreviewData.mcq?.questions?.length || 0} questions.
                </p>
                {(!testPreviewData.students || testPreviewData.students.length === 0) && (
                  <p className="text-amber-600 font-medium">
                    • Using sample student data since no students were found in this class.
                  </p>
                )}
              </div>
            </div>
            
            <div className="p-3 border-t bg-gray-50 flex justify-end space-x-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowTestPreview(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePrintTests}
                leftIcon={<FileText size={16} />}
                size="sm"
                disabled={!testPreviewData.mcq?.questions || testPreviewData.mcq.questions.length === 0}
              >
                Print Test Sheets
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* AI MCQ Generator Modal */}
      {showAiGenerator && (
        <AiMcqGeneratorModal
          isOpen={showAiGenerator}
          onClose={() => setShowAiGenerator(false)}
          onMcqsGenerated={handleGeneratedMcqs}
          classes={classes}
        />
      )}
    </Layout>
  );
}