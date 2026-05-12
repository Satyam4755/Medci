import React from 'react';

const Appointments = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-theme-text)]">Appointments</h1>
      <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--color-theme-border)]">
        <div className="w-16 h-16 rounded-full bg-[var(--color-theme-panel)] flex items-center justify-center mb-4 text-2xl">📅</div>
        <h3 className="text-xl font-semibold text-[var(--color-theme-text)]">No appointments yet</h3>
        <p className="text-[var(--color-theme-muted)] mt-2">Your upcoming and completed appointments will appear here.</p>
      </div>
    </div>
  );
};

export default Appointments;
