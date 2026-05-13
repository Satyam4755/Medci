import React, { createContext, useContext, useState } from 'react';

const GlobalLoadingContext = createContext();

export const useGlobalLoading = () => {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
  }
  return context;
};

export const GlobalLoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const startLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  return (
    <GlobalLoadingContext.Provider value={{
      isLoading,
      loadingMessage,
      startLoading,
      stopLoading
    }}>
      {children}
    </GlobalLoadingContext.Provider>
  );
};