import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Users, BookOpen, Plus, ArrowRight, Bell, Calendar, ChevronRight, BarChart2 } from 'lucide-react';
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-primary-600 font-medium">Loading your dashboard...</p>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{getGreeting()}, {userName || 'Teacher'}</h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span>{formatDate()}</span>
                </div>
                
                <p className="mt-3 text-gray-600 max-w-xl">
                  Welcome to your dashboard. Here's an overview of your classes, students, and MCQs.
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <Bell size={18} className="text-amber-500 mr-2" />
                  <span className="text-sm font-medium">
                    {recentMcqs.length > 0 ? `${recentMcqs.length} recent MCQs` : 'No recent activity'}
                  </span>
                </div>
                <div className="mt-2">
                  <Link to="/mcqs/create">
                    <Button 
                      size="sm" 
                      className="shadow-sm hover:shadow-md transition-all"
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
              <Card className="h-full border-blue-200 hover:shadow-md transition-all">
                <CardContent className="p-0">
                  <div className="p-5 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-lg bg-blue-100">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="p-1.5 rounded-full bg-blue-50">
                        <div className={`h-2 w-2 rounded-full ${stats.classCount > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
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
                  
                  <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-lg">
                    <Link to="/classes" className="flex items-center justify-between text-sm text-blue-600 font-medium">
                      <span>Manage Classes</span>
                      <ChevronRight size={16} />
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
              <Card className="h-full border-green-200 hover:shadow-md transition-all">
                <CardContent className="p-0">
                  <div className="p-5 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-lg bg-green-100">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="p-1.5 rounded-full bg-green-50">
                        <div className={`h-2 w-2 rounded-full ${stats.studentCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
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
                  
                  <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-lg">
                    <Link to="/students" className="flex items-center justify-between text-sm text-green-600 font-medium">
                      <span>Manage Students</span>
                      <ChevronRight size={16} />
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
              <Card className="h-full border-purple-200 hover:shadow-md transition-all">
                <CardContent className="p-0">
                  <div className="p-5 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-lg bg-purple-100">
                        <FileQuestion className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="p-1.5 rounded-full bg-purple-50">
                        <div className={`h-2 w-2 rounded-full ${stats.mcqCount > 0 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
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
                  
                  <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-lg">
                    <Link to="/mcqs" className="flex items-center justify-between text-sm text-purple-600 font-medium">
                      <span>View All MCQs</span>
                      <ChevronRight size={16} />
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
            <Card className="border-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileQuestion className="h-5 w-5 text-primary-500 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Recent MCQs</h2>
                  </div>
                  <Link to="/mcqs">
                    <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />}>
                      View all
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                {recentMcqs.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Questions
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentMcqs.map((mcq, index) => (
                        <motion.tr 
                          key={mcq.id} 
                          className="hover:bg-gray-50"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{mcq.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center">
                              <span>{mcq.questions.length}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {(mcq as any).classes ? 
                                <span className="inline-flex items-center">
                                  <BookOpen size={14} className="mr-1 text-blue-500" />
                                  {(mcq as any).classes.name} - Section {(mcq as any).classes.section}
                                </span> : 
                                'Unknown class'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1 text-gray-400" />
                              {new Date(mcq.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Link to={`/mcqs/${mcq.id}`}>
                              <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />}>
                                View
                              </Button>
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 px-6 text-center bg-gray-50">
                    <div className="mx-auto w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                      <FileQuestion size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No MCQs created yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Start creating MCQs for your students to test their knowledge and track their progress.
                    </p>
                    <Link to="/mcqs/create">
                      <Button rightIcon={<Plus size={16} />} size="lg" className="shadow-sm hover:shadow transition-shadow">
                        Create Your First MCQ
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              {recentMcqs.length > 0 && (
                <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Showing {recentMcqs.length} of {stats.mcqCount} MCQs
                  </div>
                  <Link to="/mcqs/create">
                    <Button size="sm" rightIcon={<Plus size={16} />}>
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
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              <span className="text-sm text-gray-500">Get started with these common tasks</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/classes/create" className="block">
                <Card className="hover:shadow-md transition-shadow border-blue-200 hover:border-blue-300 h-full">
                  <CardContent className="flex flex-col p-5">
                    <div className="p-3 rounded-full bg-blue-100 self-start mb-3">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium mb-1">Create Class</h3>
                    <p className="text-sm text-gray-500 mb-3">Add a new class with section details</p>
                    <div className="mt-auto">
                      <span className="text-blue-600 text-sm font-medium flex items-center">
                        Get Started <ArrowRight size={14} className="ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/students" className="block">
                <Card className="hover:shadow-md transition-shadow border-green-200 hover:border-green-300 h-full">
                  <CardContent className="flex flex-col p-5">
                    <div className="p-3 rounded-full bg-green-100 self-start mb-3">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-medium mb-1">Manage Students</h3>
                    <p className="text-sm text-gray-500 mb-3">Add, edit or remove students</p>
                    <div className="mt-auto">
                      <span className="text-green-600 text-sm font-medium flex items-center">
                        View Students <ArrowRight size={14} className="ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/mcqs/create" className="block">
                <Card className="hover:shadow-md transition-shadow border-purple-200 hover:border-purple-300 h-full">
                  <CardContent className="flex flex-col p-5">
                    <div className="p-3 rounded-full bg-purple-100 self-start mb-3">
                      <FileQuestion className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-medium mb-1">Create MCQ</h3>
                    <p className="text-sm text-gray-500 mb-3">Generate questions with AI</p>
                    <div className="mt-auto">
                      <span className="text-purple-600 text-sm font-medium flex items-center">
                        Start Creating <ArrowRight size={14} className="ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/analytics" className="block">
                <Card className="hover:shadow-md transition-shadow border-amber-200 hover:border-amber-300 h-full">
                  <CardContent className="flex flex-col p-5">
                    <div className="p-3 rounded-full bg-amber-100 self-start mb-3">
                      <BarChart2 className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="font-medium mb-1">View Analytics</h3>
                    <p className="text-sm text-gray-500 mb-3">Check student performance</p>
                    <div className="mt-auto">
                      <span className="text-amber-600 text-sm font-medium flex items-center">
                        View Reports <ArrowRight size={14} className="ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </Layout>
  );
}