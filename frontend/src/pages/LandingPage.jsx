import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 lg:px-12">
        <div className="text-3xl font-bold text-white tracking-tight cursor-default">
          Medci
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => navigate('/login')} className="px-2 py-2 md:px-4 md:py-2 text-sm md:text-base rounded-lg text-neutral-400 hover:text-white transition whitespace-nowrap">Login</button>
          <button onClick={() => navigate('/signup')} className="px-3 py-2 md:px-5 md:py-2 text-sm md:text-base rounded-lg bg-white hover:bg-gray-200 text-black transition font-medium whitespace-nowrap shadow-sm">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-6 mt-20 lg:mt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-white">
            Real-Time <span className="text-gray-400">Hair Treatment</span> Consultations
          </h1>
          <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            Connect with top specialists instantly. Get personalized treatment plans, book appointments, and start your journey to healthier hair today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button 
              onClick={() => navigate('/signup')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl bg-white text-black font-semibold text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] transition"
            >
              Find a Doctor Now
            </motion.button>
            <motion.button 
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl bg-transparent text-white font-semibold text-lg border border-neutral-700 hover:bg-neutral-900 transition"
            >
              Are you a Doctor?
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Floating Elements / Features */}
      <section className="mt-32 px-6 lg:px-12 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Instant Matching", desc: "Our algorithm finds the best available doctors near you in seconds." },
          { title: "Secure Consultations", desc: "Private and secure platform for all your medical data and images." },
          { title: "Expert Care", desc: "Access to highly qualified and verified hair treatment specialists." }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.2)' }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="p-8 rounded-2xl bg-black border border-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.03)] transition-all"
          >
            <h3 className="text-2xl font-semibold mb-3 text-white">{feature.title}</h3>
            <p className="text-neutral-400">{feature.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default LandingPage;
