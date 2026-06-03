import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import React from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import GlobalLoader from './components/GlobalLoader';
import PageTransition from './components/PageTransition';
import { useGlobalLoading } from './context/GlobalLoadingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Patient Pages
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
  const location = useLocation();
  const { isLoading, loadingMessage } = useGlobalLoading();

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      <AnimatePresence>
        {isLoading && <GlobalLoader message={loadingMessage} />}
      </AnimatePresence>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
          
          {/* Patient Routes */}
          <Route path="/patient" element={<ProtectedRoute allowedRoles={['Patient']}><Navigate to="/patient/home" replace /></ProtectedRoute>} />
          <Route path="/patient/home" element={<ProtectedRoute allowedRoles={['Patient']}><PageTransition><Layout><PatientHome /></Layout></PageTransition></ProtectedRoute>} />
          <Route path="/patient/explore" element={<ProtectedRoute allowedRoles={['Patient']}><PageTransition><Layout><ExploreDoctors /></Layout></PageTransition></ProtectedRoute>} />
          <Route path="/patient/request" element={<ProtectedRoute allowedRoles={['Patient']}><PageTransition><Layout><RaiseRequest /></Layout></PageTransition></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['Patient']}><PageTransition><Layout><Appointments /></Layout></PageTransition></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['Patient']}><PageTransition><Layout><div className="text-white">Prescriptions feature coming soon.</div></Layout></PageTransition></ProtectedRoute>} />
          <Route path="/patient/notifications" element={<ProtectedRoute allowedRoles={['Patient']}><PageTransition><Layout><div className="text-white">Notifications feature coming soon.</div></Layout></PageTransition></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['Doctor']}><Navigate to="/doctor/home" replace /></ProtectedRoute>} />
          <Route path="/doctor/home" element={<ProtectedRoute allowedRoles={['Doctor']}><PageTransition><Layout><DoctorHome /></Layout></PageTransition></ProtectedRoute>} />
          <Route path="/doctor/requests" element={<ProtectedRoute allowedRoles={['Doctor']}><PageTransition><Layout><LiveRequests /></Layout></PageTransition></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['Doctor']}><PageTransition><Layout><div className="text-white">Appointments coming soon.</div></Layout></PageTransition></ProtectedRoute>} />
          <Route path="/doctor/earnings" element={<ProtectedRoute allowedRoles={['Doctor']}><PageTransition><Layout><div className="text-white">Earnings coming soon.</div></Layout></PageTransition></ProtectedRoute>} />
          <Route path="/doctor/availability" element={<ProtectedRoute allowedRoles={['Doctor']}><PageTransition><Layout><div className="text-white">Availability settings coming soon.</div></Layout></PageTransition></ProtectedRoute>} />
          <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['Doctor']}><PageTransition><Layout><div className="text-white">Profile settings coming soon.</div></Layout></PageTransition></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['Admin']}><PageTransition><AdminHome /></PageTransition></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App;
