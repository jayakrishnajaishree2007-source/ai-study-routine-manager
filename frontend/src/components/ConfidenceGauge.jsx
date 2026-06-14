import React, { useState, useEffect } from 'react';
import { ShieldCheck, Compass } from 'lucide-react';

export default function ConfidenceGauge({ exams, onConfidenceChange }) {
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [confidence, setConfidence] = useState(50);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync selected exam from parent logs
  useEffect(() => {
    if (exams && exams.length > 0 && selectedExamId === null) {
      setSelectedExamId(exams[0].id);
      setConfidence(exams[0].confidence_level);
    }
  }, [exams, selectedExamId]);

  const selectedExam = exams?.find((e) => e.id === selectedExamId);

  // Update localized confidence value when selected exam changes
  const handleExamSelect = (id) => {
    setSelectedExamId(id);
    const exam = exams.find((e) => e.id === id);
    if (exam) {
      setConfidence(exam.confidence_level);
    }
  };

  const handleSliderChange = (e) => {
    const newVal = parseFloat(e.target.value);
    setConfidence(newVal);
  };

  const triggerConfidenceUpdate = async () => {
    if (!selectedExamId) return;
    setIsUpdating(true);
    try {
      await onConfidenceChange(selectedExamId, confidence);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // SVG Gauge calculations
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  const strokeDashoffset = halfCircumference - (confidence / 100) * halfCircumference;

  // Determine readiness text and color
  const getReadinessStatus = (val) => {
    if (val >= 80) return { text: 'Exam Ready 🚀', color: 'text-emerald-400' };
    if (val >= 50) return { text: 'Moderate Progress 📈', color: 'text-yellow-400' };
    return { text: 'Needs Revision ⚠️', color: 'text-rose-400' };
  };

  const status = getReadinessStatus(confidence);

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col h-96 justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Exam Confidence Levels
        </h3>
        <p className="text-xs text-slate-400">Subjective readiness ratings for upcoming tests</p>
      </div>

      {exams && exams.length > 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          {/* Exam Selector Dropdown */}
          <div className="w-full max-w-xs mb-3">
            <select
              value={selectedExamId || ''}
              onChange={(e) => handleExamSelect(parseInt(e.target.value))}
              className="w-full bg-darkbg-sidebar border border-darkbg-border text-slate-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({new Date(exam.exam_date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* SVG Arc Dial Gauge */}
          <div className="relative w-48 h-28 flex items-center justify-center overflow-hidden">
            <svg className="w-48 h-48 transform -rotate-180 origin-center absolute -top-8" viewBox="0 0 200 200">
              {/* Background Arc */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="rgba(35, 27, 66, 0.6)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${halfCircumference} ${halfCircumference}`}
                strokeLinecap="round"
              />
              {/* Foreground Arc */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${halfCircumference} ${halfCircumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Value display */}
            <div className="absolute top-10 flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-100">{Math.round(confidence)}%</span>
              <span className={`text-[10px] font-medium tracking-wide uppercase mt-1 ${status.color}`}>
                {status.text}
              </span>
            </div>
          </div>

          {/* interactive Slider controller */}
          <div className="w-full max-w-xs flex flex-col gap-2 mt-2">
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0% (Not Ready)</span>
              <span>100% (Fully Confident)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={confidence}
              onChange={handleSliderChange}
              onMouseUp={triggerConfidenceUpdate}
              onTouchEnd={triggerConfidenceUpdate}
              className="w-full h-1.5 bg-darkbg-border rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            {isUpdating && <span className="text-[10px] text-purple-400 self-center animate-pulse">Syncing readiness...</span>}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow py-8 text-slate-500 text-sm gap-2">
          <Compass className="w-8 h-8 text-slate-600 animate-spin-slow" />
          <span>No upcoming exams logged.</span>
        </div>
      )}
    </div>
  );
}
