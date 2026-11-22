import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { FuelEntry } from '../../types/fuel';
import { getMileageTrendData } from '../../utils/calculations';
import { TrendingUp } from 'lucide-react';

interface MileageTrendMiniProps {
  entries: FuelEntry[];
  onViewAnalytics?: () => void;
}

export const MileageTrendMini: React.FC<MileageTrendMiniProps> = ({
  entries,
  onViewAnalytics,
}) => {
  const data = getMileageTrendData(entries);

  if (data.length < 2) {
    return (
      <div className="rounded-3xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200 p-4 text-center">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white dark:text-white text-slate-800 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 text-hunter-lime mr-1.5" />
            Mileage Trend
          </span>
        </div>
        <p className="text-xs text-slate-400 py-3">
          Need at least 2 full-tank refuels to display the mileage progression curve.
        </p>
      </div>
    );
  }

  // Calculate min & max for tight Y-axis domain
  const mileages = data.map((d) => d.mileage);
  const minM = Math.max(20, Math.floor(Math.min(...mileages) - 2));
  const maxM = Math.min(55, Math.ceil(Math.max(...mileages) + 2));

  return (
    <div className="rounded-3xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200 shadow-card-dark dark:shadow-card-dark shadow-card-light p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-hunter-lime/10 flex items-center justify-center text-hunter-lime">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white dark:text-white text-slate-900">
              Mileage Trend (km/l)
            </h3>
            <p className="text-[10px] text-slate-400">Chronological full-tank performance</p>
          </div>
        </div>

        {onViewAnalytics && (
          <button
            onClick={onViewAnalytics}
            className="text-[11px] font-bold text-hunter-lime hover:underline px-1"
          >
            Insights →
          </button>
        )}
      </div>

      {/* Mini Responsive Chart */}
      <div className="h-40 w-full -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9ae600" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#9ae600" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="formattedDate"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              domain={[minM, maxM]}
              tickLine={false}
              axisLine={false}
              unit="k"
              width={26}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-graphite-950 text-white border border-graphite-700 px-3 py-1.5 rounded-xl shadow-xl text-xs">
                      <p className="font-bold text-hunter-lime font-mono">
                        {item.mileage} km/l
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.formattedDate} • {item.odometer} km
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="mileage"
              stroke="#9ae600"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#limeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
