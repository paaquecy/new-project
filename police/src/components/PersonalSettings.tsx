import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Settings, 
  Save,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const PersonalSettings = () => {
  // Profile Settings State
  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@police.gov',
    badgeNumber: 'B001',
    rank: 'Officer',
    department: 'Traffic Division',
    phone: '+1 (555) 123-4567',
    address: '123 Police Station Rd, City, State 12345'
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    violationAlerts: true,
    systemUpdates: false,
    weeklyReports: true,
    emergencyAlerts: true
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAlerts: true
  });

  // System Preferences State
  const [systemPreferences, setSystemPreferences] = useState({
    theme: 'light',
    language: 'english',
    timezone: 'EST',
    dateFormat: 'MM/DD/YYYY',
    autoSave: true,
    soundEffects: true
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSystemChange = (field, value) => {
    setSystemPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setSaveStatus('');

    // Simulate save process
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    }, 2000);
  };

  const handleChangeProfilePhoto = () => {
    alert('Profile photo change feature would open camera/file picker here');
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Profile Information Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6 lg:mb-8 flex items-center">
            <User className="w-5 lg:w-6 h-5 lg:h-6 mr-2 lg:mr-3 text-blue-600" />
            Profile Information
          </h3>
          
          {/* Profile Photo Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="w-20 lg:w-24 h-20 lg:h-24 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-10 lg:w-12 h-10 lg:h-12 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-base lg:text-lg font-semibold text-gray-800 mb-2">Profile Photo</h4>
              <button
                onClick={handleChangeProfilePhoto}
                className="inline-flex items-center px-3 lg:px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Camera className="w-3 lg:w-4 h-3 lg:h-4 mr-2" />
                Change Photo
              </button>
            </div>
          </div>

          <div className="space-y-4 lg:space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => handleProfileChange('fullName', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
              />
            </div>

            {/* Badge Number */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Badge Number
              </label>
              <input
                type="text"
                value={profileData.badgeNumber}
                onChange={(e) => handleProfileChange('badgeNumber', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
              />
            </div>

            {/* Rank and Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-2">
                <label className="block text-sm lg:text-base font-medium text-gray-700">
                  Rank
                </label>
                <input
                  type="text"
                  value={profileData.rank}
                  onChange={(e) => handleProfileChange('rank', e.target.value)}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm lg:text-base font-medium text-gray-700">
                  Department
                </label>
                <input
                  type="text"
                  value={profileData.department}
                  onChange={(e) => handleProfileChange('department', e.target.value)}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Address
              </label>
              <textarea
                value={profileData.address}
                onChange={(e) => handleProfileChange('address', e.target.value)}
                rows={3}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-colors duration-200 text-sm lg:text-base"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6 lg:mb-8 flex items-center">
            <Bell className="w-5 lg:w-6 h-5 lg:h-6 mr-2 lg:mr-3 text-blue-600" />
            Notification Settings
          </h3>
          
          <div className="space-y-4 lg:space-y-6">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2 lg:py-3">
                <div>
                  <h4 className="text-sm lg:text-base font-medium text-gray-800">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-600 mt-1">
                    {key === 'emailNotifications' && 'Receive notifications via email'}
                    {key === 'pushNotifications' && 'Receive push notifications on your device'}
                    {key === 'violationAlerts' && 'Get alerts for new violations'}
                    {key === 'systemUpdates' && 'Notifications about system updates'}
                    {key === 'weeklyReports' && 'Weekly activity summary reports'}
                    {key === 'emergencyAlerts' && 'Critical emergency notifications'}
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange(key)}
                  className={`relative inline-flex h-5 lg:h-6 w-9 lg:w-11 items-center rounded-full transition-colors duration-200 ${
                    value ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 lg:h-4 w-3 lg:w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      value ? 'translate-x-5 lg:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Settings and System Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Security Settings Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6 lg:mb-8 flex items-center">
            <Shield className="w-5 lg:w-6 h-5 lg:h-6 mr-2 lg:mr-3 text-blue-600" />
            Security Settings
          </h3>
          
          <div className="space-y-4 lg:space-y-6">
            {/* Change Password Section */}
            <div className="space-y-4">
              <h4 className="text-base lg:text-lg font-semibold text-gray-800">Change Password</h4>
              
              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm lg:text-base font-medium text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    value={securitySettings.currentPassword}
                    onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 pr-10 lg:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? (
                      <EyeOff className="w-4 lg:w-5 h-4 lg:h-5" />
                    ) : (
                      <Eye className="w-4 lg:w-5 h-4 lg:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm lg:text-base font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={securitySettings.newPassword}
                    onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 pr-10 lg:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? (
                      <EyeOff className="w-4 lg:w-5 h-4 lg:h-5" />
                    ) : (
                      <Eye className="w-4 lg:w-5 h-4 lg:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm lg:text-base font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={securitySettings.confirmPassword}
                    onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 pr-10 lg:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? (
                      <EyeOff className="w-4 lg:w-5 h-4 lg:h-5" />
                    ) : (
                      <Eye className="w-4 lg:w-5 h-4 lg:h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between py-2 lg:py-3 border-t border-gray-200">
              <div>
                <h4 className="text-sm lg:text-base font-medium text-gray-800">Two-Factor Authentication</h4>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">Add an extra layer of security</p>
              </div>
              <button
                onClick={() => handleSecurityChange('twoFactorAuth', !securitySettings.twoFactorAuth)}
                className={`relative inline-flex h-5 lg:h-6 w-9 lg:w-11 items-center rounded-full transition-colors duration-200 ${
                  securitySettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3 lg:h-4 w-3 lg:w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    securitySettings.twoFactorAuth ? 'translate-x-5 lg:translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Session Timeout */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Session Timeout (minutes)
              </label>
              <select
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            {/* Login Alerts */}
            <div className="flex items-center justify-between py-2 lg:py-3">
              <div>
                <h4 className="text-sm lg:text-base font-medium text-gray-800">Login Alerts</h4>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">Get notified of new login attempts</p>
              </div>
              <button
                onClick={() => handleSecurityChange('loginAlerts', !securitySettings.loginAlerts)}
                className={`relative inline-flex h-5 lg:h-6 w-9 lg:w-11 items-center rounded-full transition-colors duration-200 ${
                  securitySettings.loginAlerts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3 lg:h-4 w-3 lg:w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    securitySettings.loginAlerts ? 'translate-x-5 lg:translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* System Preferences Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6 lg:mb-8 flex items-center">
            <Settings className="w-5 lg:w-6 h-5 lg:h-6 mr-2 lg:mr-3 text-blue-600" />
            System Preferences
          </h3>
          
          <div className="space-y-4 lg:space-y-6">
            {/* Theme */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Theme
              </label>
              <select
                value={systemPreferences.theme}
                onChange={(e) => handleSystemChange('theme', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Language
              </label>
              <select
                value={systemPreferences.language}
                onChange={(e) => handleSystemChange('language', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
              </select>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Timezone
              </label>
              <select
                value={systemPreferences.timezone}
                onChange={(e) => handleSystemChange('timezone', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
              >
                <option value="EST">Eastern Time (EST)</option>
                <option value="CST">Central Time (CST)</option>
                <option value="MST">Mountain Time (MST)</option>
                <option value="PST">Pacific Time (PST)</option>
              </select>
            </div>

            {/* Date Format */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Date Format
              </label>
              <select
                value={systemPreferences.dateFormat}
                onChange={(e) => handleSystemChange('dateFormat', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            {/* Auto Save */}
            <div className="flex items-center justify-between py-2 lg:py-3">
              <div>
                <h4 className="text-sm lg:text-base font-medium text-gray-800">Auto Save</h4>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">Automatically save form data</p>
              </div>
              <button
                onClick={() => handleSystemChange('autoSave', !systemPreferences.autoSave)}
                className={`relative inline-flex h-5 lg:h-6 w-9 lg:w-11 items-center rounded-full transition-colors duration-200 ${
                  systemPreferences.autoSave ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3 lg:h-4 w-3 lg:w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    systemPreferences.autoSave ? 'translate-x-5 lg:translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between py-2 lg:py-3">
              <div>
                <h4 className="text-sm lg:text-base font-medium text-gray-800">Sound Effects</h4>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">Enable system sound effects</p>
              </div>
              <button
                onClick={() => handleSystemChange('soundEffects', !systemPreferences.soundEffects)}
                className={`relative inline-flex h-5 lg:h-6 w-9 lg:w-11 items-center rounded-full transition-colors duration-200 ${
                  systemPreferences.soundEffects ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3 lg:h-4 w-3 lg:w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    systemPreferences.soundEffects ? 'translate-x-5 lg:translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base lg:text-lg font-semibold text-gray-800">Save Changes</h4>
            <p className="text-sm text-gray-600">Make sure to save your changes before leaving this page.</p>
          </div>
          
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`w-full sm:w-auto flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-semibold transition-colors duration-200 text-sm lg:text-base ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : saveStatus === 'success'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 lg:h-5 w-4 lg:w-5 border-b-2 border-white mr-2 lg:mr-3"></div>
                Saving...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
                Settings Saved Successfully!
              </>
            ) : (
              <>
                <Save className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
                Save All Settings
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {saveStatus === 'success' && (
          <div className="flex items-center p-3 lg:p-4 bg-green-50 border border-green-200 rounded-lg mt-4">
            <CheckCircle className="w-4 lg:w-5 h-4 lg:h-5 text-green-500 mr-2 lg:mr-3" />
            <span className="text-green-700 font-medium text-sm lg:text-base">
              All settings have been saved successfully!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalSettings;