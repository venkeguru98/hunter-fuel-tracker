import React from 'react';
import { MotorcycleProfile, FuelStats } from '../../types/fuel';
import { formatDistance, formatOdometer } from '../../utils/formatters';
import { MapPin, ShieldCheck, Fuel } from 'lucide-react';

interface BikeProfileCardProps {
  bikeProfile: MotorcycleProfile;
  stats: FuelStats;
  onEditProfile?: () => void;
}

export const BikeProfileCard: React.FC<BikeProfileCardProps> = ({
  bikeProfile,
  stats,
  onEditProfile,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-graphite-850 to-graphite-900 dark:from-graphite-850 dark:to-graphite-900 bg-white border border-graphite-750/70 dark:border-graphite-750/70 border-slate-200 shadow-card-dark dark:shadow-card-dark shadow-card-light p-4 transition-all">
      {/* Background Subtle Gradient & Carbon Fiber feel */}
      <div className="absolute top-0 right-0 w-64 h-36 bg-gradient-to-bl from-hunter-lime/10 via-transparent to-transparent pointer-events-none rounded-tr-3xl" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-hunter-lime bg-hunter-lime/10 px-2 py-0.5 rounded-full border border-hunter-lime/20">
              {bikeProfile.make}
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 text-slate-500 flex items-center">
              <ShieldCheck className="w-3 h-3 text-emerald-400 mr-1 inline" />
              {bikeProfile.modelYear} J-Series
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white dark:text-white text-slate-900 mt-1">
            {bikeProfile.model}
          </h2>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-400 text-slate-500 flex items-center mt-0.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500 mr-1.5 border border-slate-400" />
            {bikeProfile.edition}
            {bikeProfile.registrationNumber && (
              <span className="ml-2 px-1.5 py-0.2 rounded font-mono text-[10px] bg-graphite-800 dark:bg-graphite-800 bg-slate-100 text-slate-300 dark:text-slate-300 text-slate-600">
                {bikeProfile.registrationNumber}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={onEditProfile}
          className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 text-slate-500 hover:text-white bg-graphite-800/80 dark:bg-graphite-800/80 bg-slate-100 hover:bg-graphite-750 px-2.5 py-1 rounded-xl border border-graphite-700/50 dark:border-graphite-700/50 border-slate-300 transition"
        >
          Edit
        </button>
      </div>

      {/* Hunter 350 Tasteful Stylized Silhouette Graphic */}
      <div className="my-3 py-1 flex items-center justify-center relative">
        <svg
          viewBox="0 0 360 140"
          className="w-full max-w-[320px] h-auto drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="tankGrey" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4b5563" />
              <stop offset="40%" stop-color="#2d333e" />
              <stop offset="100%" stop-color="#181c22" />
            </linearGradient>
            <linearGradient id="metalRim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#1f2937" />
              <stop offset="50%" stop-color="#374151" />
              <stop offset="100%" stop-color="#111827" />
            </linearGradient>
            <filter id="headlightGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="180" cy="132" rx="140" ry="6" fill="#000000" opacity="0.6" />

          {/* Rear Wheel & Tyre (140/70-17) */}
          <circle cx="75" cy="98" r="34" fill="#14171d" stroke="#090a0d" stroke-width="8" />
          <circle cx="75" cy="98" r="28" fill="url(#metalRim)" stroke="#334155" stroke-width="2" />
          <circle cx="75" cy="98" r="14" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />
          {/* Wheel Spokes */}
          <line x1="75" y1="70" x2="75" y2="126" stroke="#475569" stroke-width="1.5" />
          <line x1="47" y1="98" x2="103" y2="98" stroke="#475569" stroke-width="1.5" />
          <line x1="55" y1="78" x2="95" y2="118" stroke="#475569" stroke-width="1.5" />
          <line x1="55" y1="118" x2="95" y2="78" stroke="#475569" stroke-width="1.5" />

          {/* Front Wheel & Tyre (110/70-17) */}
          <circle cx="285" cy="98" r="34" fill="#14171d" stroke="#090a0d" stroke-width="8" />
          <circle cx="285" cy="98" r="28" fill="url(#metalRim)" stroke="#334155" stroke-width="2" />
          <circle cx="285" cy="98" r="14" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />
          {/* Wheel Spokes */}
          <line x1="285" y1="70" x2="285" y2="126" stroke="#475569" stroke-width="1.5" />
          <line x1="257" y1="98" x2="313" y2="98" stroke="#475569" stroke-width="1.5" />
          <line x1="265" y1="78" x2="305" y2="118" stroke="#475569" stroke-width="1.5" />
          <line x1="265" y1="118" x2="305" y2="78" stroke="#475569" stroke-width="1.5" />

          {/* Front Telescopic Forks & Disc */}
          <path d="M 285 98 L 246 36" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round" />
          <path d="M 280 95 L 244 38" stroke="#475569" stroke-width="2" />
          <circle cx="285" cy="98" r="20" fill="none" stroke="#64748b" stroke-width="2.5" stroke-dasharray="3 3" />

          {/* Round Headlight with vintage ring */}
          <circle cx="258" cy="34" r="9" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
          <circle cx="260" cy="34" r="5" fill="#fef08a" opacity="0.8" filter="url(#headlightGlow)" />

          {/* Hunter Handlebars & Offset Single Instrument Pod */}
          <path d="M 240 34 L 235 24 L 218 25" fill="none" stroke="#64748b" stroke-width="3.5" stroke-linecap="round" />
          {/* Instrument Pod */}
          <ellipse cx="232" cy="22" rx="6" ry="4" fill="#090a0d" stroke="#9ae600" stroke-width="1.5" />

          {/* Hunter 350 Teardrop Fuel Tank (Graphite Grey) */}
          <path
            d="M 180 40 C 205 38, 235 44, 240 54 C 238 68, 205 76, 175 72 C 160 70, 155 58, 162 48 Z"
            fill="url(#tankGrey)"
            stroke="#6b7280"
            stroke-width="2"
          />
          {/* Lime Green Accent Strip on Tank */}
          <path d="M 178 50 C 196 48, 222 52, 230 58" fill="none" stroke="#9ae600" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="205" cy="46" r="3.5" fill="#94a3b8" stroke="#1e293b" stroke-width="1" /> {/* Fuel Filler Cap */}

          {/* Roadster Single-Piece Tuck & Roll Seat */}
          <path
            d="M 115 54 C 130 52, 160 52, 178 58 C 170 65, 140 68, 115 63 Z"
            fill="#18181b"
            stroke="#27272a"
            stroke-width="2"
          />
          {/* Rear Compact Tail Fender */}
          <path d="M 90 62 L 115 56 L 118 64 L 85 75 Z" fill="#2d333e" />
          <circle cx="82" cy="74" r="3.5" fill="#ef4444" /> {/* Tail light */}

          {/* J-Series 349cc Engine Block & Crankcase */}
          <rect x="145" y="70" width="48" height="38" rx="8" fill="#181b22" stroke="#334155" stroke-width="2" />
          {/* Cooling Fins */}
          <line x1="149" y1="76" x2="187" y2="76" stroke="#475569" stroke-width="2" />
          <line x1="148" y1="82" x2="189" y2="82" stroke="#475569" stroke-width="2" />
          <line x1="150" y1="88" x2="188" y2="88" stroke="#475569" stroke-width="2" />
          {/* Royal Enfield Round Case Cover */}
          <circle cx="166" cy="96" r="11" fill="#262c37" stroke="#94a3b8" stroke-width="1.5" />
          <text x="166" y="99" font-size="6" fill="#9ae600" font-weight="bold" text-anchor="middle">RE</text>

          {/* Blacked-out Up-swept Roadster Exhaust Pipe */}
          <path
            d="M 188 78 C 196 92, 185 110, 165 110 L 110 110 C 95 110, 80 102, 70 94"
            fill="none"
            stroke="#1e232b"
            stroke-width="7"
            stroke-linecap="round"
          />
          <path
            d="M 115 110 L 72 95"
            fill="none"
            stroke="#374151"
            stroke-width="5"
            stroke-linecap="round"
          />

          {/* Rear Twin Shock Absorber */}
          <line x1="90" y1="68" x2="78" y2="95" stroke="#ef4444" stroke-width="4" stroke-linecap="round" />
          <line x1="90" y1="68" x2="78" y2="95" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="2 3" />
        </svg>
      </div>

      {/* Odometer Pod & Total Travelled Bar */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-graphite-800/80 dark:border-graphite-800/80 border-slate-200">
        {/* Current Odo */}
        <div className="bg-graphite-900/90 dark:bg-graphite-900/90 bg-slate-50 rounded-2xl p-2.5 border border-graphite-800 dark:border-graphite-800 border-slate-200 flex flex-col">
          <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 dark:text-slate-400 text-slate-500 flex items-center">
            <Fuel className="w-3 h-3 text-amber-500 mr-1" />
            Current ODO
          </span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="font-mono text-lg font-black tracking-wider text-white dark:text-white text-slate-900">
              {stats.currentOdometer > 0 ? formatOdometer(stats.currentOdometer) : 'Not logged'}
            </span>
            {stats.currentOdometer > 0 && <span className="text-[10px] font-bold text-slate-400">km</span>}
          </div>
        </div>

        {/* Total Travelled */}
        <div className="bg-graphite-900/90 dark:bg-graphite-900/90 bg-slate-50 rounded-2xl p-2.5 border border-graphite-800 dark:border-graphite-800 border-slate-200 flex flex-col">
          <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 dark:text-slate-400 text-slate-500 flex items-center">
            <MapPin className="w-3 h-3 text-hunter-lime mr-1" />
            Tracked Distance
          </span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="font-mono text-lg font-black tracking-tight text-hunter-lime">
              {stats.totalDistance > 0 ? `+${formatDistance(stats.totalDistance).replace(' km', '')}` : '0'}
            </span>
            <span className="text-[10px] font-bold text-slate-400">km</span>
          </div>
        </div>
      </div>
    </div>
  );
};
