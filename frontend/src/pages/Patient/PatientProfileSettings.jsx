import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useGlobalLoading } from '../../context/GlobalLoadingContext';
import { theme } from '../../utils/theme';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import LocationPicker from '../../components/LocationPicker';
import DeleteAccountModal from '../../components/DeleteAccountModal';

const PatientProfileSettings = () => {
  const { user, setUser } = useContext(AuthContext);
  const { startLoading, stopLoading } = useGlobalLoading();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'account'
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'Other',
    contactNumber: '',
    emergencyContact: '',
    hairConcerns: '', // comma separated string for UI
    preferredMode: 'Video',
    location: null
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      startLoading('Loading profile...');
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006';
      const { data } = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData({
        name: data.user.name || '',
        email: data.user.email || '',
        age: data.profile?.age || '',
        gender: data.profile?.gender || 'Other',
        contactNumber: data.profile?.contactNumber || '',
        emergencyContact: data.profile?.emergencyContact || '',
        hairConcerns: data.profile?.hairConcerns?.join(', ') || '',
        preferredMode: data.profile?.preferredMode || 'Video',
        location: data.user.location?.coordinates?.[0] !== 0 ? {
          latitude: data.user.location.coordinates[1],
          longitude: data.user.location.coordinates[0],
          formattedAddress: data.user.location.formattedAddress,
          address: data.user.location.address,
          city: data.user.location.city,
          state: data.user.location.state,
          country: data.user.location.country,
          pincode: data.user.location.pincode,
          placeId: data.user.location.placeId
        } : null
      });
      setImagePreview(data.user.profileImage || '');
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      stopLoading();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    try {
      startLoading('Saving changes...');
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;

      const form = new FormData();
      form.append('name', formData.name);
      form.append('age', formData.age);
      form.append('gender', formData.gender);
      form.append('contactNumber', formData.contactNumber);
      form.append('emergencyContact', formData.emergencyContact);
      form.append('preferredMode', formData.preferredMode);

      if (formData.location) {
        form.append('location', JSON.stringify(formData.location));
      }

      // Convert comma separated string back to array
      const concernsArray = formData.hairConcerns.split(',').map(s => s.trim()).filter(s => s);
      concernsArray.forEach(concern => form.append('hairConcerns[]', concern));

      if (selectedFile) {
        form.append('profileImage', selectedFile);
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006';
      const { data } = await axios.put(`${API_URL}/api/profile`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUser(data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      stopLoading();
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      startLoading('Updating password...');
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006';
      await axios.put(`${API_URL}/api/profile/password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Password updated successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed');
    } finally {
      stopLoading();
    }
  };

  const calculateCompletion = () => {
    const fields = [formData.name, formData.age, formData.gender, formData.contactNumber, formData.location, formData.emergencyContact, formData.hairConcerns, imagePreview];
    const filled = fields.filter(f => f && f.toString().trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <h2 className={`text-3xl font-bold ${theme.textPrimary}`}>Profile Settings</h2>

      <div className={`${theme.card} p-6 rounded-2xl`}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary bg-background flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className={`text-4xl ${theme.textSecondary}`}>?</span>
              )}
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition">
              <label className="cursor-pointer text-primary-foreground text-xs font-semibold">
                Change
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className={`text-xl font-bold ${theme.textPrimary}`}>{formData.name || 'Your Name'}</h3>
            <p className={`${theme.textSecondary}`}>{user?.email}</p>
            <div className="mt-3 w-full bg-background rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${calculateCompletion()}%` }}></div>
            </div>
            <p className={`text-xs mt-1 ${theme.textSecondary}`}>Profile completion: {calculateCompletion()}%</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('personal')}
          className={`pb-3 font-semibold px-2 border-b-2 transition ${activeTab === 'personal' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Personal Information
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`pb-3 font-semibold px-2 border-b-2 transition ${activeTab === 'account' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Account Settings
        </button>
      </div>

      {activeTab === 'personal' && (
        <form onSubmit={handlePersonalSubmit} className={`${theme.card} p-6 rounded-2xl space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Full Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Email (Cannot be changed)</label>
              <input type="email" disabled value={formData.email} className="w-full bg-background opacity-50 border border-border rounded-lg px-4 py-2 cursor-not-allowed" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Age</label>
              <input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Gender</label>
              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Contact Number</label>
              <input type="text" value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Emergency Contact</label>
              <input type="text" value={formData.emergencyContact} onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Location</label>
              <LocationPicker
                location={formData.location}
                onLocationChange={(loc) => setFormData({ ...formData, location: loc })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Hair Concerns (comma separated)</label>
              <input type="text" placeholder="e.g. Hair fall, Dandruff" value={formData.hairConcerns} onChange={e => setFormData({ ...formData, hairConcerns: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Preferred Consultation Mode</label>
              <select value={formData.preferredMode} onChange={e => setFormData({ ...formData, preferredMode: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary">
                <option value="Video">Video</option>
                <option value="Audio">Audio</option>
                <option value="Chat">Chat</option>
                <option value="In-Person">In-Person</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-border">
            <button type="submit" className={`px-6 py-2 rounded-lg font-semibold ${theme.buttonPrimary}`}>
              Save Changes
            </button>
          </div>
        </form>
      )}

      {activeTab === 'account' && (
        <form onSubmit={handlePasswordSubmit} className={`${theme.card} p-6 rounded-2xl space-y-4 max-w-md`}>
          <h3 className={`text-xl font-semibold mb-4 ${theme.textPrimary}`}>Change Password</h3>
          <div>
            <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Current Password</label>
            <input type="password" required value={passwordData.oldPassword} onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${theme.textSecondary}`}>New Password</label>
            <input type="password" required value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Confirm New Password</label>
            <input type="password" required value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
          </div>
          <div className="pt-4">
            <button type="submit" className={`w-full py-2 rounded-lg font-semibold bg-primary text-primary-foreground hover:opacity-90 transition shadow-sm`}>
              Update Password
            </button>
          </div>
          
          <div className="pt-8 border-t border-border mt-8">
            <h4 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h4>
            <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button 
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-destructive/20 transition font-semibold"
            >
              Delete My Account
            </button>
          </div>
        </form>
      )}

      <DeleteAccountModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
      />
    </div>
  );
};

export default PatientProfileSettings;
