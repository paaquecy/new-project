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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Password change logic here
    setShowPasswordForm(false);
    setPasswords({ current: '', new: '', confirm: '' });
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
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 mb-2">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-lg font-semibold text-gray-900">{profile.name}</div>
                <div className="text-sm text-gray-500">{profile.role}</div>
              </div>
              <div className="space-y-4">
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
              <div className="flex justify-between mt-6">
                {editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Save
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
