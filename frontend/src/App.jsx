import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackendWarmupIndicator from './components/BackendWarmupIndicator';
import { initBackendWarmup } from './utils/backendWarmup';

import HomePage from './pages/HomePage';
import SocialFeedPage from './pages/SocialFeedPage';
import JobPostingsPage from './pages/JobPostingsPage';
import CandidatesPage from './pages/CandidatesPage';
import InterviewPage from './pages/InterviewPage';
import JobDetailPage from './pages/JobDetailPage';

function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isInterview = location.pathname === '/interview';

  useEffect(() => {
    // Tự động ping Backend ngay khi vừa truy cập frontend
    initBackendWarmup();
  }, []);

  return (
    <div className={isInterview ? 'h-screen flex flex-col overflow-hidden' : 'min-h-screen bg-slate-50 text-slate-800'}>
      <Navbar variant={isLanding ? 'landing' : 'dashboard'} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/social" element={<SocialFeedPage />} />
        <Route path="/job-postings" element={<JobPostingsPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/job/:id" element={<JobDetailPage />} />
      </Routes>
      {isLanding && <Footer />}
      <BackendWarmupIndicator />
    </div>
  );
}

export default App;
