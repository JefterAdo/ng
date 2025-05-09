import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../components/layout/AuthLayout';
import MainLayout from '../components/layout/MainLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';

// Dashboard Pages
import DashboardPage from '../pages/dashboard/DashboardPage';

// Analysis Pages
import AnalysisPage from '../pages/analysis/AnalysisPage';
import NewAnalysisPage from '../pages/analysis/NewAnalysisPage';
import AnalysisDetailPage from '../pages/analysis/AnalysisDetailPage';

// Response Pages
import ResponsesPage from '../pages/response/ResponsesPage';
import NewResponsePage from '../pages/response/NewResponsePage';
import ResponseDetailPage from '../pages/response/ResponseDetailPage';
const ChatPage = lazy(() => import('../pages/response/ChatPage')); // Corrected import path to singular 'response'

// History Pages
import HistoryPage from '../pages/history/HistoryPage';

// Error Pages
import NotFoundPage from '../pages/error/NotFoundPage';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          
          {/* App Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/analysis/new" element={<NewAnalysisPage />} />
            <Route path="/analysis/:id" element={<AnalysisDetailPage />} />
            
            <Route path="/responses" element={<ResponsesPage />} />
            <Route path="/responses/new" element={<NewResponsePage />} />
            <Route path="/responses/:id" element={<ResponseDetailPage />} />
            <Route path="/responses/chat" element={<ChatPage />} /> {/* Added ChatPage Route */}
            
            <Route path="/history" element={<HistoryPage />} />
          </Route>
          
          {/* Error Routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;