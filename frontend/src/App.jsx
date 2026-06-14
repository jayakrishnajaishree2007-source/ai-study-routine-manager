import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TaskChecklist from './components/TaskChecklist';
import Motivation from './components/Motivation';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import Auth from './components/Auth';
import { GraduationCap } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth session on load
  useEffect(() => {
    const cachedToken = localStorage.getItem('auth_token');
    const cachedUser = localStorage.getItem('user_info');
    if (cachedToken && cachedUser && cachedUser !== 'undefined') {
      try {
        setToken(cachedToken);
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error("Failed to parse cached user:", e);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (activeToken = token, activeUser = user) => {
    if (!activeToken || !activeUser) return;
    try {
      const metricsRes = await fetch(`${API_BASE_URL}/dashboard/${activeUser.id}`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (metricsRes.status === 401) {
        handleLogout();
        return;
      }
      if (!metricsRes.ok) throw new Error('Failed to load telemetry stats.');
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);

      const profileRes = await fetch(`${API_BASE_URL}/profile/${activeUser.id}`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchDashboardData(token, user);
    }
  }, [token, user]);

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setLoading(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
    setMetrics(null);
    setProfile(null);
    setError(null);
  };

  // Mutator triggers matching Bearer tokens
  const handleConfidenceChange = async (examId, confidence) => {
    const res = await fetch(`${API_BASE_URL}/exams/${examId}/confidence`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ confidence_level: confidence }),
    });
    if (!res.ok) throw new Error('Failed to update exam confidence.');
    fetchDashboardData();
  };

  // Webhook triggering routine recalculations
  const handleTaskFeedback = async (taskId, completed, skipped, difficultyFeedback, sessionRating = null) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        completed,
        skipped,
        difficulty_feedback: difficultyFeedback,
        session_rating: sessionRating
      })
    });
    if (!res.ok) throw new Error('Failed to log task feedback.');
    fetchDashboardData();
  };

  const handleUpdateProfile = async (profileData) => {
    const res = await fetch(`${API_BASE_URL}/profile/${user.id}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error('Failed to update study profile.');
    fetchDashboardData();
  };

  const handleAddLog = async (logData) => {
    const res = await fetch(`${API_BASE_URL}/behavior-logs/${user.id}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(logData),
    });
    if (!res.ok) throw new Error('Failed to log session.');
    fetchDashboardData();
  };

  const handleAddExam = async (examData) => {
    const res = await fetch(`${API_BASE_URL}/exams/${user.id}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(examData),
    });
    if (!res.ok) throw new Error('Failed to schedule exam.');
    fetchDashboardData();
  };

  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05020c] flex flex-col items-center justify-center text-slate-100 gap-4">
        <GraduationCap className="w-12 h-12 text-purple-500 animate-bounce" />
        <span className="text-sm font-semibold tracking-wider uppercase text-purple-400">
          Loading StudySync Analytics...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#05020c] flex flex-col items-center justify-center text-slate-100 gap-4 p-6 text-center">
        <div className="glass-panel p-8 rounded-2xl max-w-md border border-rose-500/20">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Connection Offline</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            REST server is offline. Verify FastAPI uvicorn daemon is active.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => fetchDashboardData(token, user)}
              className="bg-purple-600 hover:bg-purple-700 text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-xl transition-all"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="bg-[#231b42]/40 hover:bg-[#231b42]/60 border border-slate-700 text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-xl transition-all text-slate-300"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
          <Route
            index
            element={
              <Dashboard
                user={user}
                metrics={metrics}
                profile={profile}
                handleUpdateProfile={handleUpdateProfile}
                handleAddLog={handleAddLog}
                handleAddExam={handleAddExam}
                onTaskFeedback={handleTaskFeedback}
              />
            }
          />
          <Route
            path="routine"
            element={
              <TaskChecklist
                tasks={metrics?.tasks}
                onTaskFeedback={handleTaskFeedback}
              />
            }
          />
          <Route
            path="motivation"
            element={
              <Motivation
                logs={metrics?.behavior_logs || []}
                user={user}
              />
            }
          />
          <Route
            path="analytics"
            element={
              <AnalyticsView
                metrics={metrics}
                onConfidenceChange={handleConfidenceChange}
              />
            }
          />
          <Route
            path="settings"
            element={
              <SettingsView
                user={user}
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
              />
            }
          />
          {/* Fallback redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
