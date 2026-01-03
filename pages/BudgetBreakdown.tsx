
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trip, Activity } from '../types';
import { MockDB } from '../services/db';
import { ICONS, COLORS } from '../constants';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  'Food': '#10B981',
  'Sightseeing': '#F7B43A',
  'Transport': '#3B82F6',
  'Accommodation': '#8B5CF6',
  'Other': '#F43F5E',
};

const BudgetBreakdown: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (id) {
      const data = MockDB.getTrip(id);
      if (data) setTrip(data);
    }
  }, [id]);

  const stats = useMemo(() => {
    if (!trip) return null;

    const allActivities = trip.stops.flatMap(s => s.activities);
    const totalSpent = allActivities.reduce((sum, a) => sum + a.cost, 0);
    
    // Category Breakdown
    const byCategory = allActivities.reduce((acc, act) => {
      acc[act.category] = (acc[act.category] || 0) + act.cost;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

    // Daily Breakdown
    const byDate = allActivities.reduce((acc, act) => {
      acc[act.date] = (acc[act.date] || 0) + act.cost;
      return acc;
    }, {} as Record<string, number>);

    // Ensure all days in trip range are included
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const barData = [];
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < totalDays; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const dateStr = current.toISOString().split('T')[0];
      barData.push({
        date: new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        cost: byDate[dateStr] || 0
      });
    }

    const avgPerDay = totalSpent / totalDays;
    const expensiveDays = barData.filter(d => d.cost > avgPerDay * 1.5);

    return { totalSpent, pieData, barData, avgPerDay, totalDays, expensiveDays };
  }, [trip]);

  if (!trip || !stats) return <div className="p-20 text-center">Loading financials...</div>;

  const isOverBudget = stats.totalSpent > trip.budgetLimit;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button 
            onClick={() => navigate(`/trips/${trip.id}`)}
            className="text-edward hover:text-emperor flex items-center gap-2 mb-4 font-bold text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Itinerary
          </button>
          <h2 className="text-4xl font-black text-emperor tracking-tight">Financial Breakdown</h2>
          <p className="text-edward font-medium">Detailed cost analysis for {trip.name}</p>
        </div>
        
        <div className={`px-8 py-4 rounded-3xl border ${isOverBudget ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'} flex items-center gap-4`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isOverBudget ? 'bg-red-500 text-white' : 'bg-green-500 text-white shadow-lg shadow-green-200'}`}>
            <ICONS.Wallet />
          </div>
          <div>
            <p className="text-[10px] font-black text-edward uppercase tracking-widest">Remaining</p>
            <h3 className={`text-2xl font-black ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              ${(trip.budgetLimit - stats.totalSpent).toLocaleString()}
            </h3>
          </div>
        </div>
      </header>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-48">
          <p className="text-[10px] font-black text-edward uppercase tracking-widest">Avg. Daily Burn</p>
          <div>
            <h4 className="text-4xl font-black text-emperor">${Math.round(stats.avgPerDay).toLocaleString()}</h4>
            <p className="text-xs text-edward font-bold mt-1">across {stats.totalDays} days</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-48">
          <p className="text-[10px] font-black text-edward uppercase tracking-widest">Total Estimated</p>
          <div>
            <h4 className="text-4xl font-black text-emperor">${stats.totalSpent.toLocaleString()}</h4>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
               <div className={`h-full transition-all duration-1000 ${isOverBudget ? 'bg-red-500' : 'bg-saffron'}`} style={{ width: `${Math.min(100, (stats.totalSpent / trip.budgetLimit) * 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-48">
          <p className="text-[10px] font-black text-edward uppercase tracking-widest">Peak Spending Day</p>
          <div>
            <h4 className="text-4xl font-black text-emperor">
              ${Math.max(...stats.barData.map(d => d.cost)).toLocaleString()}
            </h4>
            <p className="text-xs text-edward font-bold mt-1">Single day maximum</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Pie Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <h5 className="text-xl font-black text-emperor mb-10 flex items-center gap-2">
            <div className="w-2 h-6 bg-saffron rounded-full" />
            Spending by Category
          </h5>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#CBD5E1'} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <p className="text-3xl font-black text-emperor tracking-tighter">{stats.pieData.length}</p>
               <p className="text-[10px] text-edward font-bold uppercase tracking-widest">Categories</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
             {stats.pieData.map(item => (
               <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] }} />
                  <span className="text-xs font-bold text-emperor">{item.name}</span>
                  <span className="text-[10px] text-edward font-bold ml-auto">${item.value}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Daily Spending Bar Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <h5 className="text-xl font-black text-emperor mb-10 flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full" />
            Daily Spending Timeline
          </h5>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#ABACAC' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#ABACAC' }} 
                />
                <RechartsTooltip 
                  cursor={{ fill: '#F8FAFC', radius: 10 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="cost" fill={COLORS.SAFFRON} radius={[10, 10, 10, 10]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {stats.expensiveDays.length > 0 && (
            <div className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
               <div className="text-red-500 mt-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
               </div>
               <div>
                  <p className="text-sm font-black text-red-700 mb-1">High-Spend Alert</p>
                  <p className="text-xs text-red-600 font-medium">You have {stats.expensiveDays.length} days that significantly exceed your average burn rate. Consider balancing them with lower-cost activities.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetBreakdown;
