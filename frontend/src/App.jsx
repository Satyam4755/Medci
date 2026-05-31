import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import PatientHome from './pages/Patient/PatientHome';
import ExploreDoctors from './pages/Patient/ExploreDoctors';
import RaiseRequest from './pages/Patient/RaiseRequest';
import Appointments from './pages/Patient/Appointments';

// Doctor Pages
import DoctorHome from './pages/Doctor/DoctorHome';
import LiveRequests from './pages/Doctor/LiveRequests';
 
// Admin Pages
const AdminHome = () => <Layout><div className="text-white text-2xl">Admin Dashboard Coming Soon</div></Layout>;

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Patient Routes */}
        <Route path="/patient" element={<ProtectedRoute allowedRoles={['Patient']}><Navigate to="/patient/home" replace /></ProtectedRoute>} />
        <Route path="/patient/home" element={<ProtectedRoute allowedRoles={['Patient']}><Layout><PatientHome /></Layout></ProtectedRoute>} />
        <Route path="/patient/explore" element={<ProtectedRoute allowedRoles={['Patient']}><Layout><ExploreDoctors /></Layout></ProtectedRoute>} />
        <Route path="/patient/request" element={<ProtectedRoute allowedRoles={['Patient']}><Layout><RaiseRequest /></Layout></ProtectedRoute>} />
        <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['Patient']}><Layout><Appointments /></Layout></ProtectedRoute>} />
        <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['Patient']}><Layout><div className="text-white">Prescriptions feature coming soon.</div></Layout></ProtectedRoute>} />
        <Route path="/patient/notifications" element={<ProtectedRoute allowedRoles={['Patient']}><Layout><div className="text-white">Notifications feature coming soon.</div></Layout></ProtectedRoute>} />

        {/* Doctor Routes */}
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={['Doctor']}><Navigate to="/doctor/home" replace /></ProtectedRoute>} />
        <Route path="/doctor/home" element={<ProtectedRoute allowedRoles={['Doctor']}><Layout><DoctorHome /></Layout></ProtectedRoute>} />
        <Route path="/doctor/requests" element={<ProtectedRoute allowedRoles={['Doctor']}><Layout><LiveRequests /></Layout></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['Doctor']}><Layout><div className="text-white">Appointments coming soon.</div></Layout></ProtectedRoute>} />
        <Route path="/doctor/earnings" element={<ProtectedRoute allowedRoles={['Doctor']}><Layout><div className="text-white">Earnings coming soon.</div></Layout></ProtectedRoute>} />
        <Route path="/doctor/availability" element={<ProtectedRoute allowedRoles={['Doctor']}><Layout><div className="text-white">Availability settings coming soon.</div></Layout></ProtectedRoute>} />
        <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['Doctor']}><Layout><div className="text-white">Profile settings coming soon.</div></Layout></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['Admin']}><AdminHome /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App;
