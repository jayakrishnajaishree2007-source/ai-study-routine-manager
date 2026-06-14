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
  Legend
} from 'chart.js';
import { TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AccuracyTrendsChart({ accuracyTrends }) {
  const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
  
  // Custom colors for subjects
  const subjectColors = {
    Math: {
      border: 'rgba(168, 85, 247, 1)', // purple
      bg: 'rgba(168, 85, 247, 0.2)',
    },
    Science: {
      border: 'rgba(56, 189, 248, 1)', // sky blue
      bg: 'rgba(56, 189, 248, 0.2)',
    },
    History: {
      border: 'rgba(244, 63, 94, 1)', // rose pink
      bg: 'rgba(244, 63, 94, 0.2)',
    },
    default: {
      border: 'rgba(251, 191, 36, 1)', // amber
      bg: 'rgba(251, 191, 36, 0.2)',
    }
  };

  const datasets = accuracyTrends ? Object.keys(accuracyTrends).map((subject) => {
    const colors = subjectColors[subject] || subjectColors.default;
    return {
      label: subject,
      data: accuracyTrends[subject],
      borderColor: colors.border,
      backgroundColor: colors.bg,
      borderWidth: 2,
      tension: 0.3, // smooth curves
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: colors.border,
      fill: false,
    };
  }) : [];

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          boxWidth: 10,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: '#130e29',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: '#231b42',
        borderWidth: 1,
        padding: 12,
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
          callback: (value) => `${value}%`,
        },
        min: 40,
        max: 100,
      },
    },
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col h-96">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sky-400" />
          Subject Accuracy Trends
        </h3>
        <p className="text-xs text-slate-400">Quiz and test performance over a 6-week rolling period</p>
      </div>
      
      <div className="relative flex-grow min-h-0 w-full">
        {datasets.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            No accuracy trends data available
          </div>
        )}
      </div>
    </div>
  );
}
