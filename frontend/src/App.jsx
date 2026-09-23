import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
    </div>
  );
}

export default App;
