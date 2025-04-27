import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, GraduationCap, BookOpen, School } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Class } from '../lib/supabase';

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [grade, setGrade] = useState('');
  
  useEffect(() => {
    fetchClasses();
  }, [user]);
  
  const fetchClasses = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setSection('');
    setGrade('');
    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      if (isEditing && editingId) {
        // Update existing class
        const { error } = await supabase
          .from('classes')
          .update({ name, section, grade })
          .eq('id', editingId)
          .eq('teacher_id', user.id);
        
        if (error) throw error;
      } else {
        // Add new class
        const { error } = await supabase
          .from('classes')
          .insert([{ name, section, grade, teacher_id: user.id }]);
        
        if (error) throw error;
      }
      
      // Refresh the classes list
      fetchClasses();
      resetForm();
    } catch (error) {
      console.error('Error saving class:', error);
    }
  };
  
  const handleEdit = (classItem: Class) => {
    setName(classItem.name);
    setSection(classItem.section);
    setGrade(classItem.grade);
    setEditingId(classItem.id);
    setIsEditing(true);
    setIsAdding(true); // Reuse the same form
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id)
        .eq('teacher_id', user.id);
      
      if (error) throw error;
      
      // Refresh the classes list
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };
  
  return (
    <Layout title="Classes">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Classes</h1>
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Manage your classes, sections, and grades
          </p>
          {!isAdding && (
            <Button
              leftIcon={<Plus size={16} />}
              onClick={() => setIsAdding(true)}
              size="md"
              className="transition-all hover:scale-105"
            >
              Add Class
            </Button>
          )}
        </div>
      </div>
      
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
                  {isEditing ? 'Edit Class Details' : 'Add New Class'}
                </h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <Input
                        label="Class Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Mathematics"
                        required
                        icon={<BookOpen size={18} className="text-gray-500" />}
                      />
                      <p className="text-xs text-gray-500 pl-1">The subject name for this class</p>
                    </div>
                    <div className="space-y-1">
                      <Input
                        label="Section"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        placeholder="e.g. A"
                        required
                        icon={<School size={18} className="text-gray-500" />}
                      />
                      <p className="text-xs text-gray-500 pl-1">The section identifier</p>
                    </div>
                    <div className="space-y-1">
                      <Input
                        label="Grade"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="e.g. 10"
                        required
                        icon={<GraduationCap size={18} className="text-gray-500" />}
                      />
                      <p className="text-xs text-gray-500 pl-1">The grade or year level</p>
                    </div>
                  </div>
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
                      rightIcon={isEditing ? <Pencil size={16} /> : <Plus size={16} />}
                    >
                      {isEditing ? 'Update Class' : 'Create Class'}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="text-primary-600 font-medium">Loading your classes...</p>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          >
            {classes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class Name
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classes.map((classItem, index) => (
                      <motion.tr 
                        key={classItem.id}
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
                            <BookOpen size={18} className="text-primary-500 mr-2" />
                            <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <School size={18} className="text-gray-400 mr-2" />
                            <div className="text-sm text-gray-700">{classItem.section}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <GraduationCap size={18} className="text-gray-400 mr-2" />
                            <div className="text-sm text-gray-700">Grade {classItem.grade}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Pencil size={16} />}
                            onClick={() => handleEdit(classItem)}
                            className="mr-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 size={16} />}
                            onClick={() => handleDelete(classItem.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 px-6 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No classes added yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Create your first class to start organizing your teaching materials and assignments</p>
                {!isAdding && (
                  <Button
                    leftIcon={<Plus size={16} />}
                    onClick={() => setIsAdding(true)}
                    size="lg"
                    className="transition-all hover:scale-105"
                  >
                    Add Your First Class
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </Layout>
  );
}