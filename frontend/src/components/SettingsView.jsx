import React, { useState } from 'react';
import { 
  Bell, 
  Shield, 
  Smile, 
  Volume2, 
  Smartphone, 
  Laptop, 
  User, 
  Check 
} from 'lucide-react';

export default function SettingsView({ user, profile, onUpdateProfile }) {
  // Local notification settings state
  const [emailNudges, setEmailNudges] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);

  // Local study modes state
  const [emotionAwareness, setEmotionAwareness] = useState(false);
  const [burnoutProtection, setBurnoutProtection] = useState(true);

  // Profile fields state
  const [name, setName] = useState(user?.full_name || 'Alex Mercer');
  const [email] = useState(user?.email || 'demo@student.com');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSuccessMsg('Settings updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
          Portal Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configure your preferences, study modes, and notification toggles</p>
      </div>

      <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
        
        {/* Section 1: Study Companion & Emotion Awareness */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider text-purple-300">
            <Smile className="w-4 h-4" />
            AI Study Companion Modes
          </h3>
          
          <div className="flex flex-col gap-4">
            
            {/* Emotion Awareness Mode */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-200">Emotion Awareness Mode</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Allows the AI companion to adjust daily tasks and break schedules dynamically based on sentiment feedback or stress logs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmotionAwareness(!emotionAwareness)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none flex-shrink-0 ${
                  emotionAwareness ? 'bg-purple-600' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-100 transition-transform ${
                  emotionAwareness ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Burnout Prevention Alert */}
            <div className="flex items-start justify-between gap-4 border-t border-[#231b42]/30 pt-4">
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-200">Adaptive Burnout Prevention</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Automatically inserts 15-minute dynamic cognitive relaxation breaks when study block duration reaches 90 minutes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBurnoutProtection(!burnoutProtection)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none flex-shrink-0 ${
                  burnoutProtection ? 'bg-purple-600' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-100 transition-transform ${
                  burnoutProtection ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>
        </div>

        {/* Section 2: Notifications */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider text-purple-300">
            <Bell className="w-4 h-4" />
            Notification Settings
          </h3>
          
          <div className="flex flex-col gap-4">
            
            {/* Email nudges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-sky-950/30 text-sky-400 border border-sky-800/30">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Email Study Nudges</h4>
                  <p className="text-[10px] text-slate-500">Weekly routine progress digests & alerts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailNudges(!emailNudges)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                  emailNudges ? 'bg-purple-600' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-100 transition-transform ${
                  emailNudges ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Browser push */}
            <div className="flex items-center justify-between border-t border-[#231b42]/30 pt-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-purple-950/30 text-purple-400 border border-purple-800/30">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Browser Push Alerts</h4>
                  <p className="text-[10px] text-slate-500">Live routine block start reminders</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPushNotifs(!pushNotifs)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                  pushNotifs ? 'bg-purple-600' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-100 transition-transform ${
                  pushNotifs ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Sound effects */}
            <div className="flex items-center justify-between border-t border-[#231b42]/30 pt-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-amber-950/30 text-amber-400 border border-amber-800/30">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Sound Notifications</h4>
                  <p className="text-[10px] text-slate-500">Play alerts when a break block triggers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEffects(!soundEffects)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                  soundEffects ? 'bg-purple-600' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-100 transition-transform ${
                  soundEffects ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>
        </div>

        {/* Section 3: Profile Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider text-purple-300">
            <User className="w-4 h-4" />
            Account Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-darkbg-sidebar border border-darkbg-border text-slate-200 rounded-xl py-2 px-3.5 text-xs focus:outline-none focus:border-purple-500 placeholder-slate-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-darkbg-sidebar/50 border border-darkbg-border text-slate-500 rounded-xl py-2 px-3.5 text-xs cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Message and Save bar */}
        <div className="flex items-center justify-between mt-2">
          <div>
            {successMsg && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                <Check className="w-4 h-4" />
                {successMsg}
              </span>
            )}
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-slate-100 py-2.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md"
          >
            Save Portal Settings
          </button>
        </div>

      </form>

    </div>
  );
}
