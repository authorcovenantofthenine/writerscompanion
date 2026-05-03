
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { ProjectProvider } from './contexts/ProjectContext.jsx';
import { SubscriptionProvider } from './contexts/SubscriptionContext.jsx';
import { AutoSaveProvider } from './contexts/AutoSaveContext.jsx';
import { Toaster } from '@/components/ui/sonner.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <ProjectProvider>
                  <AutoSaveProvider>
                    <ScrollToTop />
                    <App />
                    <Toaster />
                  </AutoSaveProvider>
                </ProjectProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  </>
);
