import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { unifiedAPI } from '../lib/unified-api';
import { userAccountService } from '../services/userAccountService';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  User,
  Shield,
  Lock
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (app: 'main' | 'dvla' | 'police' | 'supervisor' | null) => void;
  onRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    console.log('Username changed to:', e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    console.log('Password changed');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    console.log('Password visibility toggled to:', !showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }

    // Security audit log
    console.log('Login attempt:', { username, timestamp: new Date().toISOString() });

    try {
      // First check if it's an admin/supervisor login (use email as username)
      let authResult = null;

      // Try admin login first (for backward compatibility with hardcoded admin credentials)
      if (username === '4231220075' && password === 'Wattaddo020') {
        // Hardcoded admin access - redirect to main app
        onLogin('main');
        return;
      }

      if (username === '0203549815' && password === 'Killerman020') {
        // Hardcoded supervisor access
        onLogin('supervisor');
        return;
      }

      // Try database authentication for different account types
      // Try as admin/supervisor first (using email)
      if (username.includes('@') || username === 'admin' || username === 'supervisor') {
        authResult = await userAccountService.authenticateUser({
          username: username.includes('@') ? username : `${username}@platerecognition.gov.gh`,
          password,
          accountType: 'admin'
        });

        if (!authResult) {
          authResult = await userAccountService.authenticateUser({
            username: username.includes('@') ? username : `${username}@platerecognition.gov.gh`,
            password,
            accountType: 'supervisor'
          });
        }
      }

      // If not admin/supervisor, try to determine account type and authenticate
      if (!authResult) {
        // Try DVLA authentication
        if (username === '0987654321' && password === 'Bigfish020') {
          // Backward compatibility for hardcoded DVLA
          onLogin('dvla');
          return;
        }

        authResult = await userAccountService.authenticateUser({
          username,
          password,
          accountType: 'dvla'
        });

        // If DVLA failed, try police
        if (!authResult) {
          if (username === '1234567890' && password === 'Madman020') {
            // Backward compatibility for hardcoded police
            onLogin('police');
            return;
          }

          authResult = await userAccountService.authenticateUser({
            username,
            password,
            accountType: 'police'
          });
        }
      }

      if (authResult && authResult.success) {
        console.log('Database authentication successful:', {
          accountType: authResult.user.account_type,
          userId: authResult.user.id,
          timestamp: new Date().toISOString()
        });

        // Store user info in session storage for the app
        sessionStorage.setItem('currentUser', JSON.stringify({
          id: authResult.user.id,
          name: `${authResult.user.first_name} ${authResult.user.last_name}`,
          email: authResult.user.email,
          accountType: authResult.user.account_type,
          username: authResult.user.account_type === 'police'
            ? authResult.user.badge_number
            : authResult.user.id_number || authResult.user.email
        }));

        // Route to appropriate application based on account type
        switch (authResult.user.account_type) {
          case 'admin':
            onLogin('main');
            break;
          case 'supervisor':
            onLogin('supervisor');
            break;
          case 'dvla':
            onLogin('dvla');
            break;
          case 'police':
            onLogin('police');
            break;
          default:
            throw new Error('Unknown account type');
        }
        return;
      }

      // If all authentication methods failed
      console.warn('Unauthorized login attempt:', { username, timestamp: new Date().toISOString() });
      alert('Access Denied: Invalid credentials or account not approved.\n\nPlease check your username and password, or contact your system administrator if your account is pending approval.');

    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again or contact support if the problem persists.');
    }
  };

  const handleRegisterClick = () => {
    console.log('Register link clicked');
    onRegister();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-['Inter']">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Main Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600 mr-2" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Login to Plate Recognition System
            </h2>
            <p className="text-sm text-gray-600">
              Secure access for authorized personnel
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username / ID
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Badge Number (Police) / ID Number (DVLA)"
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center group"
            >
              Login
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Informative Text */}
          <div className="mt-4 sm:mt-6 space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <Info size={16} className="mr-2 text-blue-500" />
              <span>Passwords are case-sensitive.</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Info size={16} className="mr-2 text-yellow-500" />
              <span>Account locks after 5 failed attempts.</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Info size={16} className="mr-2 text-red-500" />
              <span>Session expires after 30 minutes of inactivity.</span>
            </div>
          </div>

          {/* Registration Link */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm text-gray-600">
              New user?{' '}
              <button
                onClick={handleRegisterClick}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
        
        {/* Footer */}
      </div>
    </div>
  );
};

export default LoginPage;
