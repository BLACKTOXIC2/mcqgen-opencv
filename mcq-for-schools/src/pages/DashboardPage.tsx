import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Users, BookOpen, Plus, ArrowRight, Bell, Calendar, ChevronRight, BarChart2, Award, Filter, ExternalLink, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Card, { CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Mcq } from '../lib/supabase';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    classCount: 0,
    studentCount: 0,
    mcqCount: 0,
  });
  const [recentMcqs, setRecentMcqs] = useState<Mcq[]>([]);
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [loadingTopStudents, setLoadingTopStudents] = useState(false);
  const [strugglingChapters, setStrugglingChapters] = useState<any[]>([]);
  const [loadingStrugglingChapters, setLoadingStrugglingChapters] = useState(false);
  const [selectedClassForChapters, setSelectedClassForChapters] = useState<string>('all');

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('teachers')
          .select('name')
          .eq('id', user.id)
          .single();
          
        if (data && data.name) {
          setUserName(data.name);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        if (!user) return;

        // Get class count
        const { count: classCount } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', user.id);

        // Get student count
        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', user.id);

        // Get MCQ count
        const { count: mcqCount } = await supabase
          .from('mcqs')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', user.id);

        // Get recent MCQs
        const { data: mcqs } = await supabase
          .from('mcqs')
          .select('*, classes(name, section)')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          classCount: classCount || 0,
          studentCount: studentCount || 0,
          mcqCount: mcqCount || 0,
        });

        setRecentMcqs(mcqs || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('classes')
          .select('id, name, section')
          .eq('teacher_id', user.id)
          .order('name', { ascending: true });
          
        if (data) {
          setClasses(data);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };
    
    fetchClasses();
  }, [user]);

  useEffect(() => {
    fetchTopStudents();
  }, [user, selectedClass]);

  useEffect(() => {
    fetchStrugglingChapters();
  }, [user, selectedClassForChapters]);

  const fetchTopStudents = async () => {
    if (!user) return;
    
    try {
      setLoadingTopStudents(true);
      
      let query = supabase
        .from('student_results')
        .select(`
          id,
          student_id,
          percentage,
          score,
          total_questions,
          created_at,
          students(id, name, roll, class_id, classes(id, name, section))
        `)
        .eq('teacher_id', user.id)
        .order('percentage', { ascending: false })
        .limit(50);
      
      const { data: results } = await query;
      
      if (results && results.length > 0) {
        // Group by student and calculate average score
        const studentMap = new Map();
        
        results.forEach((result: any) => {
          if (!result.students) return;
          
          const studentId = result.student_id;
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              id: studentId,
              name: result.students.name,
              roll: result.students.roll,
              class_id: result.students.class_id,
              class_name: result.students.classes?.name,
              class_section: result.students.classes?.section,
              totalScore: 0,
              totalTests: 0,
              recentResult: null
            });
          }
          
          const student = studentMap.get(studentId);
          student.totalScore += result.percentage;
          student.totalTests += 1;
          
          // Keep most recent test
          if (!student.recentResult || new Date(result.created_at) > new Date(student.recentResult.created_at)) {
            student.recentResult = {
              score: result.score,
              total: result.total_questions,
              percentage: result.percentage,
              created_at: result.created_at
            };
          }
        });
        
        // Calculate average scores and sort
        const processedStudents = Array.from(studentMap.values())
          .map((student: any) => ({
            ...student,
            averageScore: student.totalScore / student.totalTests
          }))
          .sort((a, b) => b.averageScore - a.averageScore);
        
        // Filter by selected class if not "all"
        let filteredStudents = processedStudents;
        if (selectedClass !== 'all') {
          filteredStudents = processedStudents.filter(
            student => student.class_id === selectedClass
          );
        }
        
        setTopStudents(filteredStudents.slice(0, 5));
      } else {
        setTopStudents([]);
      }
    } catch (error) {
      console.error('Error fetching top students:', error);
    } finally {
      setLoadingTopStudents(false);
    }
  };

  const fetchStrugglingChapters = async () => {
    if (!user) return;
    
    try {
      setLoadingStrugglingChapters(true);
      
      let query = supabase
        .from('student_results')
        .select(`
          id,
          mcq_id,
          percentage,
          score,
          total_questions,
          mcqs(
            id,
            title,
            questions,
            class_id,
            classes(id, name, section)
          )
        `)
        .eq('teacher_id', user.id);
      
      if (selectedClassForChapters !== 'all') {
        query = query.eq('mcqs.class_id', selectedClassForChapters);
      }
      
      const { data: results, error } = await query;
      
      console.log('Struggling chapters raw results:', results, error);
      
      if (results && results.length > 0) {
        // Group by MCQ title and extract topic from title
        const chapterMap = new Map();
        
        results.forEach((result: any) => {
          if (!result.mcqs) return;
          
          const title = result.mcqs.title || '';
          // Extract subject and chapter from title (assuming format like "Math: Algebra" or something similar)
          // If no clear format, we'll just use the title as the chapter name
          let subject = 'General';
          let chapter = title;
          
          // Try to extract subject and chapter if title has format "Subject: Chapter"
          const titleParts = title.split(':');
          if (titleParts.length > 1) {
            subject = titleParts[0].trim();
            chapter = titleParts.slice(1).join(':').trim();
          }
          
          const chapterKey = `${chapter}-${subject}`;
          if (!chapterMap.has(chapterKey)) {
            chapterMap.set(chapterKey, {
              chapter,
              subject,
              totalScore: 0,
              totalTests: 0,
              class_id: result.mcqs.class_id,
              class_name: result.mcqs.classes?.name,
              class_section: result.mcqs.classes?.section,
              mcqIds: new Set()
            });
          }
          
          const chapterData = chapterMap.get(chapterKey);
          chapterData.totalScore += result.percentage;
          chapterData.totalTests += 1;
          chapterData.mcqIds.add(result.mcq_id);
        });
        
        // Calculate average scores and sort by lowest performance
        const processedChapters = Array.from(chapterMap.values())
          .map((chapter: any) => ({
            ...chapter,
            mcqCount: chapter.mcqIds.size,
            averageScore: chapter.totalScore / chapter.totalTests
          }))
          .sort((a, b) => a.averageScore - b.averageScore);
        
        setStrugglingChapters(processedChapters.slice(0, 5));
      } else {
        setStrugglingChapters([]);
      }
    } catch (error) {
      console.error('Error fetching struggling chapters:', error);
    } finally {
      setLoadingStrugglingChapters(false);
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Format date
  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Layout title="Dashboard">
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-purple-700 font-medium">Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">{getGreeting()}, {userName || 'Teacher'}</h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <Calendar size={16} className="mr-2 text-purple-400" />
                  <span>{formatDate()}</span>
                </div>
                
                <p className="mt-3 text-gray-600 max-w-xl">
                  Welcome to your dashboard. Here's an overview of your classes, students, and MCQs.
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-transform duration-300">
                  <Bell size={18} className="text-purple-500 mr-2" />
                  <span className="text-sm font-medium">
                    {recentMcqs.length > 0 ? `${recentMcqs.length} recent MCQs` : 'No recent activity'}
                  </span>
                </div>
                <div className="mt-2">
                  <Link to="/mcqs/create">
                    <Button 
                      size="sm" 
                      className="shadow-sm hover:shadow-md transition-all bg-purple-600 hover:bg-purple-700 text-white"
                      rightIcon={<Plus size={16} />}
                    >
                      Create New MCQ
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="h-full border-purple-200 hover:shadow-md transition-all hover:border-purple-300 group">
                <CardContent className="p-0">
                  <div className="p-5 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                        <BookOpen className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="p-1.5 rounded-full bg-purple-50">
                        <div className={`h-2 w-2 rounded-full ${stats.classCount > 0 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Total Classes</p>
                      <div className="flex items-baseline">
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.classCount}</p>
                        <span className="ml-1 text-xs text-gray-500">classes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-lg group-hover:bg-purple-50 transition-colors">
                    <Link to="/classes" className="flex items-center justify-between text-sm text-purple-600 font-medium">
                      <span>Manage Classes</span>
                      <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="h-full border-indigo-200 hover:shadow-md transition-all hover:border-indigo-300 group">
                <CardContent className="p-0">
                  <div className="p-5 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                        <Users className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="p-1.5 rounded-full bg-indigo-50">
                        <div className={`h-2 w-2 rounded-full ${stats.studentCount > 0 ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Total Students</p>
                      <div className="flex items-baseline">
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.studentCount}</p>
                        <span className="ml-1 text-xs text-gray-500">students</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-lg group-hover:bg-indigo-50 transition-colors">
                    <Link to="/students" className="flex items-center justify-between text-sm text-indigo-600 font-medium">
                      <span>Manage Students</span>
                      <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="h-full border-violet-200 hover:shadow-md transition-all hover:border-violet-300 group">
                <CardContent className="p-0">
                  <div className="p-5 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-lg bg-violet-100 group-hover:bg-violet-200 transition-colors">
                        <FileQuestion className="h-6 w-6 text-violet-600" />
                      </div>
                      <div className="p-1.5 rounded-full bg-violet-50">
                        <div className={`h-2 w-2 rounded-full ${stats.mcqCount > 0 ? 'bg-violet-500' : 'bg-gray-300'}`}></div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Total MCQs</p>
                      <div className="flex items-baseline">
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.mcqCount}</p>
                        <span className="ml-1 text-xs text-gray-500">questions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-lg group-hover:bg-violet-50 transition-colors">
                    <Link to="/mcqs" className="flex items-center justify-between text-sm text-violet-600 font-medium">
                      <span>View All MCQs</span>
                      <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent MCQs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mb-8"
          >
            <Card className="border-purple-200 overflow-hidden hover:shadow-md transition-all">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileQuestion className="h-5 w-5 text-purple-600 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Recent MCQs</h2>
                  </div>
                  <Link to="/mcqs">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      rightIcon={<ArrowRight size={16} />}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      View all
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                {recentMcqs.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-purple-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">
                          Questions
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">
                          Class
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-purple-600 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentMcqs.map((mcq, index) => (
                        <motion.tr 
                          key={mcq.id} 
                          className="hover:bg-purple-50 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{mcq.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center">
                              <span>{mcq.questions.length}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {(mcq as any).classes ? 
                                <span className="inline-flex items-center">
                                  <BookOpen size={14} className="mr-1 text-indigo-500" />
                                  {(mcq as any).classes.name} - Section {(mcq as any).classes.section}
                                </span> : 
                                'Unknown class'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1 text-purple-400" />
                              {new Date(mcq.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Link to={`/mcqs/${mcq.id}`}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                rightIcon={<ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                                className="text-purple-600 hover:bg-purple-50 hover:text-purple-700 group"
                              >
                                View
                              </Button>
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 px-6 text-center bg-purple-50">
                    <div className="mx-auto w-16 h-16 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mb-4">
                      <FileQuestion size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No MCQs created yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Start creating MCQs for your students to test their knowledge and track their progress.
                    </p>
                    <Link to="/mcqs/create">
                      <Button 
                        rightIcon={<Plus size={16} />} 
                        size="lg" 
                        className="shadow-sm hover:shadow transition-shadow bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Create Your First MCQ
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              {recentMcqs.length > 0 && (
                <CardFooter className="bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-purple-100 flex justify-between items-center">
                  <div className="text-xs text-purple-600">
                    Showing {recentMcqs.length} of {stats.mcqCount} MCQs
                  </div>
                  <Link to="/mcqs/create">
                    <Button 
                      size="sm" 
                      rightIcon={<Plus size={16} />}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Create New
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Quick Actions</h2>
              <span className="text-sm text-gray-500">Get started with these common tasks</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/classes/create" className="block">
                <Card className="hover:shadow-md transition-all border-purple-200 hover:border-purple-300 h-full group">
                  <CardContent className="flex flex-col p-5">
                    <div className="p-3 rounded-full bg-purple-100 self-start mb-3 group-hover:bg-purple-200 transition-colors">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-medium mb-1">Create Class</h3>
                    <p className="text-sm text-gray-500 mb-3">Add a new class with section details</p>
                    <div className="mt-auto">
                      <span className="text-purple-600 text-sm font-medium flex items-center">
                        Get Started <ArrowRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/students" className="block">
                <Card className="hover:shadow-md transition-all border-indigo-200 hover:border-indigo-300 h-full group">
                  <CardContent className="flex flex-col p-5">
                    <div className="p-3 rounded-full bg-indigo-100 self-start mb-3 group-hover:bg-indigo-200 transition-colors">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="font-medium mb-1">Manage Students</h3>
                    <p className="text-sm text-gray-500 mb-3">Add, edit or remove students</p>
                    <div className="mt-auto">
                      <span className="text-indigo-600 text-sm font-medium flex items-center">
                        View Students <ArrowRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/mcqs/create" className="block">
                <Card className="hover:shadow-md transition-all border-violet-200 hover:border-violet-300 h-full group">
                  <CardContent className="flex flex-col p-5">
                    <div className="p-3 rounded-full bg-violet-100 self-start mb-3 group-hover:bg-violet-200 transition-colors">
                      <FileQuestion className="h-5 w-5 text-violet-600" />
                    </div>
                    <h3 className="font-medium mb-1">Create MCQ</h3>
                    <p className="text-sm text-gray-500 mb-3">Generate questions with AI</p>
                    <div className="mt-auto">
                      <span className="text-violet-600 text-sm font-medium flex items-center">
                        Start Creating <ArrowRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/analytics" className="block">
                <Card className="hover:shadow-md transition-all border-purple-200 hover:border-purple-300 h-full group">
                  <CardContent className="flex flex-col p-5">
                    <div className="p-3 rounded-full bg-purple-100 self-start mb-3 group-hover:bg-purple-200 transition-colors">
                      <BarChart2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-medium mb-1">View Analytics</h3>
                    <p className="text-sm text-gray-500 mb-3">Check student performance</p>
                    <div className="mt-auto">
                      <span className="text-purple-600 text-sm font-medium flex items-center">
                        View Reports <ArrowRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </motion.div>

          {/* Top Performing Students */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="mb-8"
          >
            <Card className="border-green-200 overflow-hidden hover:shadow-md transition-all">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-green-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-green-600 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Top Performing Students</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="flex items-center text-sm text-gray-600">
                        <Filter size={16} className="mr-1 text-green-500" />
                        <span className="mr-2">Filter by class:</span>
                      </div>
                    </div>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="text-sm rounded-md border border-green-200 bg-white px-3 py-1 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="all">All Classes</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} - Section {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                {loadingTopStudents ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                  </div>
                ) : topStudents.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                          Rank
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                          Class
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                          Average Score
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                          Recent Performance
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topStudents.map((student, index) => (
                        <motion.tr 
                          key={student.id} 
                          className="hover:bg-green-50 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-medium">
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-xs text-gray-500">Roll: {student.roll}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              <span className="inline-flex items-center">
                                <BookOpen size={14} className="mr-1 text-green-500" />
                                {student.class_name} - Section {student.class_section}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.averageScore.toFixed(1)}%</div>
                            <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-green-500 h-1.5 rounded-full" 
                                style={{ width: `${student.averageScore}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.recentResult && (
                              <div>
                                <div className="flex items-center">
                                  <div className={`h-2 w-2 rounded-full mr-1.5 ${
                                    student.recentResult.percentage >= 80 ? 'bg-green-500' : 
                                    student.recentResult.percentage >= 60 ? 'bg-yellow-500' : 
                                    'bg-red-500'
                                  }`}></div>
                                  <span className="text-sm text-gray-700">
                                    {student.recentResult.score}/{student.recentResult.total} ({student.recentResult.percentage}%)
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(student.recentResult.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Link to={`/students/${student.id}/analytics`}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                rightIcon={<ExternalLink size={14} />}
                                className="text-green-600 hover:bg-green-50 hover:text-green-700 group"
                              >
                                View Analytics
                              </Button>
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 px-6 text-center bg-green-50">
                    <div className="mx-auto w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                      <Award size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No student results available</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      {selectedClass !== 'all' 
                        ? 'No results found for students in this class.' 
                        : 'Start giving MCQ tests to your students to view performance rankings.'}
                    </p>
                    <Link to="/mcqs/share">
                      <Button 
                        rightIcon={<ArrowRight size={16} />} 
                        size="lg" 
                        className="shadow-sm hover:shadow transition-shadow bg-green-600 hover:bg-green-700 text-white"
                      >
                        Share MCQ with Students
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              {topStudents.length > 0 && (
                <CardFooter className="bg-gradient-to-r from-green-50 to-teal-50 border-t border-green-100 flex justify-between items-center">
                  <div className="text-xs text-green-600">
                    Showing top {topStudents.length} students
                    {selectedClass !== 'all' && ' in selected class'}
                  </div>
                  <Link to="/students">
                    <Button 
                      size="sm" 
                      rightIcon={<ChevronRight size={16} />}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      View All Students
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          </motion.div>

          {/* Struggling Chapters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="mb-8"
          >
            <Card className="border-orange-200 overflow-hidden hover:shadow-md transition-all">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Chapters Where Students Struggle</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="flex items-center text-sm text-gray-600">
                        <Filter size={16} className="mr-1 text-orange-500" />
                        <span className="mr-2">Filter by class:</span>
                      </div>
                    </div>
                    <select
                      value={selectedClassForChapters}
                      onChange={(e) => setSelectedClassForChapters(e.target.value)}
                      className="text-sm rounded-md border border-orange-200 bg-white px-3 py-1 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="all">All Classes</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} - Section {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                {loadingStrugglingChapters ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
                  </div>
                ) : strugglingChapters.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-orange-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">
                          Chapter/Topic
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">
                          Subject
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">
                          Class
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">
                          MCQ Tests
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">
                          Average Score
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">
                          Performance
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-orange-600 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {strugglingChapters.map((chapter, index) => (
                        <motion.tr 
                          key={`${chapter.chapter}-${chapter.subject}-${index}`} 
                          className="hover:bg-orange-50 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{chapter.chapter}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{chapter.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              <span className="inline-flex items-center">
                                <BookOpen size={14} className="mr-1 text-orange-500" />
                                {chapter.class_name} - Section {chapter.class_section}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center">
                              <span>{chapter.mcqCount || chapter.totalTests}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{chapter.averageScore.toFixed(1)}%</div>
                            <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  chapter.averageScore >= 80 ? 'bg-green-500' : 
                                  chapter.averageScore >= 60 ? 'bg-yellow-500' : 
                                  'bg-red-500'
                                }`}
                                style={{ width: `${chapter.averageScore}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-2 w-2 rounded-full mr-1.5 ${
                                chapter.averageScore >= 80 ? 'bg-green-500' : 
                                chapter.averageScore >= 60 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}></div>
                              <span className="text-sm text-gray-700">
                                {chapter.averageScore >= 80 ? 'Good' : 
                                 chapter.averageScore >= 60 ? 'Average' : 
                                 'Needs Improvement'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Link to={`/mcqs?search=${encodeURIComponent(chapter.chapter)}`}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                rightIcon={<ExternalLink size={14} />}
                                className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 group"
                              >
                                View MCQs
                              </Button>
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 px-6 text-center bg-orange-50">
                    <div className="mx-auto w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No chapter data available</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      {selectedClassForChapters !== 'all' 
                        ? 'No results found for this class.' 
                        : 'Start giving MCQ tests to your students to identify challenging chapters.'}
                    </p>
                    <Link to="/mcqs/create">
                      <Button 
                        rightIcon={<Plus size={16} />} 
                        size="lg" 
                        className="shadow-sm hover:shadow transition-shadow bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        Create MCQ Test
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              {strugglingChapters.length > 0 && (
                <CardFooter className="bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100 flex justify-between items-center">
                  <div className="text-xs text-orange-600">
                    Showing {strugglingChapters.length} chapters with lowest performance
                    {selectedClassForChapters !== 'all' && ' in selected class'}
                  </div>
                  <Link to="/mcqs">
                    <Button 
                      size="sm" 
                      rightIcon={<ChevronRight size={16} />}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      View All MCQs
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </Layout>
  );
}