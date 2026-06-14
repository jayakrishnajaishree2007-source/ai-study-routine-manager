import React, { useState } from 'react';
import IngestionForms from './IngestionForms';
import { 
  Sparkles, 
  Smile, 
  Clock, 
  CheckCircle, 
  Activity, 
  MessageSquare,
  Flame,
  Target
} from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function Dashboard({ 
  user, 
  metrics, 
  profile, 
  handleUpdateProfile, 
  handleAddLog, 
  handleAddExam,
  onTaskFeedback 
}) {
  
  // Rating session state
  const [selectedRating, setSelectedRating] = useState(null);
  const [ratingMessage, setRatingMessage] = useState('');

  // Session Pacing feedback adjuster (Too Fast / Good / Too Hard)
  const submitSessionRating = async (rating) => {
    if (!metrics?.tasks || metrics.tasks.length === 0) return;
    
    setSelectedRating(rating);
    setRatingMessage('Syncing rating feedback with AI Engine...');
    
    try {
      // Find the first task to attach feedback to
      const targetTask = metrics.tasks.find(t => !t.is_break) || metrics.tasks[0];
      await onTaskFeedback(
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

  return (
    <div className="flex flex-col gap-8 relative">
      
      {/* Banner with Emotion Mode Placeholder */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-purple-500/10 shadow-lg">
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
          <div className="bg-[#231b42]/20 border border-[#231b42]/30 rounded-xl px-4 py-2 text-center">
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-0.5">Focus Fields</span>
            <span className="text-xs font-semibold text-purple-300">{profile?.subjects?.join(', ')}</span>
          </div>
          <div className="bg-[#231b42]/20 border border-[#231b42]/30 rounded-xl px-4 py-2 text-center">
            <span className="block text-[10px] uppercase text-slate-400 font-bold mb-0.5">Availability</span>
            <span className="text-xs font-semibold text-sky-300">{profile?.available_hours}h / Day</span>
          </div>
        </div>
      </div>

      {/* Real-time Progress visual board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Planned Study Block</span>
            <span className="text-2xl font-black text-slate-100 mt-1 block">{progress.total} Mins</span>
          </div>
          <Clock className="w-10 h-10 text-purple-400 opacity-30" />
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Completed Studied Time</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{progress.completed} Mins</span>
          </div>
          <CheckCircle className="w-10 h-10 text-emerald-400 opacity-30" />
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Today's Progress</span>
            <span className="text-xs font-extrabold text-sky-400">{progress.pct}%</span>
          </div>
          <div className="w-full bg-[#231b42]/30 h-2.5 rounded-full mt-2 overflow-hidden border border-[#231b42]/60">
            <div 
              className="bg-gradient-to-r from-purple-500 to-sky-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progress.pct}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Dashboard Sub-widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Insights Cards */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 flex flex-col justify-between h-44">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Routine Health</span>
              <h3 className="text-lg font-bold text-slate-100 mt-1">Study Consistency</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-purple-400">{metrics?.consistency_score || 0}%</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Consistency Index</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 flex flex-col justify-between h-44">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Daily Average Focus</span>
              <h3 className="text-lg font-bold text-slate-100 mt-1">Hours Logged</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-sky-400">{metrics?.average_hours_per_day || 0.0}h</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Per day avg</span>
            </div>
          </div>
        </div>

        {/* Data Ingestion Forms */}
        <div className="lg:col-span-2">
          <IngestionForms
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onAddLog={handleAddLog}
            onAddExam={handleAddExam}
          />
        </div>
      </div>

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
                    : 'bg-[#05020c] border-[#231b42] text-slate-400 hover:text-slate-200'
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

      {/* Floating Chatbot FAB */}
      <button 
        title="Chatbot Support"
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-slate-100 rounded-full flex items-center justify-center shadow-lg shadow-purple-950/20 hover:scale-110 active:scale-95 transition-all z-50 border border-purple-500/25 group"
      >
        <MessageSquare className="w-6 h-6 group-hover:animate-bounce" />
        <span className="absolute right-16 bg-[#05020c] border border-[#231b42] px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold text-purple-300 hidden group-hover:inline-block pointer-events-none whitespace-nowrap shadow-md">
          Chatbot Help
        </span>
      </button>

    </div>
  );
}
