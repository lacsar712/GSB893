import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Lottery from './pages/Lottery';
import History from './pages/History';
import Admin from './pages/Admin';
import PrizeManage from './pages/PrizeManage';
import Statistics from './pages/Statistics';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Lottery />} />
            <Route path="/history" element={<History />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/prizes" element={<PrizeManage />} />
            <Route path="/admin/statistics" element={<Statistics />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
