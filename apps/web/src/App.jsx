
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ProtectedFeatureRoute from './components/ProtectedFeatureRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import MagicalBackground from './components/MagicalBackground.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import FeaturesPage from './pages/FeaturesPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import ContactPage from './pages/ContactPage.jsx';

import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

import DashboardPage from './pages/DashboardPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import CharactersPage from './pages/CharactersPage.jsx';
import CodexPage from './pages/CodexPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import CharacterPage from './pages/CharacterPage.jsx';
import WorldPage from './pages/WorldPage.jsx';
import WorldBuilderPage from './pages/WorldBuilderPage.jsx';
import TimelinePage from './pages/TimelinePage.jsx';
import ChronosView from './pages/ChronosView.jsx';
import RelationshipsPage from './pages/RelationshipsPage.jsx';
import RelationsNetworkPage from './pages/RelationsNetworkPage.jsx';
import BooksPage from './pages/BooksPage.jsx';
import ChaptersPage from './pages/ChaptersPage.jsx';
import ScenesPage from './pages/ScenesPage.jsx';
import SceneEditorPage from './pages/SceneEditorPage.jsx';
import ManuscriptPage from './pages/ManuscriptPage.jsx';
import AssetsPage from './pages/AssetsPage.jsx';
import WritingGoalsPage from './pages/WritingGoalsPage.jsx';
import SearchAndOrganizePage from './pages/SearchAndOrganizePage.jsx';
import CollaborationPage from './pages/CollaborationPage.jsx';
import QuillPage from './pages/QuillPage.jsx';

import StoryArchitectPage from './pages/StoryArchitectPage.jsx';
import SubscriptionPage from './pages/SubscriptionPage.jsx';
import SubscriptionSuccess from './pages/SubscriptionSuccess.jsx';
import SuccessPage from './pages/SuccessPage.jsx';
import CancelPage from './pages/CancelPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import WritingReferencesPage from './pages/WritingReferencesPage.jsx';
import WritingAnalyticsDashboard from './pages/WritingAnalyticsDashboard.jsx';
import BetaGuildPage from './pages/BetaGuildPage.jsx';

function App() {
  return (
    <ErrorBoundary>
      <MagicalBackground />
      <Routes>
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
        <Route path="/about" element={<PublicRoute><AboutPage /></PublicRoute>} />
        <Route path="/features" element={<PublicRoute><FeaturesPage /></PublicRoute>} />
        <Route path="/pricing" element={<PublicRoute><PricingPage /></PublicRoute>} />
        <Route path="/contact" element={<PublicRoute><ContactPage /></PublicRoute>} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        
        <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
        <Route path="/subscription-success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
        <Route path="/app/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/app/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        <Route path="/app/projects/books" element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
        <Route path="/app/architect" element={<ProtectedRoute><StoryArchitectPage /></ProtectedRoute>} />
        
        <Route path="/app/chapters" element={<ProtectedRoute><ChaptersPage /></ProtectedRoute>} />
        <Route path="/app/chapters/:chapterId" element={<ProtectedRoute><ChaptersPage /></ProtectedRoute>} />
        <Route path="/app/scenes" element={<ProtectedRoute><ScenesPage /></ProtectedRoute>} />
        <Route path="/app/scenes/editor" element={<ProtectedRoute><SceneEditorPage /></ProtectedRoute>} />
        <Route path="/app/manuscript" element={<ProtectedRoute><ManuscriptPage /></ProtectedRoute>} />
        
        <Route path="/app/characters" element={<ProtectedRoute><CharactersPage /></ProtectedRoute>} />
        <Route path="/app/codex" element={<ProtectedRoute><CodexPage /></ProtectedRoute>} />
        <Route path="/app/relationships" element={<ProtectedRoute><ProtectedFeatureRoute feature="relationships" featureName="Relationships"><RelationshipsPage /></ProtectedFeatureRoute></ProtectedRoute>} />
        <Route path="/relations-network" element={<ProtectedRoute><RelationsNetworkPage /></ProtectedRoute>} />
        <Route path="/app/world" element={<ProtectedRoute><WorldPage /></ProtectedRoute>} />
        <Route path="/world-builder" element={<ProtectedRoute><WorldBuilderPage /></ProtectedRoute>} />
        <Route path="/app/timeline" element={<ProtectedRoute><ProtectedFeatureRoute feature="timeline" featureName="Timeline"><TimelinePage /></ProtectedFeatureRoute></ProtectedRoute>} />
        <Route path="/app/chronos" element={<ProtectedRoute><ChronosView /></ProtectedRoute>} />
        <Route path="/app/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
        <Route path="/app/goals" element={<ProtectedRoute><WritingGoalsPage /></ProtectedRoute>} />
        <Route path="/app/search" element={<ProtectedRoute><SearchAndOrganizePage /></ProtectedRoute>} />
        <Route path="/app/collaboration" element={<ProtectedRoute><CollaborationPage /></ProtectedRoute>} />
        <Route path="/app/quill" element={<ProtectedRoute><QuillPage /></ProtectedRoute>} />
        
        <Route path="/app/references" element={<ProtectedRoute><WritingReferencesPage /></ProtectedRoute>} />
        <Route path="/app/analytics" element={<ProtectedRoute><ProtectedFeatureRoute feature="analytics" featureName="Advanced Analytics"><WritingAnalyticsDashboard /></ProtectedFeatureRoute></ProtectedRoute>} />
        <Route path="/app/beta-guild" element={<ProtectedRoute><ProtectedFeatureRoute feature="beta_guild" featureName="Beta Guild"><BetaGuildPage /></ProtectedFeatureRoute></ProtectedRoute>} />
        
        <Route path="/app/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        
        <Route path="/app/characters/:id" element={<ProtectedRoute><CharacterPage /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
