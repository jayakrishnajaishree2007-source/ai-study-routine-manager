import React, { useState } from 'react';
import { Database, PlusCircle, UserCog, CalendarClock } from 'lucide-react';

export default function IngestionForms({ profile, onUpdateProfile, onAddLog, onAddExam }) {
  const [activeTab, setActiveTab] = useState('log');

  // Daily Activity Log Form state
  const [logSubject, setLogSubject] = useState('Math');
  const [logTime, setLogTime] = useState(60);
  const [logCompletion, setLogCompletion] = useState(80);
  const [logAccuracy, setLogAccuracy] = useState(75);
  const [logStress, setLogStress] = useState(5);
  const [logConsistent, setLogConsistent] = useState(true);
  const [logMessage, setLogMessage] = useState('');

  // Exam Form state
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examConfidence, setExamConfidence] = useState(50);
  const [examMessage, setExamMessage] = useState('');

  // Profile Form state
  const [subjectsList, setSubjectsList] = useState(profile?.subjects?.join(', ') || 'Math, Science, History');
  const [availableHours, setAvailableHours] = useState(profile?.available_hours || 4);
  const [primaryGoal, setPrimaryGoal] = useState(profile?.primary_goal || 'Excel in exams');
  const [profileMessage, setProfileMessage] = useState('');

  // Handle forms submit
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setLogMessage('Logging study session...');
    try {
      const today = new Date().toISOString().split('T')[0];
      await onAddLog({
        log_date: today,
        subject: logSubject,
        time_spent: parseInt(logTime),
        completion_rate: parseFloat(logCompletion),
        accuracy: parseFloat(logAccuracy),
        stress_level: parseInt(logStress),
        consistent: logConsistent
      });
      setLogMessage('Study session logged successfully!');
      // reset logic defaults
      setTimeout(() => setLogMessage(''), 3000);
    } catch (err) {
      setLogMessage('Error logging study session.');
    }
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    if (!examName || !examDate) {
      setExamMessage('Please fill out all fields.');
      return;
    }
    setExamMessage('Creating exam entry...');
    try {
      await onAddExam({
        name: examName,
        exam_date: examDate,
        confidence_level: parseFloat(examConfidence)
      });
      setExamMessage('Exam scheduled successfully!');
      setExamName('');
      setExamDate('');
      setTimeout(() => setExamMessage(''), 3000);
    } catch (err) {
      setExamMessage('Error scheduling exam.');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage('Updating study profile...');
    try {
      const parsedSubjects = subjectsList.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      await onUpdateProfile({
        subjects: parsedSubjects,
        available_hours: parseFloat(availableHours),
        primary_goal: primaryGoal
      });
      setProfileMessage('Study profile updated and AI routine synced!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      setProfileMessage('Error updating study profile.');
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col h-full min-h-[400px]">
      {/* Tabs list */}
      <div className="flex border-b border-darkbg-border pb-3 mb-4 gap-4">
        <button
          onClick={() => setActiveTab('log')}
          className={`flex items-center gap-2 pb-1 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none ${
            activeTab === 'log' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Log Daily Activity
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          className={`flex items-center gap-2 pb-1 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none ${
            activeTab === 'exam' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          Add Exam
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 pb-1 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none ${
            activeTab === 'profile' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCog className="w-4 h-4" />
          Configure Setup
        </button>
      </div>

      {/* Tabs panels */}
      <div className="flex-grow flex flex-col justify-between">
        
        {/* TAB 1: LOG DAILY STUDY ACTIVITY */}
        {activeTab === 'log' && (
          <form onSubmit={handleLogSubmit} className="flex flex-col gap-3 justify-between flex-grow">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subject</label>
                  <select
                    value={logSubject}
                    onChange={(e) => setLogSubject(e.target.value)}
                    className="w-full bg-darkbg-sidebar border border-darkbg-border text-slate-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-purple-500"
                  >
                    {profile?.subjects?.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    )) || (
                      <>
                        <option value="Math">Math</option>
                        <option value="Science">Science</option>
                        <option value="History">History</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Time spent (Minutes)</label>
                  <input
                    type="number"
                    value={logTime}
                    onChange={(e) => setLogTime(e.target.value)}
                    className="w-full bg-darkbg-sidebar border border-darkbg-border text-slate-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-purple-500"
                    min="5"
                    max="480"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Task Completion ({logCompletion}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={logCompletion}
                    onChange={(e) => setLogCompletion(e.target.value)}
                    className="w-full accent-purple-500 cursor-pointer h-1.5 bg-darkbg-border rounded-lg appearance-none mt-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Quiz Accuracy ({logAccuracy}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={logAccuracy}
                    onChange={(e) => setLogAccuracy(e.target.value)}
                    className="w-full accent-purple-500 cursor-pointer h-1.5 bg-darkbg-border rounded-lg appearance-none mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Stress Level ({logStress}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={logStress}
                  onChange={(e) => setLogStress(e.target.value)}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-darkbg-border rounded-lg appearance-none mt-2"
                />
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="consistent"
                  checked={logConsistent}
                  onChange={(e) => setLogConsistent(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-darkbg-sidebar border-darkbg-border focus:ring-purple-500 focus:ring-offset-0 focus:outline-none cursor-pointer"
                />
                <label htmlFor="consistent" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                  I adhered to my daily planned study schedule
                </label>
              </div>
            </div>

            <div className="mt-4">
              {logMessage && <p className="text-xs text-purple-400 font-semibold mb-2 animate-pulse">{logMessage}</p>}
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-slate-100 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-300 shadow-md flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Session Log
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: ADD UPCOMING EXAM */}
        {activeTab === 'exam' && (
          <form onSubmit={handleExamSubmit} className="flex flex-col gap-3 justify-between flex-grow">
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Exam Name</label>
                <input
                  type="text"
                  placeholder="e.g. Math Final Exam"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full bg-darkbg-sidebar border border-darkbg-border text-slate-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-purple-500 placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-darkbg-sidebar border border-darkbg-border text-slate-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subjective Readiness Confidence ({examConfidence}%)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={examConfidence}
                  onChange={(e) => setExamConfidence(e.target.value)}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-darkbg-border rounded-lg appearance-none mt-2"
                />
              </div>
            </div>

            <div className="mt-4">
              {examMessage && <p className="text-xs text-purple-400 font-semibold mb-2 animate-pulse">{examMessage}</p>}
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-slate-100 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-300 shadow-md flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Schedule Exam
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: UPDATE PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3 justify-between flex-grow">
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Active Study Subjects (Comma-separated)</label>
                <input
                  type="text"
                  value={subjectsList}
                  onChange={(e) => setSubjectsList(e.target.value)}
                  className="w-full bg-darkbg-sidebar border border-darkbg-border text-slate-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-purple-500 placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Daily Available Study hours ({availableHours} hrs)</label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(e.target.value)}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-darkbg-border rounded-lg appearance-none mt-2"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Primary Academic Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Master SAT prep"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="w-full bg-darkbg-sidebar border border-darkbg-border text-slate-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-purple-500 placeholder-slate-600"
                />
              </div>
            </div>

            <div className="mt-4">
              {profileMessage && <p className="text-xs text-purple-400 font-semibold mb-2 animate-pulse">{profileMessage}</p>}
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-slate-100 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-300 shadow-md flex items-center justify-center gap-1.5"
              >
                <UserCog className="w-4 h-4" />
                Sync Profile & Run AI Model
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
