import React from 'react';
import { FuelStats } from '../../types/fuel';
import { formatMileage } from '../../utils/formatters';
import { Flame, TrendingUp, AlertTriangle } from 'lucide-react';

interface InstrumentDialProps {
  stats: FuelStats;
  onAddFuelClick?: () => void;
}

export const InstrumentDial: React.FC<InstrumentDialProps> = ({ stats, onAddFuelClick }) => {
  const latest = stats.latestMileage;
  const avg = stats.averageMileage;

  // Typical Hunter 350 mileage range: 25 km/l (low city) to 45 km/l (pure highway)
  // Gauge arc range: 0 to 50 km/l
  const maxScale = 50;
  const safeMileage = latest ? Math.min(Math.max(latest, 0), maxScale) : 0;
  // Arc calculation: circumference of circle r=110: 2 * PI * 110 = 691.15
  // We use an open arc spanning 260 degrees (from 140deg to 400deg)
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (260 / 360); // visible track length (~453.7)
  const fillRatio = latest ? Math.min(Math.max(latest / maxScale, 0), 1) : 0;
  const strokeDashoffset = arcLength * (1 - fillRatio);

  // Comparison with average
  const deltaFromAvg = latest && avg ? Math.round((latest - avg) * 10) / 10 : null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-graphite-900 to-graphite-950 dark:from-graphite-900 dark:to-graphite-950 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200 shadow-dial dark:shadow-dial shadow-subtle p-5 flex flex-col items-center justify-center text-center">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-hunter-lime/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cluster Dial SVG */}
      <div className="relative w-64 h-56 flex items-center justify-center">
        <svg
          viewBox="0 0 260 230"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
        >
          <defs>
            <linearGradient id="meterGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="45%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#a3e635" />
            </linearGradient>

            <filter id="dialGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Dial Outer Bezel */}
          <circle
            cx="130"
            cy="130"
            r="115"
            fill="none"
            stroke="#1c212a"
            strokeWidth="3"
            strokeDasharray="4 6"
          />

          {/* Background Meter Track (Open at bottom) */}
          <path
            d="M 52 195 A 100 100 0 1 1 208 195"
            fill="none"
            stroke="#1a1e26"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Active Performance Meter Track */}
          {latest !== null && (
            <path
              d="M 52 195 A 100 100 0 1 1 208 195"
              fill="none"
              stroke="url(#meterGradient)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              filter="url(#dialGlow)"
              className="transition-all duration-1000 ease-out"
            />
          )}

          {/* Tick Marks around the cluster */}
          <g stroke="#475569" strokeWidth="2" strokeLinecap="round" opacity="0.6">
            <line x1="58" y1="190" x2="68" y2="182" />
            <line x1="42" y1="150" x2="54" y2="147" />
            <line x1="44" y1="110" x2="56" y2="114" />
            <line x1="64" y1="72" x2="74" y2="82" />
            <line x1="98" y1="46" x2="104" y2="58" />
            <line x1="130" y1="38" x2="130" y2="52" stroke="#9ae600" strokeWidth="3" />
            <line x1="162" y1="46" x2="156" y2="58" />
            <line x1="196" y1="72" x2="186" y2="82" />
            <line x1="216" y1="110" x2="204" y2="114" />
            <line x1="218" y1="150" x2="206" y2="147" />
            <line x1="202" y1="190" x2="192" y2="182" />
          </g>

          {/* Dial Scale Numbers */}
          <text x="66" y="206" fontSize="10" fontFamily="monospace" fill="#64748b" textAnchor="middle">0</text>
          <text x="44" y="104" fontSize="10" fontFamily="monospace" fill="#64748b" textAnchor="middle">20</text>
          <text x="130" y="32" fontSize="11" fontFamily="monospace" fill="#9ae600" fontWeight="bold" textAnchor="middle">35</text>
          <text x="216" y="104" fontSize="10" fontFamily="monospace" fill="#64748b" textAnchor="middle">45</text>
          <text x="194" y="206" fontSize="10" fontFamily="monospace" fill="#64748b" textAnchor="middle">50+</text>
        </svg>

        {/* Digital Core (Inside the Cluster Dial) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400 dark:text-slate-400 text-slate-500 mb-1">
            LATEST MILEAGE
          </span>

          {latest !== null ? (
            <div className="flex items-baseline space-x-1">
              <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white dark:text-white text-slate-900 drop-shadow-sm">
                {latest.toFixed(1)}
              </span>
              <span className="font-mono text-xs font-bold text-hunter-lime tracking-tight">
                km/l
              </span>
            </div>
          ) : stats.totalEntriesCount === 0 ? (
            <div className="flex flex-col items-center">
              <span className="font-mono text-xl font-bold text-slate-400">
                NO DATA
              </span>
              <span className="text-[10px] text-slate-400 max-w-[140px] leading-tight mt-0.5">
                Tap + Add Fuel to log first refill
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="font-mono text-xl font-bold text-amber-400">
                PENDING
              </span>
              <span className="text-[10px] text-slate-400 max-w-[140px] leading-tight mt-0.5">
                Need next full tank refill
              </span>
            </div>
          )}

          {/* Performance Delta pill */}
          {deltaFromAvg !== null && (
            <div
              className={`mt-2 flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                deltaFromAvg >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {deltaFromAvg >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>+{deltaFromAvg} km/l vs avg</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>{deltaFromAvg} km/l vs avg</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick context subtitle */}
      <div className="mt-1 flex items-center justify-center space-x-2 text-xs text-slate-400 dark:text-slate-400 text-slate-500">
        <span>Hunter 350 J-Series Eco Tuning</span>
        <span className="text-hunter-lime font-mono font-bold">•</span>
        <span className="text-slate-300 dark:text-slate-300 text-slate-700 font-medium">
          Tank: 13L Cap.
        </span>
      </div>
    </div>
  );
};
