import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder Pages
const Landing = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-primary-900 mb-4">MedCI Hair Treatment Platform</h1>
      <p className="text-gray-600 mb-8">Connecting you with top hair specialists.</p>
      <button className="btn-primary mx-2">Get Started</button>
      <button className="btn-secondary mx-2">Doctor Login</button>
    </div>
  </motion.div>
);

const Auth = () => <div className="min-h-screen flex items-center justify-center">Auth Page</div>;
const PatientDashboard = () => <div className="min-h-screen p-8">Patient Dashboard</div>;
const DoctorDashboard = () => <div className="min-h-screen p-8">Doctor Dashboard</div>;
const RaiseQuery = () => <div className="min-h-screen p-8">Raise Query</div>;

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/raise-query" element={<RaiseQuery />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
