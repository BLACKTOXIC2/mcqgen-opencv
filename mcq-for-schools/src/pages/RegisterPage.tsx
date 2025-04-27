import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, Brain, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();
  const password = watch('password');
  
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await signUp(data.email, data.password);
      
      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute inset-0 bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Logo and app name */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <Link to="/" className="flex items-center justify-center gap-2">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-purple-600/20 blur-sm"></div>
            <Brain className="relative h-8 w-8 text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-purple-600">MCQGen</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          className="bg-white py-8 px-10 shadow-xl sm:rounded-xl border border-gray-100"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {error && (
            <motion.div 
              className="mb-6 rounded-lg bg-red-50 p-4 border border-red-100"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </motion.div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                id="name"
                type="text"
                label="Full name"
                icon={<User className="h-5 w-5 text-gray-400" />}
                error={errors.name?.message}
                className="rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                {...register('name', { 
                  required: 'Name is required'
                })}
              />
            </div>
            
            <div>
              <Input
                id="email"
                type="email"
                label="Email address"
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                error={errors.email?.message}
                className="rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                {...register('email', { 
                  required: 'Email is required', 
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </div>

            <div>
              <Input
                id="password"
                type="password"
                label="Password"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                error={errors.password?.message}
                className="rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
            </div>
            
            <div>
              <Input
                id="confirmPassword"
                type="password"
                label="Confirm password"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                error={errors.confirmPassword?.message}
                className="rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
              />
            </div>

            <div className="pt-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg shadow-lg shadow-purple-600/20 transition-all"
                >
                  {isLoading ? 'Creating account...' : (
                    <span className="flex items-center justify-center">
                      Create account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </div>
            
            <p className="mt-2 text-xs text-center text-gray-500">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-purple-600 hover:text-purple-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-purple-600 hover:text-purple-500">
                Privacy Policy
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}