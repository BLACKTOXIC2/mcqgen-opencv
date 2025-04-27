import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ClassesPage = lazy(() => import('./pages/ClassesPage'));
const StudentsPage = lazy(() => import('./pages/StudentsPage'));
const StudentAnalyticsPage = lazy(() => import('./pages/StudentAnalyticsPage'));
const McqsPage = lazy(() => import('./pages/McqsPage'));
const McqCreatePage = lazy(() => import('./pages/McqCreatePage'));
const McqViewPage = lazy(() => import('./pages/McqViewPage'));
const McqEditPage = lazy(() => import('./pages/McqEditPage'));
const TestCheckingPage = lazy(() => import('./pages/TestCheckingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [user, loading, navigate, location.pathname]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/classes" 
          element={
            <ProtectedRoute>
              <ClassesPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/students" 
          element={
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/students/:id/analytics" 
          element={
            <ProtectedRoute>
              <StudentAnalyticsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mcqs" 
          element={
            <ProtectedRoute>
              <McqsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mcqs/create" 
          element={
            <ProtectedRoute>
              <McqCreatePage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/mcqs/edit/:id" 
          element={
            <ProtectedRoute>
              <McqEditPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/mcqs/:id" 
          element={
            <ProtectedRoute>
              <McqViewPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tests/check" 
          element={
            <ProtectedRoute>
              <TestCheckingPage />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;