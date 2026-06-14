import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, MessageSquareText } from 'lucide-react';

export default function Recommendations({ alerts }) {
  const getAlertStyles = (type) => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-rose-950/40 border-rose-800/40 text-rose-200',
          icon: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
          title: 'High Alert',
          shadow: 'shadow-rose-950/10'
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/40 border-amber-800/40 text-amber-200',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
          title: 'Advisory Nudge',
          shadow: 'shadow-amber-950/10'
        };
      case 'success':
      default:
        return {
          bg: 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
          title: 'System Optimal',
          shadow: 'shadow-emerald-950/10'
        };
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col h-96">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <MessageSquareText className="w-5 h-5 text-purple-400" />
          AI Recommendations & Diagnostics
        </h3>
        <p className="text-xs text-slate-400">Context-aware advice based on routine telemetry</p>
      </div>

      <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-3">
        {alerts && alerts.length > 0 ? (
          alerts.map((alert, idx) => {
            const styles = getAlertStyles(alert.type);
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex gap-3 shadow-md transition-all duration-300 ${styles.bg} ${styles.shadow}`}
              >
                {styles.icon}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1 opacity-90">{styles.title}</h4>
                  <p className="text-xs font-medium leading-relaxed">{alert.text}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            All telemetry metrics are currently stable. No alerts.
          </div>
        )}
      </div>
    </div>
  );
}
