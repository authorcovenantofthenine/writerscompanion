import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ParticleBackground from '@/components/ParticleBackground.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import SetupPage from '@/pages/SetupPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import JoinPage from '@/pages/JoinPage.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <ParticleBackground />
        
        <div className="flex flex-col min-h-screen relative z-0">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/join/:circleId" element={<JoinPage />} />
              
              <Route path="/setup" element={
                <ProtectedRoute>
                  <SetupPage />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route for unknown paths */}
              <Route path="*" element={
                <div className="min-h-[calc(100vh-80px)] bg-transparent text-foreground flex flex-col items-center justify-center p-6 text-center">
                  <h1 className="text-4xl font-display text-primary mb-4">404 - Page Not Found</h1>
                  <p className="text-lg font-serif-body mb-8 text-foreground/80">The page you are looking for does not exist in this realm.</p>
                  <a href="/" className="text-primary hover:underline font-serif-display text-xl italic">
                    Return to the beginning
                  </a>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;