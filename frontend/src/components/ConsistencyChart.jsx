import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Calendar, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ConsistencyChart({ weeklyHours, consistencyScore, averageHours }) {
  const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Hours Studied',
        data: weeklyHours || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(168, 85, 247, 0.75)', // Indigo violet
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(192, 132, 252, 0.9)',
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
        boxPadding: 4,
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
        border: {
          dash: [4, 4],
        },
        grid: {
          color: 'rgba(35, 27, 66, 0.5)',
        },
        ticks: {
          color: '#94a3b8',
          callback: (value) => `${value}h`,
        },
        min: 0,
      },
    },
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col h-96">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Study Hour Consistency
          </h3>
          <p className="text-xs text-slate-400">Weekly tracked hours and engagement patterns</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-2xl font-bold text-slate-100">{averageHours || 0}h</span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Avg Hours/Day</span>
          </div>
          <div className="text-right border-l border-slate-700 pl-4">
            <span className={`text-2xl font-bold ${consistencyScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {consistencyScore || 0}%
            </span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Consistency</span>
          </div>
        </div>
      </div>
      
      <div className="relative flex-grow min-h-0 w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
