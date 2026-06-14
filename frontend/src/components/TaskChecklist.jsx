import React, { useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Ban, Info, Clock, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';

export default function TaskChecklist({ tasks, onTaskFeedback }) {
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const getPriorityBadgeColor = (score) => {
    if (score >= 80) return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    if (score >= 60) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  };

  const formatExplanation = (explanation) => {
    if (!explanation) return [];
    return explanation.replace('AI Score Explanation (Base: 50.0) | ', '').split(' | ');
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col h-full min-h-[400px]">
      
      {/* Title block */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            AI-Driven Study Routine
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Adaptive Scheduler Active
          </span>
        </div>
        <p className="text-xs text-slate-400">Optimize priorities on-the-fly by completing tasks and rating difficulty pacing</p>
      </div>

      {/* Checklist list */}
      <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-3">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;
            const xaiTerms = formatExplanation(task.explanation);

            // Container dynamics
            let cardStyle = "bg-darkbg-card border-darkbg-border hover:border-purple-500/30";
            if (task.completed) {
              cardStyle = "bg-slate-900/30 border-slate-800/40 opacity-60";
            } else if (task.skipped) {
              cardStyle = "bg-rose-950/10 border-rose-900/20 opacity-40";
            } else if (task.is_break) {
              cardStyle = "bg-purple-950/20 border-purple-500/20 shadow-purple-950/5 animate-pulse";
            }

            return (
              <div
                key={task.id}
                className={`rounded-xl border transition-all duration-300 ${cardStyle}`}
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left block: Custom hollow-to-solid checkbox & titles */}
                  <div className="flex items-center gap-3.5 flex-grow min-w-0">
                    {!task.is_break ? (
                      <button
                        onClick={() => onTaskFeedback(task.id, !task.completed, false, task.difficulty_feedback)}
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 focus:outline-none ${
                          task.completed 
                            ? 'border-purple-500 bg-purple-600 text-slate-100 shadow-md shadow-purple-500/10' 
                            : 'border-purple-400 hover:border-purple-300 bg-transparent text-transparent hover:scale-105'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    ) : (
                      <div className="w-5 h-5 flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      </div>
                    )}
                    
                    <div onClick={() => !task.is_break && toggleExpand(task.id)} className={`flex-grow min-w-0 ${!task.is_break ? 'cursor-pointer' : ''}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mr-2 bg-darkbg-border text-slate-300 ${
                        task.is_break ? 'bg-purple-900/30 text-purple-300 border border-purple-500/20' : ''
                      }`}>
                        {task.subject}
                      </span>
                      <p className={`text-xs font-semibold inline ${
                        task.completed ? 'line-through text-slate-500' : task.skipped ? 'line-through text-slate-600' : 'text-slate-200'
                      }`}>
                        {task.title}
                      </p>
                      
                      {/* Spaced repetition & duration badges */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {task.duration_minutes} Mins
                        </span>
                        {task.is_revision && (
                          <span className="text-[9px] uppercase font-extrabold tracking-wider bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse">
                            Spaced Repetition
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right block: Rating widgets & skip handles */}
                  {!task.is_break && (
                    <div className="flex items-center gap-3 justify-end flex-shrink-0">
                      
                      {/* Skip button */}
                      <button
                        onClick={() => onTaskFeedback(task.id, false, !task.skipped, task.difficulty_feedback)}
                        title="Mark as Skipped"
                        className={`p-1.5 rounded-lg border focus:outline-none transition-all ${
                          task.skipped 
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                            : 'bg-darkbg-sidebar border-darkbg-border text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>

                      {/* Difficulty rating buttons */}
                      <div className="flex items-center border border-darkbg-border rounded-lg bg-darkbg-sidebar p-0.5 gap-0.5">
                        <button
                          onClick={() => onTaskFeedback(task.id, task.completed, task.skipped, task.difficulty_feedback === 'thumbs_up' ? null : 'thumbs_up')}
                          title="Rate Difficulty: Optimal"
                          className={`p-1 rounded focus:outline-none transition-all ${
                            task.difficulty_feedback === 'thumbs_up'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onTaskFeedback(task.id, task.completed, task.skipped, task.difficulty_feedback === 'thumbs_down' ? null : 'thumbs_down')}
                          title="Rate Difficulty: Too Hard / Rushed"
                          className={`p-1 rounded focus:outline-none transition-all ${
                            task.difficulty_feedback === 'thumbs_down'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${getPriorityBadgeColor(task.priority_score)}`}>
                        Priority: {task.priority_score}
                      </span>
                      
                      <button
                        onClick={() => toggleExpand(task.id)}
                        className="text-slate-400 hover:text-slate-200 focus:outline-none"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* XAI details dropdown */}
                {isExpanded && !task.is_break && (
                  <div className="px-4 pb-4 pt-1 border-t border-darkbg-border/60 bg-purple-950/10 rounded-b-xl">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" />
                      Explainable AI (XAI) Attribution:
                    </h5>
                    <div className="flex flex-col gap-1.5">
                      {xaiTerms.map((term, termIdx) => (
                        <div key={termIdx} className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                          <span>{term}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            All prioritized study routine tasks completed or skipped!
          </div>
        )}
      </div>
    </div>
  );
}
