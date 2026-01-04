'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  FunnelChart,
  FunnelSeries,
  FunnelArc,
  FunnelAxis,
  FunnelAxisLabel,
  FunnelAxisLine,
  ChartData,
} from 'reaviz';

interface FunnelDataPoint extends ChartData {
  key: string;
  data: number;
}

interface CallDetailCardProps {
  call: {
    id: string;
    name?: string;
    date: string;
    time: string;
    duration: string;
    mood: string;
    topic?: string;
    reportUrl?: string;
  };
  onClose: () => void;
}

const UpArrowIcon: React.FC<{ className?: string; strokeColor?: string }> = ({
  className = 'w-5 h-[21px]',
  strokeColor = '#F08083',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 21"
    fill="none"
  >
    <path
      d="M5.50134 9.11119L10.0013 4.66675M10.0013 4.66675L14.5013 9.11119M10.0013 4.66675L10.0013 16.3334"
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="square"
    />
  </svg>
);

const DownArrowIcon: React.FC<{ className?: string; strokeColor?: string }> = ({
  className = 'w-5 h-[21px]',
  strokeColor = '#40E5D1',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 21"
    fill="none"
  >
    <path
      d="M14.4987 11.8888L9.99866 16.3333M9.99866 16.3333L5.49866 11.8888M9.99866 16.3333V4.66658"
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="square"
    />
  </svg>
);

const MetricClockIcon: React.FC<{ className?: string; fill?: string }> = ({
  className = 'w-5 h-5',
  fill = '#10b981',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M10.0001 1.66663C5.40511 1.66663 1.66675 5.40499 1.66675 9.99996C1.66675 14.5949 5.40511 18.3333 10.0001 18.3333C14.5951 18.3333 18.3334 14.5949 18.3334 9.99996C18.3334 5.40499 14.5951 1.66663 10.0001 1.66663ZM10.0001 2.91663C13.9195 2.91663 17.0834 6.08054 17.0834 9.99996C17.0834 13.9194 13.9195 17.0833 10.0001 17.0833C6.08066 17.0833 2.91675 13.9194 2.91675 9.99996C2.91675 6.08054 6.08066 2.91663 10.0001 2.91663ZM9.99032 5.82434C9.8247 5.82693 9.66688 5.89515 9.55152 6.01401C9.43616 6.13288 9.37271 6.29267 9.37508 6.45829V10.625C9.37391 10.7078 9.38921 10.79 9.42009 10.8669C9.45098 10.9437 9.49683 11.0137 9.55498 11.0726C9.61313 11.1316 9.68243 11.1785 9.75884 11.2104C9.83525 11.2424 9.91725 11.2589 10.0001 11.2589C10.0829 11.2589 10.1649 11.2424 10.2413 11.2104C10.3177 11.1785 10.387 11.1316 10.4452 11.0726C10.5033 11.0137 10.5492 10.9437 10.5801 10.8669C10.611 10.79 10.6263 10.7078 10.6251 10.625V6.45829C10.6263 6.37464 10.6107 6.2916 10.5792 6.21409C10.5477 6.13658 10.501 6.06618 10.4418 6.00706C10.3826 5.94794 10.3121 5.9013 10.2346 5.86992C10.157 5.83853 10.074 5.82303 9.99032 5.82434ZM10.0001 12.5C9.77907 12.5 9.56711 12.5878 9.41083 12.744C9.25455 12.9003 9.16675 13.1123 9.16675 13.3333C9.16675 13.5543 9.25455 13.7663 9.41083 13.9225C9.56711 14.0788 9.77907 14.1666 10.0001 14.1666C10.2211 14.1666 10.4331 14.0788 10.5893 13.9225C10.7456 13.7663 10.8334 13.5543 10.8334 13.3333C10.8334 13.1123 10.7456 12.9003 10.5893 12.744C10.4331 12.5878 10.2211 12.5 10.0001 12.5Z"
      fill={fill}
    />
  </svg>
);

const MetricHeartIcon: React.FC<{ className?: string; fill?: string }> = ({
  className = 'w-5 h-5',
  fill = '#10b981',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M10 18.35L8.55 17.03C3.4 12.36 0 9.28 0 5.5 0 2.42 2.42 0 5.5 0c1.74 0 3.41.81 4.5 2.09C11.09.81 12.76 0 14.5 0 17.58 0 20 2.42 20 5.5c0 3.78-3.4 6.86-8.55 11.54L10 18.35z"
      fill={fill}
    />
  </svg>
);

const MetricTrendIcon: React.FC<{ className?: string; fill?: string }> = ({
  className = 'w-5 h-5',
  fill = '#10b981',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M2 11l4-4 4 4 6-6v4h2V3h-6v2h4l-4 4-4-4-6 6z"
      fill={fill}
    />
  </svg>
);

const getMoodColor = (mood: string) => {
  const colors: Record<string, string> = {
    "Sad": "bg-blue-500",
    "Anxious": "bg-orange-500",
    "Calm": "bg-green-500",
    "Happy": "bg-yellow-500",
    "Neutral": "bg-gray-500"
  };
  return colors[mood] || "bg-gray-500";
};

const CallDetailCard: React.FC<CallDetailCardProps> = ({ call, onClose }) => {
  const funnelAxisLineColor = '#7E7E8F75';
  
  // Emotion stages through the call as funnel data
  const EMOTION_FUNNEL_DATA: FunnelDataPoint[] = [
    { key: 'Start', data: 100 },
    { key: 'Engagement', data: 85 },
    { key: 'Expression', data: 70 },
    { key: 'Processing', data: 55 },
    { key: 'Resolution', data: 40 },
  ];

  const getMoodMetrics = () => {
    const moodMap: Record<string, { value: number; change: string; changeType: 'increase' | 'decrease' }> = {
      "Sad": { value: 65, change: "+8%", changeType: 'increase' },
      "Anxious": { value: 42, change: "-12%", changeType: 'decrease' },
      "Calm": { value: 78, change: "+15%", changeType: 'increase' },
      "Happy": { value: 55, change: "+5%", changeType: 'increase' },
      "Neutral": { value: 45, change: "-3%", changeType: 'decrease' },
    };
    return moodMap[call.mood] || { value: 50, change: "0%", changeType: 'increase' as const };
  };

  const moodMetrics = getMoodMetrics();
  const durationMinutes = parseInt(call.duration) || 12;

  const metricItems = [
    {
      icon: <MetricClockIcon fill="#10b981" />,
      label: 'Call Duration',
      value: call.duration,
      change: '+2 min',
      changeType: 'increase' as const,
    },
    {
      icon: <MetricHeartIcon fill="#10b981" />,
      label: 'Emotional Intensity',
      value: `${moodMetrics.value}%`,
      change: moodMetrics.change,
      changeType: moodMetrics.changeType,
    },
    {
      icon: <MetricTrendIcon fill="#10b981" />,
      label: 'Engagement Level',
      value: '85%',
      change: '+12%',
      changeType: 'increase' as const,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-[11px_21px_3px_rgba(0,0,0,0.06),14px_27px_7px_rgba(0,0,0,0.10),19px_38px_14px_rgba(0,0,0,0.13),27px_54px_27px_rgba(0,0,0,0.16),39px_78px_50px_rgba(0,0,0,0.20),55px_110px_86px_rgba(0,0,0,0.26)] w-full max-w-3xl max-h-[90vh] overflow-y-auto text-black"
      >
        <div className="flex justify-between items-center p-7 pt-6 pb-8 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold mb-1">Call Analysis</h2>
            {call.name && <p className="text-gray-700 text-base font-medium mb-1">{call.name}</p>}
            <p className="text-gray-600 text-sm">{call.date} at {call.time} • {call.duration}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-7 space-y-6">
          {/* Emotion Funnel Chart */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Emotion Progression</h3>
            <div className="h-[250px] w-full">
              <FunnelChart
                id="emotionFunnel"
                height={250}
                data={EMOTION_FUNNEL_DATA}
                series={
                  <FunnelSeries
                    arc={
                      <FunnelArc
                        colorScheme={['#10b98130', '#10b98175', '#10b981']}
                        gradient={null}
                        variant="layered"
                        glow={{
                          blur: 30,
                          color: '#10b98199',
                        }}
                      />
                    }
                    axis={
                      <FunnelAxis
                        label={
                          <FunnelAxisLabel className="font-bold text-xs text-gray-600" />
                        }
                        line={<FunnelAxisLine strokeColor={funnelAxisLineColor} />}
                      />
                    }
                  />
                }
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="flex w-full justify-between gap-4 pb-4 pt-2">
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-lg text-gray-600">Primary Emotion</span>
              <div className="flex items-center gap-2">
                <CountUp
                  className="font-mono text-4xl font-semibold"
                  start={0}
                  end={moodMetrics.value}
                  duration={2.5}
                />
                <div className={`flex ${moodMetrics.changeType === 'increase' ? 'bg-red-500/30' : 'bg-teal-500/30'} p-1 pl-2 pr-2 items-center rounded-full ${moodMetrics.changeType === 'increase' ? 'text-red-700' : 'text-teal-700'}`}>
                  {moodMetrics.changeType === 'increase' ? (
                    <UpArrowIcon strokeColor="currentColor" />
                  ) : (
                    <DownArrowIcon strokeColor="currentColor" />
                  )}
                  {moodMetrics.change.replace(/[-+]/, '')}
                </div>
              </div>
              <span className="text-gray-500 text-sm">
                {call.mood} detected
              </span>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-lg text-gray-600">Call Quality</span>
              <div className="flex items-center gap-2">
                <CountUp
                  className="font-mono text-4xl font-semibold"
                  start={0}
                  end={85}
                  duration={2.5}
                />
                <div className="flex bg-teal-500/30 p-1 pl-2 pr-2 items-center rounded-full text-teal-700">
                  <DownArrowIcon strokeColor="currentColor" />
                  4%
                </div>
              </div>
              <span className="text-gray-500 text-sm">
                High engagement
              </span>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="flex flex-col divide-y divide-gray-200 font-mono">
            {metricItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex w-full pb-4 pt-4 items-center gap-2"
              >
                <div className="flex flex-row gap-2 items-center text-base w-1/2 text-gray-600">
                  {item.icon}
                  <span className="truncate" title={item.label}>
                    {item.label}
                  </span>
                </div>
                <div className="flex gap-2 w-1/2 justify-end items-center">
                  <span className="font-semibold text-xl">{item.value}</span>
                  <div
                    className={`flex p-1 pl-2 pr-2 items-center rounded-full ${
                      item.changeType === 'increase'
                        ? 'bg-red-500/30 text-red-700'
                        : 'bg-teal-500/30 text-teal-700'
                    }`}
                  >
                    {item.changeType === 'increase' ? (
                      <UpArrowIcon strokeColor="currentColor" />
                    ) : (
                      <DownArrowIcon strokeColor="currentColor" />
                    )}
                    {item.change.replace(/[-+]/, '')}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call Summary */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Call Summary</h3>
            <div className="space-y-3">
              {call.topic && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Topic:</span>
                  <span className="font-medium">{call.topic}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Primary Mood:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getMoodColor(call.mood)} text-white`}>
                  {call.mood}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{call.duration}</span>
              </div>
              {call.reportUrl && (
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // Generate and download report
                      const reportContent = `
AI-Generated Report for ${call.name || 'User'}
Date: ${call.date} at ${call.time}
Duration: ${call.duration}
Mood Detected: ${call.mood}

Summary:
This report contains AI-generated insights based on the check-in session.
The analysis includes emotional patterns, key topics discussed, and recommendations.

Generated by Solace AI
                      `;
                      const blob = new Blob([reportContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${(call.name || 'user').replace(/\s+/g, '-').toLowerCase()}-report-${call.date.replace(/\s+/g, '-').toLowerCase()}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Full Report (PDF)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CallDetailCard;

