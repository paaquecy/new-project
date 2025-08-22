import React, { useState, useEffect } from 'react';
import { unifiedAPI } from '../lib/unified-api';
import { useData } from '../contexts/DataContext';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialProfile = {
  name: '',
  email: '',
  role: '',
  contact: '',
  department: '',
  badgeNumber: '',
  rank: '',
  address: '',
  profilePicture: ''
};

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | ''>('');
  const { addNotification } = useData();

  // Load current user profile when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserProfile();
    }
  }, [isOpen]);

  const loadUserProfile = async () => {
    try {
      const response = await unifiedAPI.getCurrentUserProfile();
      if (response.data) {
        setProfile({
          name: response.data.full_name || '',
          email: response.data.email || '',
          role: response.data.role || '',
          contact: response.data.phone || '',
          department: response.data.department || '',
          badgeNumber: response.data.badge_number || '',
          rank: response.data.rank || '',
          address: response.data.address || '',
          profilePicture: response.data.profile_picture || ''
        });
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('');

    try {
      const profileData = {
        full_name: profile.name,
        email: profile.email,
        phone: profile.contact,
        badge_number: profile.badgeNumber,
        rank: profile.rank,
        department: profile.department,
        address: profile.address,
        profile_picture: profile.profilePicture
      };

      const response = await unifiedAPI.updateUserProfile(profileData);

      if (response.data) {
        setEditMode(false);
        setSaveStatus('success');

        // Add notification to app state
        addNotification({
          id: Date.now().toString(),
          title: 'Profile Updated',
          message: 'Your profile information has been saved successfully.',
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false,
          system: 'Main App'
        });

        // Clear success message after 3 seconds
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveStatus('error');

      addNotification({
        id: Date.now().toString(),
        title: 'Profile Update Failed',
        message: 'There was an error saving your profile. Please try again.',
        type: 'error',
        timestamp: new Date().toISOString(),
        read: false,
        system: 'Main App'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      alert('New password and confirm password do not match');
      return;
    }

    if (passwords.new.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    setSaving(true);

    try {
      const response = await unifiedAPI.changePassword({
        current_password: passwords.current,
        new_password: passwords.new
      });

      if (response.data) {
        setShowPasswordForm(false);
        setPasswords({ current: '', new: '', confirm: '' });

        addNotification({
          id: Date.now().toString(),
          title: 'Password Changed',
          message: 'Your password has been changed successfully.',
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false,
          system: 'Main App'
        });
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password. Please check your current password and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size must be less than 5MB');
      return;
    }

    setSaving(true);

    try {
      const response = await unifiedAPI.uploadProfilePicture(file);

      if (response.data) {
        setProfile({ ...profile, profilePicture: response.data.profile_picture_url });

        addNotification({
          id: Date.now().toString(),
          title: 'Profile Picture Updated',
          message: 'Your profile picture has been updated successfully.',
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false,
          system: 'Main App'
        });
      } else {
        throw new Error('Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">User Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-4">
          {!showPasswordForm ? (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  {editMode && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="hidden"
                      />
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </label>
                  )}
                </div>
                <div className="text-lg font-semibold text-gray-900 text-center">{profile.name}</div>
                <div className="text-sm text-gray-500">{profile.role}</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-gray-800">{profile.name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-gray-800">{profile.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Contact Number</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="contact"
                      value={profile.contact}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-gray-800">{profile.contact}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Badge Number</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="badgeNumber"
                      value={profile.badgeNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-gray-800">{profile.badgeNumber}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Rank</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="rank"
                        value={profile.rank}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-gray-800">{profile.rank}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="department"
                        value={profile.department}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-gray-800">{profile.department}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                  {editMode ? (
                    <textarea
                      name="address"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    />
                  ) : (
                    <div className="text-gray-800">{profile.address}</div>
                  )}
                </div>
              </div>

              {/* Status Messages */}
              {saveStatus === 'success' && (
                <div className="flex items-center p-2 bg-green-50 border border-green-200 rounded-md mt-4">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-green-700 text-sm">Profile saved successfully!</span>
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded-md mt-4">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">Failed to save profile. Please try again.</span>
                </div>
              )}

              <div className="flex justify-between mt-6">
                {editMode ? (
                  <>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        loadUserProfile(); // Reset changes
                      }}
                      disabled={saving}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                    >
                      Change Password
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Current Password</label>
                <input
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
                <input
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Change Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
