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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
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
          className="p-2.5 rounded-full bg-white shadow-lg hover:bg-purple-50 text-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar for large screens */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:shadow-sm overflow-y-auto bg-gradient-to-b from-white to-purple-50 transition-all duration-300">
        <div className="flex items-center justify-center h-14 px-4 mb-6">
          <div className="flex items-center space-x-2 text-xl font-bold text-purple-700">
            <Layers size={24} className="text-purple-600" />
            <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">MCQGen</span>
          </div>
        </div>

        <div className="flex flex-col flex-grow px-3">
          {/* User section */}
          <div className="mb-6 p-3 bg-purple-100 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-9 h-9 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium text-sm shadow-sm">
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
                className="p-1.5 rounded-md hover:bg-purple-200 text-purple-700 transition-all duration-300 transform hover:scale-110"
                aria-label="Edit profile"
              >
                <Settings size={16} />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider px-3 mb-2">
            MAIN NAVIGATION
          </div>
          <nav className="space-y-1 mb-6">
            {navItems.map((item) => {
              const isItemActive = isActive(item.path);
              const isHovered = hoveredItem === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    flex items-center px-3 py-2.5 rounded-md transition-all duration-300
                    ${isItemActive
                      ? 'bg-purple-100 text-purple-800 font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                    }
                    ${isHovered && !isItemActive ? 'transform translate-x-1' : ''}
                  `}
                >
                  <span className={`mr-3 transition-colors duration-300 ${isItemActive ? 'text-purple-600' : isHovered ? 'text-purple-500' : ''}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                  {isItemActive && (
                    <ChevronRight size={16} className="ml-auto text-purple-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto mb-4">
            <div className="px-3 py-2 text-xs text-purple-500 font-medium">
              Logged in as a teacher
            </div>
            <button 
              onClick={signOut}
              className="flex items-center w-full px-3 py-2.5 mt-1 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300 hover:shadow-sm group"
            >
              <LogOut size={18} className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
              <span className="group-hover:font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden backdrop-blur-sm transition-all duration-300">
          <div 
            id="mobile-sidebar"
            className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-14 px-4 border-b bg-purple-100">
              <div className="flex items-center space-x-2">
                <Layers size={22} className="text-purple-600" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">MCQGen</h1>
              </div>
              <button 
                onClick={toggleSidebar} 
                className="p-1.5 rounded-full hover:bg-white text-purple-600 hover:text-purple-800 transition-all duration-300 hover:rotate-90"
              >
                <X size={18} />
              </button>
            </div>

            {/* User section - mobile */}
            <div className="px-4 py-3 border-b border-gray-200 bg-purple-50">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium text-sm shadow-sm">
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

            <div className="flex flex-col flex-grow overflow-y-auto bg-gradient-to-b from-white to-purple-50">
              <nav className="flex-1 px-2 py-3 space-y-1">
                {navItems.map((item) => {
                  const isItemActive = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`
                        flex items-center px-3 py-2.5 rounded-md transition-all duration-300
                        ${isItemActive
                          ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                          : 'text-gray-600 hover:bg-purple-50 hover:translate-x-1'
                        }
                      `}
                    >
                      <span className={`mr-3 ${isItemActive ? 'text-purple-600' : ''}`}>
                        {item.icon}
                      </span>
                      {item.name}
                      {isItemActive && (
                        <ChevronRight size={16} className="ml-auto text-purple-600" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-4 py-3 mt-auto border-t">
                <button 
                  onClick={signOut}
                  className="flex items-center w-full px-3 py-2.5 rounded-md font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
                >
                  <LogOut size={18} className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
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