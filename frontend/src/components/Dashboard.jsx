import React, { useState, useEffect } from 'react';
import ConsistencyChart from './ConsistencyChart';
import AccuracyTrendsChart from './AccuracyTrendsChart';
import ConfidenceGauge from './ConfidenceGauge';
import StressTimeline from './StressTimeline';
import Recommendations from './Recommendations';
import TaskChecklist from './TaskChecklist';
import Motivation from './Motivation';
import Auth from './Auth';
import IngestionForms from './IngestionForms';
import { Sparkles, RefreshCw, GraduationCap, LogOut, MessageSquare, Smile, Settings, Clock, Activity, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function Dashboard() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Rating session state
  const [selectedRating, setSelectedRating] = useState(null);
  const [ratingMessage, setRatingMessage] = useState('');

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
      setRefreshing(false);
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
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

  // PHASE 4: Webhook triggering routine recalculations
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

  // Session Pacing feedback adjuster (Too Fast / Good / Too Hard)
  const submitSessionRating = async (rating) => {
    if (!metrics?.tasks || metrics.tasks.length === 0) return;
    
    setSelectedRating(rating);
    setRatingMessage('Syncing rating feedback with AI Engine...');
    
    try {
      // Find the first task to attach feedback to
      const targetTask = metrics.tasks.find(t => !t.is_break) || metrics.tasks[0];
      await handleTaskFeedback(
        targetTask.id,
        targetTask.completed,
        targetTask.skipped,
        targetTask.difficulty_feedback,
        rating
      );
      setRatingMessage(`AI recalibrated! Tomorrow's study blocks adjusted for "${rating}" pacing.`);
      setTimeout(() => {
        setRatingMessage('');
        setSelectedRating(null);
      }, 4000);
    } catch (err) {
      setRatingMessage('Error recalibrating routine.');
    }
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

  // Calculate studied hours vs planned hours today
  const calculateDailyProgress = () => {
    if (!metrics?.tasks) return { completed: 0, total: 0, pct: 0 };
    const studyTasks = metrics.tasks.filter(t => !t.is_break);
    const totalMinutes = studyTasks.reduce((acc, curr) => acc + curr.duration_minutes, 0);
    const completedMinutes = studyTasks.filter(t => t.completed).reduce((acc, curr) => acc + curr.duration_minutes, 0);
    const pct = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;
    return { completed: completedMinutes, total: totalMinutes, pct };
  };

  const progress = calculateDailyProgress();

  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-darkbg-body flex flex-col items-center justify-center text-slate-100 gap-4">
        <GraduationCap className="w-12 h-12 text-purple-500 animate-bounce" />
        <span className="text-sm font-semibold tracking-wider uppercase text-purple-400">Loading Dashboard Analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-darkbg-body flex flex-col items-center justify-center text-slate-100 gap-4 p-6 text-center">
        <div className="glass-panel p-8 rounded-2xl max-w-md border border-rose-500/20">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Connection Offline</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            REST server is offline. Verify FastAPI uvicorn daemon is active.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchDashboardData}
              className="bg-purple-600 hover:bg-purple-700 text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-xl transition-all"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="bg-darkbg-border hover:bg-darkbg-border/80 border border-slate-700 text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-xl transition-all text-slate-300"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05020c] text-slate-100 pb-24 relative">
      
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-sky-600/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Navigation header */}
      <header className="border-b border-darkbg-border bg-darkbg-sidebar/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30">
              <GraduationCap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                AetherRoutine
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI Study Routine Manager</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-medium">
              Student: <span className="text-purple-400 font-bold">{user?.full_name || "Alex Mercer"}</span>
            </span>
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-xl border border-darkbg-border bg-darkbg-card hover:bg-purple-950/20 text-slate-400 hover:text-slate-200 transition-all ${
                refreshing ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-2 rounded-xl border border-rose-500/10 bg-darkbg-card hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Banner with Emotion Mode Placeholder */}
        <div className="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-purple-500/10 shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 mb-1 block">Active Focus Goal</span>
            <h2 className="text-lg font-bold text-slate-100">{profile?.primary_goal || "Master active subjects"}</h2>
            
            {/* Future-ready placeholder: Emotion Awareness toggle switch */}
            <div className="flex items-center gap-2 mt-2 opacity-50 cursor-not-allowed" title="Emotion Awareness Mode (Coming Soon)">
              <div className="w-8 h-4 rounded-full bg-slate-800 p-0.5 border border-slate-700 relative">
                <div className="w-3 h-3 rounded-full bg-slate-600" />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5" />
                Emotion Awareness Mode (Locked)
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-darkbg-sidebar/40 border border-darkbg-border rounded-xl px-4 py-2 text-center">
              <span className="block text-[10px] uppercase text-slate-400 font-bold mb-0.5">Focus Fields</span>
              <span className="text-xs font-semibold text-purple-300">{profile?.subjects?.join(', ')}</span>
            </div>
            <div className="bg-darkbg-sidebar/40 border border-darkbg-border rounded-xl px-4 py-2 text-center">
              <span className="block text-[10px] uppercase text-slate-400 font-bold mb-0.5">Availability</span>
              <span className="text-xs font-semibold text-sky-300">{profile?.available_hours}h / Day</span>
            </div>
          </div>
        </div>

        {/* Real-time Progress visual board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 flex items-center justify-between">
            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-bold">Planned Study Block</span>
              <span className="text-2xl font-black text-slate-100 mt-1 block">{progress.total} Mins</span>
            </div>
            <Clock className="w-10 h-10 text-purple-400 opacity-30" />
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 flex items-center justify-between">
            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-bold">Completed studied Time</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{progress.completed} Mins</span>
            </div>
            <CheckCircle className="w-10 h-10 text-emerald-400 opacity-30" />
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold">Today's Progress</span>
              <span className="text-xs font-extrabold text-sky-400">{progress.pct}%</span>
            </div>
            <div className="w-full bg-darkbg-border h-2.5 rounded-full mt-2 overflow-hidden border border-darkbg-border/60">
              <div 
                className="bg-gradient-to-r from-purple-500 to-sky-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progress.pct}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          <ConfidenceGauge exams={metrics?.exams} onConfidenceChange={handleConfidenceChange} />
          
          <ConsistencyChart
            weeklyHours={metrics?.weekly_hours}
            consistencyScore={metrics?.consistency_score}
            averageHours={metrics?.average_hours_per_day}
          />
          
          {/* Motivation Streaks Widget */}
          <Motivation logs={metrics?.behavior_logs || []} user={user} />
          
          <AccuracyTrendsChart accuracyTrends={metrics?.subject_accuracy_trends} />
          
          <StressTimeline stressScores={metrics?.stress_scores} stressDates={metrics?.stress_dates} />
          
          <IngestionForms
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onAddLog={handleAddLog}
            onAddExam={handleAddExam}
          />
        </div>

        {/* AI task checklist and adaptive feedback rating block */}
        <div className="mt-8 flex flex-col gap-6">
          
          <TaskChecklist tasks={metrics?.tasks} onTaskFeedback={handleTaskFeedback} />

          {/* Feedback-Driven Routine Pacing Adjustment */}
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                Rate Study Session Pacing
              </h4>
              <p className="text-xs text-slate-400">If today's pacing felt uncomfortable, select an option to recalibrate tomorrow's AI allocation.</p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2.5">
                {['Too Fast', 'Good', 'Too Hard'].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => submitSessionRating(rating)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                      selectedRating === rating
                        ? 'bg-purple-600 text-slate-100 border-purple-500 shadow-md shadow-purple-500/10 scale-105'
                        : 'bg-darkbg-sidebar border-darkbg-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              {ratingMessage && (
                <span className="text-[10px] text-purple-400 font-semibold animate-pulse">{ratingMessage}</span>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Floating Chatbot FAB */}
      <button 
        title="Chatbot Support"
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-slate-100 rounded-full flex items-center justify-center shadow-lg shadow-purple-950/20 hover:scale-110 active:scale-95 transition-all z-50 border border-purple-500/25 group"
      >
        <MessageSquare className="w-6 h-6 group-hover:animate-bounce" />
        <span className="absolute right-16 bg-darkbg-card border border-darkbg-border px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold text-purple-300 hidden group-hover:inline-block pointer-events-none whitespace-nowrap shadow-md">
          Chatbot Help
        </span>
      </button>

    </div>
  );
}
