import React, { useState } from 'react';
import { ClipboardList, ChevronDown, ChevronUp, Sparkles, AlertCircle, ThumbsUp, ThumbsDown, Ban, CheckCircle } from 'lucide-react';

export default function LearningPlan({ tasks, onTaskFeedback }) {
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
    return explanation.replace('AI Score Explanation: Baseline: 50.0. ', '').split(' | ');
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col h-full min-h-[400px]">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-400" />
            Personalized Study Routine
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Adaptive AI Engine Active
          </span>
        </div>
        <p className="text-xs text-slate-400">Mark task completed/skipped, provide difficulty feedback to optimize next routine</p>
      </div>

      <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-3">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;
            const xaiTerms = formatExplanation(task.explanation);

            // Container dynamic styling based on task progress state
            let containerStyle = "bg-darkbg-card border-darkbg-border hover:border-purple-500/30";
            if (task.completed) {
              containerStyle = "bg-slate-900/30 border-slate-800/40 opacity-60";
            } else if (task.skipped) {
              containerStyle = "bg-rose-950/10 border-rose-900/20 opacity-40";
            }

            return (
              <div
                key={task.id}
                className={`rounded-xl border transition-all duration-300 ${containerStyle}`}
              >
                {/* Task row */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
                  
                  {/* Left block: checkbox & titles */}
                  <div className="flex items-center gap-3 flex-grow min-w-0">
                    <button
                      onClick={() => onTaskFeedback(task.id, !task.completed, false, task.difficulty_feedback)}
                      className={`focus:outline-none transition-colors ${task.completed ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <div onClick={() => toggleExpand(task.id)} className="flex-grow min-w-0 cursor-pointer">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mr-2 bg-darkbg-border text-slate-300`}>
                        {task.subject}
                      </span>
                      <p className={`text-xs font-semibold inline ${
                        task.completed ? 'line-through text-slate-500' : task.skipped ? 'line-through text-slate-600' : 'text-slate-200'
                      }`}>
                        {task.title}
                      </p>
                    </div>
                  </div>

                  {/* Right block: Action widgets */}
                  <div className="flex items-center gap-3 justify-end flex-shrink-0">
                    
                    {/* Skip trigger */}
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

                    {/* Difficulty attributions */}
                    <div className="flex items-center border border-darkbg-border rounded-lg bg-darkbg-sidebar p-0.5 gap-0.5">
                      <button
                        onClick={() => onTaskFeedback(task.id, task.completed, task.skipped, task.difficulty_feedback === 'thumbs_up' ? null : 'thumbs_up')}
                        title="Optimal Difficulty (Thumbs Up)"
                        className={`p-1 rounded focus:outline-none transition-all ${
                          task.difficulty_feedback === 'thumbs_up'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onTaskFeedback(task.id, task.completed, task.skipped, task.difficulty_feedback === 'thumbs_down' ? null : 'thumbs_down')}
                        title="Too Hard / High Fatigue (Thumbs Down)"
                        className={`p-1 rounded focus:outline-none transition-all ${
                          task.difficulty_feedback === 'thumbs_down'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
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
                </div>

                {/* XAI Attribution panel */}
                {isExpanded && (
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
            All prioritized tasks for today are completed or skipped!
          </div>
        )}
      </div>
    </div>
  );
}
