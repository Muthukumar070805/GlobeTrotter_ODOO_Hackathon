
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trip, TripStop, Activity, GeminiSuggestion } from '../types';
import { MockDB } from '../services/db';
import { GeminiService } from '../services/geminiService';
import { ICONS, COLORS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type ViewMode = 'list' | 'timeline';

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [isAddingStop, setIsAddingStop] = useState<string | null>(null);
  const [isAddingActivity, setIsAddingActivity] = useState<{stopId: string, date: string} | null>(null);
  
  // Form States
  const [newStopData, setNewStopData] = useState({ city: '', arrival: '', departure: '' });
  const [newActivityData, setNewActivityData] = useState({ 
    name: '', cost: 0, category: 'Sightseeing' as Activity['category'], startTime: '09:00', endTime: '10:00' 
  });
  
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [suggestions, setSuggestions] = useState<GeminiSuggestion[]>([]);

  useEffect(() => {
    if (id) {
      const data = MockDB.getTrip(id);
      if (data) {
        setTrip(data);
        setNewStopData(prev => ({ ...prev, arrival: data.startDate, departure: data.endDate }));
      }
    }
  }, [id]);

  const saveAndRefresh = (updatedTrip: Trip) => {
    setTrip(updatedTrip);
    MockDB.saveTrip(updatedTrip);
  };

  const daysInRange = useMemo(() => {
    if (!trip) return [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = [];
    let current = new Date(start);
    while (current <= end) {
      days.push(new Date(current).toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [trip]);

  const handleAddStop = () => {
    if (!trip || !newStopData.city) return;
    const newStop: TripStop = {
      id: Math.random().toString(36).substr(2, 9),
      tripId: trip.id,
      city: newStopData.city,
      order: trip.stops.length,
      arrivalDate: newStopData.arrival,
      departureDate: newStopData.departure,
      activities: []
    };
    const updatedTrip = { ...trip, stops: [...trip.stops, newStop] };
    saveAndRefresh(updatedTrip);
    setNewStopData({ city: '', arrival: trip.startDate, departure: trip.endDate });
    setIsAddingStop(null);
  };

  const handleDeleteStop = (stopId: string) => {
    if (!trip) return;
    if (!window.confirm('Remove this destination?')) return;
    const updatedStops = trip.stops.filter(s => s.id !== stopId).map((s, i) => ({ ...s, order: i }));
    saveAndRefresh({ ...trip, stops: updatedStops });
  };

  const handleManualAddActivity = (e: React.FormEvent, keepOpen: boolean = false) => {
    e.preventDefault();
    if (!trip || !isAddingActivity) return;
    
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      stopId: isAddingActivity.stopId,
      name: newActivityData.name,
      description: '',
      date: isAddingActivity.date,
      startTime: newActivityData.startTime,
      endTime: newActivityData.endTime,
      cost: newActivityData.cost,
      category: newActivityData.category
    };

    const updatedStops = trip.stops.map(stop => {
      if (stop.id === isAddingActivity.stopId) {
        return { 
          ...stop, 
          activities: [...stop.activities, newActivity].sort((a,b) => a.startTime.localeCompare(b.startTime)) 
        };
      }
      return stop;
    });
    
    saveAndRefresh({ ...trip, stops: updatedStops });
    
    // Reset but maybe keep some values if "Adding Another"
    setNewActivityData(prev => ({ 
      ...prev, 
      name: '', 
      cost: 0, 
      // Keep category and times for faster entry
      startTime: prev.endTime, 
      endTime: String(parseInt(prev.endTime.split(':')[0]) + 1).padStart(2, '0') + ':00'
    }));

    if (!keepOpen) {
      setIsAddingActivity(null);
    }
  };

  const handleDiscoverActivities = async (stop: TripStop) => {
    setActiveStopId(stop.id);
    setIsDiscovering(true);
    try {
      const results = await GeminiService.getActivitySuggestions(stop.city, 'moderate');
      setSuggestions(results);
    } catch (e) {
      console.error(e);
      setSuggestions([]);
    } finally {
      setIsDiscovering(false);
    }
  };

  const addAISuggestion = (stopId: string, suggestion: GeminiSuggestion) => {
    if (!trip) return;
    const stop = trip.stops.find(s => s.id === stopId);
    if (!stop) return;

    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      stopId: stopId,
      name: suggestion.name,
      description: suggestion.description,
      date: stop.arrivalDate,
      startTime: '10:00',
      endTime: '12:00',
      cost: suggestion.estimatedCost,
      category: suggestion.category
    };
    const updatedStops = trip.stops.map(s => {
      if (s.id === stopId) {
        return { ...s, activities: [...s.activities, newActivity] };
      }
      return s;
    });
    saveAndRefresh({ ...trip, stops: updatedStops });
  };

  const getBudgetData = () => {
    if (!trip) return [];
    const categories: Record<string, number> = {};
    trip.stops.forEach(stop => {
      stop.activities.forEach(activity => {
        categories[activity.category] = (categories[activity.category] || 0) + activity.cost;
      });
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const totalCost = trip?.stops.reduce((acc, stop) => 
    acc + stop.activities.reduce((aAcc, act) => aAcc + act.cost, 0), 0) || 0;

  if (!trip) return <div className="p-20 text-center text-edward font-bold">Trip not found.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-black text-emperor tracking-tight">{trip.name}</h2>
            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${viewMode === 'list' ? 'bg-white text-saffron shadow-sm border border-gray-100' : 'text-edward hover:text-emperor'}`}
              >
                Cities
              </button>
              <button 
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${viewMode === 'timeline' ? 'bg-white text-saffron shadow-sm border border-gray-100' : 'text-edward hover:text-emperor'}`}
              >
                Day-by-Day
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-edward font-black text-[10px] uppercase tracking-widest">
             <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><ICONS.Calendar /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</div>
             <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><ICONS.Wallet /> Budget: ${trip.budgetLimit.toLocaleString()}</div>
             <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><ICONS.Map /> {trip.stops.length} Cities</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setNewStopData({ city: '', arrival: trip.startDate, departure: trip.endDate });
              setIsAddingStop('new');
            }}
            className="bg-saffron text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-saffron/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3 uppercase text-xs tracking-widest"
          >
            <ICONS.Plus /> Add Stop
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {viewMode === 'list' ? (
            <div className="space-y-8">
              {trip.stops.sort((a,b) => a.order - b.order).map((stop, idx) => (
                <section key={stop.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-gray-50/50 p-8 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-emperor text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">{idx + 1}</div>
                      <div>
                        <h4 className="text-2xl font-black text-emperor">{stop.city}</h4>
                        <p className="text-[10px] text-edward font-black uppercase tracking-widest">{new Date(stop.arrivalDate).toLocaleDateString()} — {new Date(stop.departureDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleDiscoverActivities(stop)} className="p-3 bg-saffron/10 text-saffron rounded-2xl hover:bg-saffron hover:text-white transition-all shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></button>
                       <button onClick={() => handleDeleteStop(stop.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    {stop.activities.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-edward font-bold italic mb-4">No activities yet.</p>
                        <button onClick={() => handleDiscoverActivities(stop)} className="text-xs font-black text-saffron uppercase tracking-widest border-b-2 border-saffron/20 hover:border-saffron transition-all">Ask Gemini for suggestions &rarr;</button>
                      </div>
                    ) : (
                      stop.activities.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(act => (
                        <ActivityCard key={act.id} activity={act} onDelete={() => {
                          const updated = {...trip, stops: trip.stops.map(s => s.id === stop.id ? {...s, activities: s.activities.filter(a => a.id !== act.id)} : s)};
                          saveAndRefresh(updated);
                        }} />
                      ))
                    )}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="space-y-12 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-1 before:bg-gray-50">
              {daysInRange.map((dayStr, dIdx) => {
                const dayDate = new Date(dayStr);
                const activitiesOnDay = trip.stops.flatMap(s => s.activities.filter(a => a.date === dayStr));
                const activeStopOnDay = trip.stops.find(s => dayStr >= s.arrivalDate && dayStr <= s.departureDate);

                return (
                  <div key={dayStr} className="relative pl-24 animate-in slide-in-from-left-4" style={{ animationDelay: `${dIdx * 40}ms` }}>
                    <div className="absolute left-0 top-0 w-16 h-16 bg-white border-4 border-gray-50 rounded-[1.25rem] flex flex-col items-center justify-center shadow-md z-10 hover:scale-110 transition-transform">
                      <span className="text-[10px] font-black text-saffron uppercase tracking-tighter leading-none">Day</span>
                      <span className="text-3xl font-black text-emperor">{dIdx + 1}</span>
                    </div>
                    
                    <div className="mb-6 flex items-center justify-between">
                       <div>
                         <h5 className="text-2xl font-black text-emperor">{dayDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h5>
                         {activeStopOnDay ? (
                           <div className="flex items-center gap-2 mt-1">
                              <div className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
                              <p className="text-xs font-black text-saffron uppercase tracking-widest">{activeStopOnDay.city}</p>
                           </div>
                         ) : (
                           <p className="text-[10px] font-black text-edward uppercase tracking-widest mt-1">Free Day / Travel Day</p>
                         )}
                       </div>
                       
                       {activeStopOnDay && (
                         <button 
                           onClick={() => setIsAddingActivity({ stopId: activeStopOnDay.id, date: dayStr })}
                           className="p-3 bg-saffron/10 text-saffron hover:bg-saffron hover:text-white rounded-2xl transition-all shadow-sm"
                           title="Add Plan"
                         >
                           <ICONS.Plus />
                         </button>
                       )}
                    </div>

                    <div className="space-y-4">
                      {activitiesOnDay.length > 0 ? (
                        <>
                          {activitiesOnDay.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(act => (
                            <ActivityCard key={act.id} activity={act} onDelete={() => {
                              const updated = {...trip, stops: trip.stops.map(s => s.id === act.stopId ? {...s, activities: s.activities.filter(a => a.id !== act.id)} : s)};
                              saveAndRefresh(updated);
                            }} />
                          ))}
                          {activeStopOnDay && (
                             <button 
                               onClick={() => setIsAddingActivity({ stopId: activeStopOnDay.id, date: dayStr })}
                               className="w-full py-4 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-3xl text-[10px] font-black text-edward uppercase tracking-widest hover:border-saffron/30 hover:text-saffron hover:bg-saffron/5 transition-all group"
                             >
                               + Add Another Plan for {dayDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                             </button>
                          )}
                        </>
                      ) : activeStopOnDay ? (
                        <button 
                          onClick={() => setIsAddingActivity({ stopId: activeStopOnDay.id, date: dayStr })}
                          className="w-full bg-white border-2 border-dashed border-gray-100 p-10 rounded-[2.5rem] text-center group hover:border-saffron hover:bg-saffron/5 transition-all shadow-sm"
                        >
                           <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-saffron/20 transition-colors">
                              <ICONS.Plus />
                           </div>
                           <p className="text-xs font-black text-edward uppercase tracking-widest group-hover:text-saffron">Click to Add First Activity</p>
                        </button>
                      ) : (
                        <div className="w-full bg-gray-50/30 border border-dashed border-gray-100 p-10 rounded-[2.5rem] text-center">
                           <p className="text-[10px] font-black text-edward uppercase tracking-widest italic opacity-50">Assign a City to this Day to Start Planning</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-10">
            <h4 className="text-2xl font-black mb-8 flex items-center gap-3 text-emperor"><ICONS.Wallet /> Progress</h4>
            <div className="h-56 mb-8 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getBudgetData().length > 0 ? getBudgetData() : [{ name: 'Empty', value: 1 }]}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {getBudgetData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[COLORS.SAFFRON, '#3B82F6', '#10B981', '#F43F5E', '#8B5CF6'][index % 5]} />
                    ))}
                    {getBudgetData().length === 0 && <Cell fill="#F1F5F9" />}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', fontWeight: 'bold'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-3xl font-black text-emperor tracking-tighter">${totalCost.toLocaleString()}</p>
                 <p className="text-[10px] text-edward font-black uppercase tracking-widest">Est. Spend</p>
              </div>
            </div>
            <div className="space-y-3 mb-8">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                 <span className="text-edward">Budget Utilization</span>
                 <span className="text-emperor">{Math.round((totalCost / trip.budgetLimit) * 100)}%</span>
               </div>
               <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-1000 ${totalCost > trip.budgetLimit ? 'bg-red-500' : 'bg-saffron'}`} style={{ width: `${Math.min(100, (totalCost / trip.budgetLimit) * 100)}%` }} />
               </div>
            </div>
            <button 
              onClick={() => navigate(`/trips/${trip.id}/budget`)}
              className="w-full py-4 bg-emperor text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl"
            >
              Analyze Financials
            </button>
          </div>

          {activeStopId && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl border-t-8 border-t-saffron animate-in slide-in-from-right-10">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-2xl font-black text-emperor">AI Picks</h4>
                <button onClick={() => setActiveStopId(null)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">✕</button>
              </div>
              {isDiscovering ? (
                <div className="text-center py-16">
                   <div className="w-10 h-10 border-4 border-saffron/10 border-t-saffron rounded-full animate-spin mx-auto mb-4" />
                   <p className="text-[10px] font-black text-saffron uppercase tracking-widest">Generating Ideas...</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {suggestions.map((s, i) => (
                    <div key={i} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:border-saffron/30 transition-all group shadow-sm">
                       <div className="flex justify-between items-start mb-3">
                         <h6 className="font-black text-emperor text-sm leading-tight">{s.name}</h6>
                         <span className="text-xs font-black text-saffron bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">${s.estimatedCost}</span>
                       </div>
                       <p className="text-xs text-edward font-medium leading-relaxed mb-4">{s.description}</p>
                       <button onClick={() => addAISuggestion(activeStopId, s)} className="w-full py-3 bg-white text-emperor text-[10px] font-black uppercase rounded-xl border border-gray-200 hover:bg-saffron hover:text-white hover:border-saffron transition-all shadow-sm">Add to Plan</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Stop Modal */}
      {isAddingStop && (
        <Modal onClose={() => setIsAddingStop(null)} title="Global Destination">
           <div className="space-y-6">
             <div>
               <label className="block text-[10px] font-black text-edward uppercase mb-2 tracking-widest">City Name</label>
               <input autoFocus type="text" className="w-full px-6 py-4 rounded-2xl bg-gray-50 focus:bg-white border-none focus:ring-4 focus:ring-saffron/5 outline-none font-bold text-emperor transition-all" placeholder="e.g. Kyoto, London..." value={newStopData.city} onChange={e => setNewStopData({...newStopData, city: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-[10px] font-black text-edward uppercase mb-2 tracking-widest">Arrival</label>
                 <input type="date" className="w-full px-6 py-4 rounded-2xl bg-gray-50 focus:bg-white border-none focus:ring-4 focus:ring-saffron/5 outline-none font-bold text-emperor" value={newStopData.arrival} onChange={e => setNewStopData({...newStopData, arrival: e.target.value})} />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-edward uppercase mb-2 tracking-widest">Departure</label>
                 <input type="date" className="w-full px-6 py-4 rounded-2xl bg-gray-50 focus:bg-white border-none focus:ring-4 focus:ring-saffron/5 outline-none font-bold text-emperor" value={newStopData.departure} onChange={e => setNewStopData({...newStopData, departure: e.target.value})} />
               </div>
             </div>
             <button onClick={handleAddStop} className="w-full bg-saffron text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-saffron/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Add Destination</button>
           </div>
        </Modal>
      )}

      {/* Add Activity Modal - UPGRADED TO HANDLE MULTIPLE ADDS */}
      {isAddingActivity && (
        <Modal onClose={() => setIsAddingActivity(null)} title={`Schedule: ${new Date(isAddingActivity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}>
          <form onSubmit={(e) => handleManualAddActivity(e, false)} className="space-y-6">
            <div>
               <label className="block text-[10px] font-black text-edward uppercase mb-2 tracking-widest">Activity Title</label>
               <input required autoFocus type="text" className="w-full px-6 py-4 rounded-2xl bg-gray-50 focus:bg-white border-none outline-none font-bold text-emperor focus:ring-4 focus:ring-saffron/5 transition-all" placeholder="e.g. Afternoon Museum Tour" value={newActivityData.name} onChange={e => setNewActivityData({...newActivityData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-edward uppercase mb-2 tracking-widest">Est. Cost ($)</label>
                  <input required type="number" className="w-full px-6 py-4 rounded-2xl bg-gray-50 focus:bg-white border-none outline-none font-bold text-emperor" value={newActivityData.cost} onChange={e => setNewActivityData({...newActivityData, cost: parseInt(e.target.value)})} />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-edward uppercase mb-2 tracking-widest">Type</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 focus:bg-white border-none outline-none font-bold text-emperor appearance-none cursor-pointer" value={newActivityData.category} onChange={e => setNewActivityData({...newActivityData, category: e.target.value as any})}>
                    {['Sightseeing', 'Food', 'Transport', 'Accommodation', 'Other'].map(cat => <option key={cat}>{cat}</option>)}
                  </select>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-edward uppercase mb-2 tracking-widest">Starts</label>
                  <input type="time" className="w-full px-6 py-4 rounded-2xl bg-gray-50 focus:bg-white border-none outline-none font-bold text-emperor" value={newActivityData.startTime} onChange={e => setNewActivityData({...newActivityData, startTime: e.target.value})} />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-edward uppercase mb-2 tracking-widest">Ends</label>
                  <input type="time" className="w-full px-6 py-4 rounded-2xl bg-gray-50 focus:bg-white border-none outline-none font-bold text-emperor" value={newActivityData.endTime} onChange={e => setNewActivityData({...newActivityData, endTime: e.target.value})} />
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button 
                type="button"
                onClick={(e) => handleManualAddActivity(e as any, true)}
                className="w-full bg-white text-saffron border-2 border-saffron py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:bg-saffron/5 transition-all"
              >
                Save & Add Another
              </button>
              <button 
                type="submit" 
                className="w-full bg-saffron text-white py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-saffron/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Done
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

const ActivityCard: React.FC<{ activity: Activity, onDelete: () => void }> = ({ activity, onDelete }) => (
  <div className="flex items-center gap-6 p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md hover:border-saffron/20 transition-all group">
     <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-50 group-hover:bg-saffron/10 transition-colors">
       {activity.category === 'Food' ? '🍴' : activity.category === 'Sightseeing' ? '🏛️' : activity.category === 'Transport' ? '🚆' : activity.category === 'Accommodation' ? '🏨' : '🎒'}
     </div>
     <div className="flex-1 min-w-0">
       <div className="flex items-center gap-3 mb-1">
         <h6 className="font-black text-emperor text-base truncate leading-tight">{activity.name}</h6>
         <span className="text-[10px] font-black text-saffron uppercase tracking-widest bg-saffron/5 px-2 py-0.5 rounded-lg border border-saffron/10">{activity.category}</span>
       </div>
       <div className="flex items-center gap-2 text-[10px] font-black text-edward uppercase tracking-widest">
         <ICONS.Calendar /> {activity.startTime} — {activity.endTime}
       </div>
     </div>
     <div className="text-right">
       <p className="text-lg font-black text-emperor">${activity.cost}</p>
       <button onClick={onDelete} className="text-[10px] font-black text-red-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all mt-1">Delete</button>
     </div>
  </div>
);

const Modal: React.FC<{ children: React.ReactNode, onClose: () => void, title: string }> = ({ children, onClose, title }) => (
  <div className="fixed inset-0 bg-emperor/60 backdrop-blur-lg flex items-center justify-center z-[100] p-4">
     <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-3xl font-black text-emperor leading-tight">{title}</h3>
           <button onClick={onClose} className="p-3 hover:bg-gray-50 rounded-full text-edward transition-colors">✕</button>
        </div>
        {children}
     </div>
  </div>
);

export default TripDetails;
