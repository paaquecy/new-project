import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Lock,
  ChevronDown,
  Upload,
  Camera,
  Save,
  Edit
} from 'lucide-react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, label }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm font-medium transition-colors duration-200 ${
        darkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

const Settings: React.FC = () => {
  const { darkMode, setDarkMode: setGlobalDarkMode } = useTheme();
  const [activeSubMenu, setActiveSubMenu] = useState('general');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('GMT+0:00 London');
  const [dataExportFormat, setDataExportFormat] = useState('CSV');
  const [automatedBackups, setAutomatedBackups] = useState(true);
  
  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState({
    registrationExpiration: true,
    systemUpdates: true,
    securityAlerts: false
  });
  
  const [inAppNotifications, setInAppNotifications] = useState({
    newRegistrations: true,
    renewalStatusChanges: true,
    complianceIssues: false
  });

  // Security Settings State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  // Profile state
  const { user, updateProfile, changePassword, isLoading } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const subMenuItems = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  const languageOptions = ['English', 'Spanish', 'French', 'German', 'Portuguese'];
  const timezoneOptions = [
    'GMT+0:00 London',
    'GMT+1:00 Paris',
    'GMT+2:00 Berlin',
    'GMT-5:00 New York',
    'GMT-8:00 Los Angeles'
  ];
  const exportFormatOptions = ['CSV', 'Excel', 'JSON', 'PDF'];

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleSaveChanges = () => {
    console.log('Saving changes:', {
      language,
      timezone,
      dataExportFormat,
      darkMode,
      automatedBackups,
      emailNotifications,
      inAppNotifications,
      twoFactorAuth
    });
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMessage('');

    try {
      const result = await updateProfile({
        full_name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone
      });

      if (result.success) {
        setIsEditingProfile(false);
        setProfileMessage('Profile updated successfully!');
        setTimeout(() => setProfileMessage(''), 3000);
      } else {
        setProfileMessage(result.message || 'Failed to update profile');
      }
    } catch (error) {
      setProfileMessage('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setPasswordMessage('New passwords do not match');
      return;
    }

    if (passwordData.new.length < 6) {
      setPasswordMessage('New password must be at least 6 characters');
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage('');

    try {
      const result = await changePassword(passwordData.current, passwordData.new);

      if (result.success) {
        setPasswordData({ current: '', new: '', confirm: '' });
        setPasswordMessage('Password changed successfully!');
        setTimeout(() => setPasswordMessage(''), 3000);
      } else {
        setPasswordMessage(result.message || 'Failed to change password');
      }
    } catch (error) {
      setPasswordMessage('Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleProfileCancel = () => {
    if (user) {
      setProfileData({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    setIsEditingProfile(false);
    setProfileMessage('');
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setGlobalDarkMode(enabled);
  };
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* General Settings Section */}
      <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-lg font-semibold mb-6 transition-colors duration-200 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>General Settings</h3>
        
        <div className="space-y-6">
          {/* Language */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Language
            </label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {languageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className={`absolute right-3 top-3 pointer-events-none transition-colors duration-200 ${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              }`} size={20} />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Timezone
            </label>
            <div className="relative">
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {timezoneOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className={`absolute right-3 top-3 pointer-events-none transition-colors duration-200 ${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              }`} size={20} />
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div>
            <ToggleSwitch
              enabled={darkMode}
              onChange={handleDarkModeToggle}
              label="Enable Dark Mode"
            />
          </div>
        </div>
      </div>

      {/* Data Preferences Section */}
      <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-lg font-semibold mb-6 transition-colors duration-200 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>Data Preferences</h3>
        
        <div className="space-y-6">
          {/* Data Export Format */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Data Export Format
            </label>
            <div className="relative">
              <select
                value={dataExportFormat}
                onChange={(e) => setDataExportFormat(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {exportFormatOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className={`absolute right-3 top-3 pointer-events-none transition-colors duration-200 ${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              }`} size={20} />
            </div>
          </div>

          {/* Automated Backups Toggle */}
          <div>
            <ToggleSwitch
              enabled={automatedBackups}
              onChange={setAutomatedBackups}
              label="Enable daily backups"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      {/* Profile Information Section */}
      <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-semibold transition-colors duration-200 ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>Profile Information</h3>
          <button
            onClick={() => isEditingProfile ? handleProfileCancel() : setIsEditingProfile(true)}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isEditingProfile
                ? `border ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`
                : `bg-blue-600 text-white hover:bg-blue-700`
            }`}
          >
            {isEditingProfile ? (
              <>
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit size={16} />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>

        {profileMessage && (
          <div className={`mb-6 p-3 rounded-lg text-sm ${
            profileMessage.includes('success')
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {profileMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Full Name
            </label>
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              readOnly={!isEditingProfile}
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                isEditingProfile
                  ? `focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`
                  : `cursor-not-allowed ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-600'
                    }`
              }`}
            />
          </div>

          {/* Email Address */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              readOnly={!isEditingProfile}
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                isEditingProfile
                  ? `focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`
                  : `cursor-not-allowed ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-600'
                    }`
              }`}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              readOnly={!isEditingProfile}
              placeholder={isEditingProfile ? "Enter your phone number" : ""}
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                isEditingProfile
                  ? `focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`
                  : `cursor-not-allowed ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-600'
                    }`
              }`}
            />
          </div>

          {/* Save Button */}
          {isEditingProfile && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{profileSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Section */}
      <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-lg font-semibold mb-6 transition-colors duration-200 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>Change Password</h3>

        {passwordMessage && (
          <div className={`mb-6 p-3 rounded-lg text-sm ${
            passwordMessage.includes('success')
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {passwordMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Current Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              placeholder="Enter your current password"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* New Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              New Password
            </label>
            <input
              type="password"
              value={passwordData.new}
              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              placeholder="Enter your new password"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              placeholder="Confirm your new password"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Change Password Button */}
          {(passwordData.current || passwordData.new || passwordData.confirm) && (
            <div className="flex justify-end">
              <button
                onClick={handlePasswordChange}
                disabled={passwordSaving || !passwordData.current || !passwordData.new || !passwordData.confirm}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock size={16} />
                <span>{passwordSaving ? 'Changing...' : 'Change Password'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Picture</h3>
        
        <div className="space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Picture
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 mb-2">
                Drag and drop an image here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: JPG, PNG (Max 5MB)
              </p>
            </div>
          </div>

          {/* Current Profile Picture Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                <User className="text-white" size={32} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">John Doe</p>
                <p className="text-xs text-gray-500">Administrator</p>
                <button className="mt-2 inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200">
                  <Camera size={14} />
                  <span>Change Picture</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {/* Email Notifications Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Notifications</h3>
        <p className="text-sm text-gray-600 mb-6">Control which email notifications you receive.</p>
        
        <div className="space-y-6">
          {/* Registration Expiration Alerts */}
          <div>
            <ToggleSwitch
              enabled={emailNotifications.registrationExpiration}
              onChange={(enabled) => setEmailNotifications(prev => ({ ...prev, registrationExpiration: enabled }))}
              label="Registration Expiration Alerts"
            />
          </div>

          {/* System Updates and Announcements */}
          <div>
            <ToggleSwitch
              enabled={emailNotifications.systemUpdates}
              onChange={(enabled) => setEmailNotifications(prev => ({ ...prev, systemUpdates: enabled }))}
              label="System Updates and Announcements"
            />
          </div>

          {/* Security Alerts */}
          <div>
            <ToggleSwitch
              enabled={emailNotifications.securityAlerts}
              onChange={(enabled) => setEmailNotifications(prev => ({ ...prev, securityAlerts: enabled }))}
              label="Security Alerts"
            />
          </div>
        </div>
      </div>

      {/* In-App Notifications Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">In-App Notifications</h3>
        <p className="text-sm text-gray-600 mb-6">Manage notifications within the application.</p>
        
        <div className="space-y-6">
          {/* New Vehicle Registrations */}
          <div>
            <ToggleSwitch
              enabled={inAppNotifications.newRegistrations}
              onChange={(enabled) => setInAppNotifications(prev => ({ ...prev, newRegistrations: enabled }))}
              label="New Vehicle Registrations"
            />
          </div>

          {/* Renewal Status Changes */}
          <div>
            <ToggleSwitch
              enabled={inAppNotifications.renewalStatusChanges}
              onChange={(enabled) => setInAppNotifications(prev => ({ ...prev, renewalStatusChanges: enabled }))}
              label="Renewal Status Changes"
            />
          </div>

          {/* Compliance Issues */}
          <div>
            <ToggleSwitch
              enabled={inAppNotifications.complianceIssues}
              onChange={(enabled) => setInAppNotifications(prev => ({ ...prev, complianceIssues: enabled }))}
              label="Compliance Issues"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      {/* Password & Authentication Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Password & Authentication</h3>
        
        <div className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Two-Factor Authentication */}
          <div>
            <ToggleSwitch
              enabled={twoFactorAuth}
              onChange={setTwoFactorAuth}
              label="Enable Two-Factor Authentication"
            />
          </div>
        </div>
      </div>

      {/* Account Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Activity</h3>
        
        <div className="space-y-4">
          {/* Activity Item 1 */}
          <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-b-0">
            <span className="text-gray-700">Logged in from Chrome on Windows</span>
            <span className="text-sm text-gray-500">2023-10-26 10:30 AM</span>
          </div>

          {/* Activity Item 2 */}
          <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-b-0">
            <span className="text-gray-700">Password changed</span>
            <span className="text-sm text-gray-500">2023-10-20 03:15 PM</span>
          </div>

          {/* Activity Item 3 */}
          <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-b-0">
            <span className="text-gray-700">Logged in from Safari on macOS</span>
            <span className="text-sm text-gray-500">2023-10-19 09:00 AM</span>
          </div>

          {/* Activity Item 4 */}
          <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-b-0">
            <span className="text-gray-700">Profile updated</span>
            <span className="text-sm text-gray-500">2023-10-15 01:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSubMenu) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'general':
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className={`p-8 transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-200 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}></h1>
        <p className={`text-sm sm:text-base transition-colors duration-200 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}></p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Sub-Navigation Panel */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className={`rounded-xl border p-4 transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <nav className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:space-y-2">
              {subMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSubMenu === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSubMenu(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : `${darkMode 
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-gray-100' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium text-sm sm:text-base">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Settings Options Panel */}
        <div className="flex-1">
          <div className="min-h-[400px] sm:min-h-[600px]">
            {renderContent()}
          </div>

          {/* Save Changes Button */}
          {(activeSubMenu === 'general' || activeSubMenu === 'notifications' || activeSubMenu === 'security') && (
            <div className="mt-6 sm:mt-8 flex justify-center sm:justify-end">
              <button
                onClick={handleSaveChanges}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
