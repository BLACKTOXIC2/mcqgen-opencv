import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, Users, FileQuestion, LogOut, ChevronRight, ScanLine,
  BookOpenCheck, Layers, Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type NavItem = {
  name: string;
  path: string;
  icon: JSX.Element;
  description?: string;
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      if (isOpen && sidebar && !sidebar.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems: NavItem[] = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <Home size={20} />,
      description: 'Overview of your activities'
    },
    { 
      name: 'Classes', 
      path: '/classes', 
      icon: <BookOpenCheck size={20} />,
      description: 'Manage your classes and sections' 
    },
    { 
      name: 'Students', 
      path: '/students', 
      icon: <Users size={20} />,
      description: 'Manage your students' 
    },
    { 
      name: 'MCQs', 
      path: '/mcqs', 
      icon: <FileQuestion size={20} />,
      description: 'Create and manage questions' 
    },
    { 
      name: 'Test Checking', 
      path: '/tests/check', 
      icon: <ScanLine size={20} />,
      description: 'Scan and grade tests' 
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getInitials = (name: string = 'User') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userEmail = user?.email || '';
  const userName = userEmail.substring(0, userEmail.indexOf('@')) || 'User';
  const userInitials = getInitials(userName);

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-full bg-white shadow-lg hover:bg-primary-50 text-primary-600"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar for large screens */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:shadow-sm overflow-y-auto">
        <div className="flex items-center justify-center h-14 px-4 mb-6">
          <div className="flex items-center space-x-2 text-xl font-bold text-primary-600">
            <Layers size={24} className="text-primary-600" />
            <span>MCQGen</span>
          </div>
        </div>

        <div className="flex flex-col flex-grow px-3">
          {/* User section */}
          <div className="mb-6 p-3 bg-primary-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-9 h-9 bg-primary-500 text-white rounded-full flex items-center justify-center font-medium text-sm">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userEmail}
                </p>
              </div>
              <Link 
                to="/profile" 
                className="p-1.5 rounded-md hover:bg-primary-100 text-primary-800 transition-colors"
                aria-label="Edit profile"
              >
                <Settings size={16} />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            MAIN NAVIGATION
          </div>
          <nav className="space-y-1 mb-6">
            {navItems.map((item) => {
              const isItemActive = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 rounded-md transition-colors
                    ${isItemActive
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <span className={`mr-3 ${isItemActive ? 'text-primary-600' : ''}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                  {isItemActive && (
                    <ChevronRight size={16} className="ml-auto text-primary-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto mb-4">
            <div className="px-3 py-2 text-xs text-gray-500">
              Logged in as a teacher
            </div>
            <button 
              onClick={signOut}
              className="flex items-center w-full px-3 py-2 mt-1 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden">
          <div 
            id="mobile-sidebar"
            className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-14 px-4 border-b bg-primary-50">
              <div className="flex items-center space-x-2">
                <Layers size={22} className="text-primary-600" />
                <h1 className="text-lg font-bold text-primary-700">MCQGen</h1>
              </div>
              <button 
                onClick={toggleSidebar} 
                className="p-1.5 rounded-full hover:bg-white text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* User section - mobile */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-medium text-sm">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-grow overflow-y-auto">
              <nav className="flex-1 px-2 py-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`
                      flex items-center px-3 py-2 rounded-md transition-colors
                      ${isActive(item.path)
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className={`mr-3 ${isActive(item.path) ? 'text-primary-600' : ''}`}>
                      {item.icon}
                    </span>
                    {item.name}
                    {isActive(item.path) && (
                      <ChevronRight size={16} className="ml-auto text-primary-600" />
                    )}
                  </Link>
                ))}
              </nav>

              <div className="px-4 py-3 mt-auto border-t">
                <button 
                  onClick={signOut}
                  className="flex items-center w-full px-3 py-2 rounded-md font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} className="mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}