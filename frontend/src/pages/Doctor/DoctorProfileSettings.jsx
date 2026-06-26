import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useGlobalLoading } from '../../context/GlobalLoadingContext';
import { theme } from '../../utils/theme';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import LocationPicker from '../../components/LocationPicker';

const DoctorProfileSettings = () => {
  const { user, setUser } = useContext(AuthContext);
  const { startLoading, stopLoading } = useGlobalLoading();
  const [activeTab, setActiveTab] = useState('professional'); // 'professional' or 'account'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    qualification: '',
    experience: '',
    feeMin: '',
    feeMax: '',
    clinicName: '',
    medicalRegistrationNumber: '',
    consultationMode: [], // array of modes
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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007';
      const { data } = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFormData({
        name: data.user.name || '',
        email: data.user.email || '',
        qualification: data.profile?.qualification || '',
        experience: data.profile?.experience || '',
        feeMin: data.profile?.feeRange?.min || '',
        feeMax: data.profile?.feeRange?.max || '',
        clinicName: data.profile?.clinicName || '',
        medicalRegistrationNumber: data.profile?.medicalRegistrationNumber || '',
        consultationMode: Array.isArray(data.profile?.consultationMode) ? data.profile.consultationMode : ['Video'],
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

  const handleModeChange = (mode) => {
    const currentModes = Array.isArray(formData.consultationMode) ? formData.consultationMode : [];
    const newModes = currentModes.includes(mode)
      ? currentModes.filter(m => m !== mode)
      : [...currentModes, mode];
    setFormData({ ...formData, consultationMode: newModes });
  };

  const handleProfessionalSubmit = async (e) => {
    e.preventDefault();
    try {
      startLoading('Saving changes...');
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      
      const form = new FormData();
      form.append('name', formData.name);
      form.append('qualification', formData.qualification);
      form.append('experience', formData.experience);
      form.append('feeMin', formData.feeMin);
      form.append('feeMax', formData.feeMax);
      form.append('clinicName', formData.clinicName);
      form.append('medicalRegistrationNumber', formData.medicalRegistrationNumber);
      
      if (formData.location) {
        form.append('location', JSON.stringify(formData.location));
      }
      
      formData.consultationMode.forEach(mode => form.append('consultationMode[]', mode));

      if (selectedFile) {
        form.append('profileImage', selectedFile);
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007';
      console.log('Sending PUT to:', `${API_URL}/api/profile`);
      console.log('FormData:', Object.fromEntries(form.entries()));
      
      const { data } = await axios.put(`${API_URL}/api/profile`, form, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Update Success:', data);
      
      setUser(data.user);
      toast.success('Professional profile updated!');
    } catch (error) {
      console.error('Submit Error:', error);
      if (error.response) console.error('Error Response:', error.response.data);
      toast.error(error.response?.data?.message || error.message || 'Update failed');
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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007';
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
    const fields = [formData.name, formData.qualification, formData.experience, formData.feeMin, formData.clinicName, formData.location, formData.medicalRegistrationNumber, imagePreview];
    const filled = fields.filter(f => f && f.toString().trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <h2 className={`text-3xl font-bold ${theme.textPrimary}`}>Doctor Profile Settings</h2>

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
            <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Dr. {formData.name || 'Your Name'}</h3>
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
          onClick={() => setActiveTab('professional')}
          className={`pb-3 font-semibold px-2 border-b-2 transition ${activeTab === 'professional' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Professional Information
        </button>
        <button 
          onClick={() => setActiveTab('account')}
          className={`pb-3 font-semibold px-2 border-b-2 transition ${activeTab === 'account' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Account Settings
        </button>
      </div>

      {activeTab === 'professional' && (
        <form onSubmit={handleProfessionalSubmit} className={`${theme.card} p-6 rounded-2xl space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Full Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Email (Cannot be changed)</label>
              <input type="email" disabled value={formData.email} className="w-full bg-background opacity-50 border border-border rounded-lg px-4 py-2 cursor-not-allowed" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Qualification</label>
              <input type="text" required placeholder="e.g. MBBS, MD" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Years of Experience</label>
              <input type="number" required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Medical Reg. Number</label>
              <input type="text" required value={formData.medicalRegistrationNumber} onChange={e => setFormData({...formData, medicalRegistrationNumber: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Min Fee ($)</label>
                <input type="number" required value={formData.feeMin} onChange={e => setFormData({...formData, feeMin: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Max Fee ($)</label>
                <input type="number" required value={formData.feeMax} onChange={e => setFormData({...formData, feeMax: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Clinic Name</label>
              <input type="text" required value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Clinic Location</label>
              <LocationPicker 
                location={formData.location} 
                onLocationChange={(loc) => setFormData({...formData, location: loc})} 
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm mb-2 ${theme.textSecondary}`}>Consultation Modes</label>
              <div className="flex gap-4">
                {['Video', 'Audio', 'Chat', 'In-Person'].map(mode => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.consultationMode.includes(mode)} 
                      onChange={() => handleModeChange(mode)}
                      className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-[var(--color-theme-primary)]" 
                    />
                    <span className={theme.textPrimary}>{mode}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-border">
            <button type="submit" className={`px-6 py-2 rounded-lg font-semibold ${theme.buttonPrimary}`}>
              Save Professional Profile
            </button>
          </div>
        </form>
      )}

      {activeTab === 'account' && (
        <form onSubmit={handlePasswordSubmit} className={`${theme.card} p-6 rounded-2xl space-y-4 max-w-md`}>
          <h3 className={`text-xl font-semibold mb-4 ${theme.textPrimary}`}>Change Password</h3>
          <div>
            <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Current Password</label>
            <input type="password" required value={passwordData.oldPassword} onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${theme.textSecondary}`}>New Password</label>
            <input type="password" required value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${theme.textSecondary}`}>Confirm New Password</label>
            <input type="password" required value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
          </div>
          <div className="pt-4">
            <button type="submit" className={`w-full py-2 rounded-lg font-semibold ${theme.buttonPrimary}`}>
              Update Password
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DoctorProfileSettings;
