
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trip, Activity, TripStop } from '../types';
import { MockDB } from '../services/db';
import { ICONS, COLORS } from '../constants';

const TripCalendar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(id || null);
  const [activeDay, setActiveDay] = useState<string | null>(null);

  useEffect(() => {
    const allTrips = MockDB.getTrips();
    setTrips(allTrips);
    if (!id && allTrips.length > 0) {
      setSelectedTripId(allTrips[0].id);
    }
  }, [id]);

  const currentTrip = useMemo(() => {
    return trips.find(t => t.id === selectedTripId) || null;
  }, [trips, selectedTripId]);

  const calendarDays = useMemo(() => {
    if (!currentTrip) return [];
    const start = new Date(currentTrip.startDate);
    const end = new Date(currentTrip.endDate);
    
    // Adjust start to beginning of the week for a grid
    const firstDay = new Date(start);
    firstDay.setDate(1); // Start of month
    const lastDay = new Date(end);
    lastDay.setMonth(lastDay.getMonth() + 1);
    lastDay.setDate(0); // End of month

    const days = [];
    let current = new Date(firstDay);
    // Fill leading empty days
    const startPadding = current.getDay();
    for (let i = 0; i < startPadding; i++) {
        days.push(null);
    }

    while (current <= lastDay) {
      days.push(new Date(current).toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [currentTrip]);

  const getActivitiesForDay = (dayStr: string) => {
    if (!currentTrip) return [];
    return currentTrip.stops.flatMap(s => s.activities.filter(a => a.date === dayStr));
  };

  const getStopForDay = (dayStr: string) => {
    if (!currentTrip) return null;
    return currentTrip.stops.find(s => dayStr >= s.arrivalDate && dayStr <= s.departureDate);
  };

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-edward text-4xl">🗓️</div>
        <h2 className="text-3xl font-black text-emperor">No Itineraries Yet</h2>
        <p className="text-edward max-w-sm font-medium">Create a trip first to visualize your journey on the timeline.</p>
        <button onClick={() => navigate('/create-trip')} className="bg-saffron text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Start Planning</button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-emperor tracking-tight mb-2">Itinerary Timeline</h2>
          <p className="text-edward text-lg font-medium">Visual calendar flow for your global adventures.</p>
        </div>
        
        <div className="flex bg-gray-50 p-2 rounded-2xl">
           <select 
             value={selectedTripId || ''} 
             onChange={(e) => setSelectedTripId(e.target.value)}
             className="bg-transparent border-none outline-none font-black text-emperor px-4 py-2 cursor-pointer"
           >
             {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
           </select>
        </div>
      </header>

      {currentTrip && (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
          {/* Main Calendar Grid */}
          <div className="lg:col-span-5 bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black text-emperor">{new Date(currentTrip.startDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
               <div className="flex gap-2">
                 <button className="p-2 hover:bg-gray-50 rounded-xl text-edward"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
                 <button className="p-2 hover:bg-gray-50 rounded-xl text-edward"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
               </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-edward uppercase tracking-widest py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="aspect-square bg-gray-50/30 rounded-2xl" />;
                
                const activities = getActivitiesForDay(day);
                const stop = getStopForDay(day);
                const isWithinTrip = day >= currentTrip.startDate && day <= currentTrip.endDate;
                const isActive = activeDay === day;

                return (
                  <button 
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`aspect-square p-2 rounded-2xl border-2 transition-all flex flex-col relative group ${
                      !isWithinTrip ? 'opacity-30 border-transparent bg-gray-50' : 
                      isActive ? 'border-saffron bg-saffron/5 shadow-inner' : 
                      'border-gray-50 hover:border-saffron/30 hover:bg-gray-50/50'
                    }`}
                  >
                    <span className={`text-xs font-black ${isActive ? 'text-saffron' : 'text-emperor'}`}>
                      {new Date(day).getDate()}
                    </span>
                    
                    {isWithinTrip && stop && (
                      <span className="text-[8px] font-bold text-saffron uppercase truncate mt-auto">{stop.city}</span>
                    )}

                    <div className="flex gap-1 mt-1 flex-wrap">
                       {activities.slice(0, 3).map((a, i) => (
                         <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                       ))}
                       {activities.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Detail Side Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl min-h-[400px]">
              {activeDay ? (
                <div className="animate-in slide-in-from-right-4 duration-300">
                   <header className="mb-8">
                      <p className="text-[10px] font-black text-saffron uppercase tracking-widest mb-1">Schedule for</p>
                      <h4 className="text-2xl font-black text-emperor leading-none">
                        {new Date(activeDay).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </h4>
                   </header>

                   <div className="space-y-6">
                      {getActivitiesForDay(activeDay).length > 0 ? (
                        getActivitiesForDay(activeDay).sort((a,b) => a.startTime.localeCompare(b.startTime)).map(act => (
                          <div key={act.id} className="flex gap-4 group">
                             <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-saffron" />
                                <div className="flex-1 w-0.5 bg-gray-100 my-1" />
                             </div>
                             <div className="flex-1 pb-6">
                                <p className="text-[10px] font-black text-edward uppercase tracking-tighter mb-1">{act.startTime}</p>
                                <h6 className="font-bold text-emperor text-sm mb-1">{act.name}</h6>
                                <div className="flex items-center justify-between">
                                   <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{act.category}</span>
                                   <span className="text-xs font-black text-emperor">${act.cost}</span>
                                </div>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-20 text-center space-y-4">
                           <div className="text-4xl">🏝️</div>
                           <p className="text-sm font-bold text-edward">No activities planned.</p>
                           {getStopForDay(activeDay) && (
                             <button 
                               onClick={() => navigate(`/trips/${selectedTripId}`)}
                               className="text-xs font-black text-saffron uppercase hover:underline"
                             >
                               Edit Plans &rarr;
                             </button>
                           )}
                        </div>
                      )}
                   </div>
                   
                   <button 
                    onClick={() => navigate(`/trips/${selectedTripId}`)}
                    className="w-full mt-6 py-4 bg-emperor text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                   >
                     Go to Trip Editor
                   </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-edward">🖱️</div>
                   <p className="text-sm font-bold text-edward">Select a day on the calendar to see details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripCalendar;
