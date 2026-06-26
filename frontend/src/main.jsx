import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ThemeProvider } from './context/ThemeContext'
import { GlobalLoadingProvider } from './context/GlobalLoadingContext'
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <GlobalLoadingProvider>
          <AuthProvider>
            <SocketProvider>
              <App />
            </SocketProvider>
          </AuthProvider>
        </GlobalLoadingProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
