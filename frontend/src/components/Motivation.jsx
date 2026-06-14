import React, { useState } from 'react';
import { Flame, Target, Bell, Sparkles, CheckCircle, BellOff } from 'lucide-react';

export default function Motivation({ logs, user }) {
  const [fcmEnabled, setFcmEnabled] = useState(true);
  const [notifSent, setNotifSent] = useState(false);

  // 1. Calculate Daily Study Streak (consecutive days with consistent logs)
  const calculateStreak = () => {
    if (!logs || logs.length === 0) return 0;
    
    // Sort logs descending by date
    const sortedLogs = [...logs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
    
    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let expectedDate = today;

    // Check if the most recent log is today or yesterday
    const latestLogDate = new Date(sortedLogs[0].log_date);
    latestLogDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(expectedDate - latestLogDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      // Streak broken if latest study was before yesterday
      return 0;
    }

    if (diffDays === 1) {
      // Latest study was yesterday, check from yesterday
      expectedDate = latestLogDate;
    }

    for (let log of sortedLogs) {
      const logDate = new Date(log.log_date);
      logDate.setHours(0, 0, 0, 0);

      // If matches expected date and was consistent, increment
      if (logDate.getTime() === expectedDate.getTime()) {
        if (log.consistent) {
          streak++;
          // Shift expected date back by 1 day
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          break; // broke consistency
        }
      } else if (logDate.getTime() < expectedDate.getTime()) {
        // Gap in study days
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  // 2. Calculate Weekly Goal Progress (Target hours vs studied hours)
  const calculateWeeklyProgress = () => {
    if (!logs || logs.length === 0) return { hours: 0, target: 15, pct: 0 };
    // Get last 7 days study hours
    const last7Logs = logs.slice(-7);
    const totalMinutes = last7Logs.reduce((acc, curr) => acc + curr.time_spent, 0);
    const studiedHours = roundToTwoDecimals(totalMinutes / 60.0);
    const targetHours = 15.0; // standard weekly focus target
    const pct = Math.min(100, Math.round((studiedHours / targetHours) * 100));
    return { hours: studiedHours, target: targetHours, pct };
  };

  const roundToTwoDecimals = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  const weekly = calculateWeeklyProgress();

  // 3. Trigger Firebase notification nudge mock wrapper
  const triggerFcmNotification = () => {
    setNotifSent(true);
    // Simulate FCM push trigger
    console.log(`[FCM Mock Push Notification triggered for user token]`);
    setTimeout(() => setNotifSent(false), 3000);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col justify-between h-96">
      
      {/* Title */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          Motivation & Streaks
        </h3>
        <p className="text-xs text-slate-400">Track study streaks, goal completion, and notification settings</p>
      </div>

      {/* Streak and goal visualizations */}
      <div className="flex-grow flex items-center justify-around py-4 gap-4">
        
        {/* Streak dial */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 flex items-center justify-center bg-orange-950/20 rounded-full border-2 border-orange-500/20 shadow-lg shadow-orange-950/5">
            <Flame className="absolute w-14 h-14 text-orange-500/10" />
            <div className="z-10 flex flex-col items-center">
              <span className="text-3xl font-extrabold text-orange-400">{streak}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Days</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-200 mt-2">Daily Study Streak</span>
        </div>

        {/* Weekly Progress bar / dial */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 flex items-center justify-center bg-purple-950/20 rounded-full border-2 border-purple-500/20 shadow-lg shadow-purple-950/5">
            <Target className="absolute w-12 h-12 text-purple-500/10" />
            <div className="z-10 flex flex-col items-center">
              <span className="text-2xl font-extrabold text-purple-400">{weekly.pct}%</span>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{weekly.hours}h / {weekly.target}h</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-200 mt-2">Weekly Goal Target</span>
        </div>

      </div>

      {/* FCM hooks controls */}
      <div className="border-t border-darkbg-border pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            {fcmEnabled ? (
              <Bell className="w-4 h-4 text-purple-400" />
            ) : (
              <BellOff className="w-4 h-4 text-slate-500" />
            )}
            Firebase Motivation Engine
          </span>
          
          <button
            onClick={() => setFcmEnabled(!fcmEnabled)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
              fcmEnabled ? 'bg-purple-600' : 'bg-darkbg-border border border-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-slate-100 transition-transform ${
              fcmEnabled ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <button
          onClick={triggerFcmNotification}
          disabled={!fcmEnabled || notifSent}
          className="w-full bg-darkbg-sidebar hover:bg-purple-950/20 border border-purple-500/25 text-purple-300 hover:text-slate-100 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          {notifSent ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400 animate-bounce" />
              Nudge Triggered!
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              Trigger Firebase Reminder Nudge
            </>
          )}
        </button>
      </div>

    </div>
  );
}
