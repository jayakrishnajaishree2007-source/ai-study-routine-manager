import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js';
import { ShieldAlert } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export default function StressTimeline({ stressScores, stressDates }) {
  
  // Custom points colors based on values: Green (low <= 4), Amber (mod 5-7), Red (high >= 8)
  const getPointColor = (val) => {
    if (val >= 8) return 'rgba(239, 68, 68, 1)'; // red
    if (val >= 5) return 'rgba(245, 158, 11, 1)'; // orange/amber
    return 'rgba(16, 185, 129, 1)'; // green
  };

  const colorsList = stressScores ? stressScores.map(getPointColor) : [];

  const data = {
    labels: stressDates || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Stress Score (1-10)',
        data: stressScores || [5, 5, 5, 5, 5],
        borderColor: 'rgba(244, 63, 94, 0.85)', // Rose red line
        backgroundColor: 'rgba(244, 63, 94, 0.05)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: colorsList,
        pointBorderColor: colorsList,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#130e29',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: '#231b42',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const val = context.raw;
            let zone = 'Low';
            if (val >= 8) zone = 'High Risk';
            else if (val >= 5) zone = 'Moderate';
            return `Stress: ${val}/10 (${zone})`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      y: {
        min: 1,
        max: 10,
        ticks: {
          stepSize: 1,
          color: '#94a3b8',
        },
        grid: {
          color: (context) => {
            // Draw different color lines for boundaries
            if (context.tick.value === 4 || context.tick.value === 7) {
              return 'rgba(168, 85, 247, 0.35)'; // Purple boundary lines
            }
            return 'rgba(35, 27, 66, 0.3)';
          },
          borderDash: (context) => {
            if (context.tick.value === 4 || context.tick.value === 7) {
              return [6, 6];
            }
            return [];
          }
        },
      },
    },
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col h-96">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Stress Index values
          </h3>
          <p className="text-xs text-slate-400">Mental workload levels & stability thresholds</p>
        </div>
        <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Low (1-4)</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Mod (5-7)</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">High (8-10)</span>
        </div>
      </div>

      <div className="relative flex-grow min-h-0 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
