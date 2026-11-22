import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { FuelEntry, FuelStats } from '../../types/fuel';
import { getMileageTrendData, getMonthlyAnalytics } from '../../utils/calculations';
import { formatCurrency, formatDistance, formatLitres, formatMileage } from '../../utils/formatters';
import { TrendingUp, Calendar, IndianRupee, MapPin, Award, Fuel, Sparkles } from 'lucide-react';

interface AnalyticsViewProps {
  entries: FuelEntry[];
  stats: FuelStats;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ entries, stats }) => {
  const [chartView, setChartView] = useState<'mileage' | 'expense' | 'distance'>('mileage');

  const mileageData = getMileageTrendData(entries);
  const monthlyData = getMonthlyAnalytics(entries);

  // Bounds for mileage chart
  const mileages = mileageData.map((d) => d.mileage);
  const minM = mileages.length > 0 ? Math.max(15, Math.floor(Math.min(...mileages) - 3)) : 20;
  const maxM = mileages.length > 0 ? Math.min(55, Math.ceil(Math.max(...mileages) + 3)) : 50;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white dark:text-white text-slate-900 tracking-tight">
          Mileage & Expense Analytics
        </h2>
        <p className="text-xs text-slate-400">
          Real-world performance patterns for Royal Enfield Hunter 350
        </p>
      </div>

      {/* Top 4 KPI Tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Average Mileage */}
        <div className="p-3.5 rounded-2xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Average Mileage</span>
            <TrendingUp className="w-3.5 h-3.5 text-hunter-lime" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="font-mono text-2xl font-black text-white dark:text-white text-slate-900">
              {formatMileage(stats.averageMileage).replace(' km/l', '')}
            </span>
            <span className="text-xs font-mono font-bold text-hunter-lime">km/l</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Weighted interval avg</span>
        </div>

        {/* Best Mileage */}
        <div className="p-3.5 rounded-2xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Best Recorded</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="font-mono text-2xl font-black text-emerald-400">
              {formatMileage(stats.bestMileage).replace(' km/l', '')}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">km/l</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Highway peak</span>
        </div>

        {/* Lowest Mileage */}
        <div className="p-3.5 rounded-2xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Lowest Recorded</span>
            <Fuel className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="font-mono text-2xl font-black text-slate-300 dark:text-slate-300 text-slate-700">
              {formatMileage(stats.lowestMileage).replace(' km/l', '')}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">km/l</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Heavy stop-and-go city</span>
        </div>

        {/* Fuel Cost / KM */}
        <div className="p-3.5 rounded-2xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Running Cost</span>
            <IndianRupee className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="font-mono text-2xl font-black text-white dark:text-white text-slate-900">
              {stats.averageCostPerKm !== null ? `₹${stats.averageCostPerKm.toFixed(2)}` : '--'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">/ km</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Direct fuel expense</span>
        </div>
      </div>

      {/* Chart Switcher Tabs */}
      <div className="p-1 rounded-2xl bg-graphite-950 dark:bg-graphite-950 bg-slate-100 border border-graphite-800 dark:border-graphite-800 border-slate-200 grid grid-cols-3 gap-1">
        <button
          onClick={() => setChartView('mileage')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
            chartView === 'mileage'
              ? 'bg-hunter-lime text-graphite-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3 h-3" />
          <span>Mileage</span>
        </button>

        <button
          onClick={() => setChartView('expense')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
            chartView === 'expense'
              ? 'bg-hunter-lime text-graphite-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <IndianRupee className="w-3 h-3" />
          <span>Expenses</span>
        </button>

        <button
          onClick={() => setChartView('distance')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
            chartView === 'distance'
              ? 'bg-hunter-lime text-graphite-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3 h-3" />
          <span>Distance</span>
        </button>
      </div>

      {/* Active Chart Display Container */}
      <div className="rounded-3xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200 p-4 shadow-card-dark dark:shadow-card-dark shadow-card-light">
        {chartView === 'mileage' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white dark:text-white text-slate-900">
                Mileage Trend (km/l)
              </h3>
              <span className="text-[10px] font-mono text-hunter-lime font-bold">
                Consecutive Full Tanks
              </span>
            </div>

            {mileageData.length >= 2 ? (
              <div className="h-56 w-full -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mileageData} margin={{ top: 10, right: 15, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsLimeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9ae600" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#9ae600" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262c36" vertical={false} />
                    <XAxis
                      dataKey="formattedDate"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[minM, maxM]}
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      unit="k"
                      width={30}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-graphite-950 text-white border border-graphite-700 px-3 py-2 rounded-xl shadow-2xl text-xs space-y-1">
                              <p className="font-mono font-bold text-hunter-lime text-sm">
                                {item.mileage} km/l
                              </p>
                              <p className="text-[10px] text-slate-300">
                                Date: {item.date}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Odo: {formatDistance(item.odometer)}
                              </p>
                              {item.costPerKm && (
                                <p className="text-[10px] text-slate-400">
                                  Running cost: ₹{item.costPerKm.toFixed(2)}/km
                                </p>
                              )}
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
                      fill="url(#analyticsLimeGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-12 text-center">
                Need at least 2 full-tank entries to graph mileage trend.
              </p>
            )}
          </div>
        )}

        {chartView === 'expense' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white dark:text-white text-slate-900">
                Monthly Fuel Expenditure (₹)
              </h3>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                Monthly Totals
              </span>
            </div>

            {monthlyData.length > 0 ? (
              <div className="h-56 w-full -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 15, left: -5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262c36" vertical={false} />
                    <XAxis
                      dataKey="displayMonth"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={38}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-graphite-950 text-white border border-graphite-700 px-3 py-2 rounded-xl shadow-2xl text-xs space-y-1">
                              <p className="font-mono font-bold text-amber-400 text-sm">
                                {formatCurrency(item.totalCost)}
                              </p>
                              <p className="text-[10px] text-slate-300">
                                Month: {item.displayMonth}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Fuel: {formatLitres(item.totalLitres)} ({item.entriesCount} refuels)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="totalCost"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-12 text-center">
                No expense data recorded yet.
              </p>
            )}
          </div>
        )}

        {chartView === 'distance' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white dark:text-white text-slate-900">
                Monthly Distance Travelled (km)
              </h3>
              <span className="text-[10px] font-mono text-sky-400 font-bold">
                Km Logged
              </span>
            </div>

            {monthlyData.length > 0 ? (
              <div className="h-56 w-full -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 15, left: -5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262c36" vertical={false} />
                    <XAxis
                      dataKey="displayMonth"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={34}
                      unit="k"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-graphite-950 text-white border border-graphite-700 px-3 py-2 rounded-xl shadow-2xl text-xs space-y-1">
                              <p className="font-mono font-bold text-sky-400 text-sm">
                                {formatDistance(item.totalDistance)}
                              </p>
                              <p className="text-[10px] text-slate-300">
                                Month: {item.displayMonth}
                              </p>
                              {item.averageMileage && (
                                <p className="text-[10px] text-hunter-lime">
                                  Avg: {item.averageMileage} km/l
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="totalDistance"
                      fill="#38bdf8"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-12 text-center">
                No distance records yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Monthly Breakdown Table */}
      {monthlyData.length > 0 && (
        <div className="rounded-3xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200 p-4">
          <h3 className="text-xs font-bold text-white dark:text-white text-slate-900 mb-3">
            Monthly Performance Summary
          </h3>
          <div className="space-y-2">
            {monthlyData.map((m) => (
              <div
                key={m.monthKey}
                className="flex items-center justify-between p-2.5 rounded-xl bg-graphite-950/80 dark:bg-graphite-950/80 bg-slate-50 border border-graphite-850 dark:border-graphite-850 border-slate-200 text-xs"
              >
                <div>
                  <span className="font-bold text-white dark:text-white text-slate-900 block">
                    {m.displayMonth}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {m.entriesCount} {m.entriesCount === 1 ? 'refuel' : 'refuels'} • {formatLitres(m.totalLitres)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-white dark:text-white text-slate-900 block">
                    {formatCurrency(m.totalCost)}
                  </span>
                  <span className="text-[10px] font-mono text-hunter-lime font-bold">
                    {m.averageMileage ? `${m.averageMileage} km/l` : `${m.totalDistance} km`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
