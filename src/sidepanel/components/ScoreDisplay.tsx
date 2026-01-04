import React from "react";

interface ScoreDisplayProps {
  score: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const colorClass =
    score >= 90
      ? "stroke-severity-success"
      : score >= 70
      ? "stroke-severity-medium"
      : "stroke-severity-critical";

  const textColorClass =
    score >= 90
      ? "fill-severity-success"
      : score >= 70
      ? "fill-severity-medium"
      : "fill-severity-critical";

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center w-32">
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className="stroke-slate-200"
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          strokeWidth="8"
        />
        <circle
          className={`transition-all duration-1000 ease-out ${colorClass}`}
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <text
          x="50"
          y="55"
          textAnchor="middle"
          className={`text-2xl font-extrabold rotate-90 origin-center ${textColorClass}`}
        >
          {score}
        </text>
      </svg>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider -mt-2">
        SEO Health Score
      </div>
    </div>
  );
};
