
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trip, Activity } from '../types';
import { MockDB } from '../services/db';
import { ICONS, COLORS } from '../constants';

const Dashboard: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setTrips(MockDB.getTrips().sort((a,b) => new Date(a.startDate).getTime() - new Date().getTime()));
  }, []);

  const nextTrip = useMemo(() => {
    const now = new Date().getTime();
    return trips.find(t => new Date(t.startDate).getTime() > now) || trips[0];
  }, [trips]);

  const upcomingActivities = useMemo(() => {
    if (!nextTrip) return [];
    return nextTrip.stops
      .flatMap(s => s.activities)
      .sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 3);
  }, [nextTrip]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-emperor tracking-tight mb-2">Hello, {MockDB.getCurrentUser()?.name.split(' ')[0] || 'Traveler'}!</h2>
          <p className="text-edward text-lg font-medium">Your world tour is just a plan away.</p>
        </div>
        <button 
          onClick={() => navigate('/create-trip')}
          className="bg-saffron text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-saffron/20 hover:scale-[1.05] transition-transform flex items-center gap-3"
        >
          <ICONS.Plus />
          New Journey
        </button>
      </header>

      {/* Stats Board */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Upcoming', value: trips.length, icon: ICONS.Plane, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Stops', value: trips.reduce((acc, t) => acc + t.stops.length, 0), icon: ICONS.Map, color: 'text-saffron', bg: 'bg-saffron/10' },
          { label: 'Budget Cap', value: `$${trips.reduce((acc, t) => acc + t.budgetLimit, 0).toLocaleString()}`, icon: ICONS.Wallet, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Plans', value: trips.reduce((acc, t) => acc + t.stops.reduce((sAcc, s) => sAcc + s.activities.length, 0), 0), icon: ICONS.Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col gap-4 hover:shadow-lg transition-all group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon />
            </div>
            <div>
              <p className="text-[10px] font-black text-edward uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-emperor">{stat.value}</h3>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Next Adventure Detail */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-emperor">Next Adventure</h3>
            {nextTrip && (
               <Link to={`/trips/${nextTrip.id}`} className="text-sm font-black text-saffron uppercase hover:underline">Edit Itinerary</Link>
            )}
          </div>

          {nextTrip ? (
            <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col md:flex-row">
               <div className="md:w-1/3 h-64 md:h-auto bg-gray-100">
                  <img src={nextTrip.coverImage || `https://picsum.photos/seed/${nextTrip.id}/800/800`} className="w-full h-full object-cover" alt={nextTrip.name} />
               </div>
               <div className="p-8 md:flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-emperor mb-2">{nextTrip.name}</h4>
                    <p className="text-edward font-bold text-sm flex items-center gap-2 mb-6">
                       <ICONS.Calendar /> {new Date(nextTrip.startDate).toLocaleDateString()}
                    </p>
                    
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-edward uppercase tracking-widest">Day 1 Activities</p>
                       {upcomingActivities.length > 0 ? upcomingActivities.map(act => (
                         <div key={act.id} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-saffron" />
                            <span className="text-sm font-bold text-emperor">{act.startTime}</span>
                            <span className="text-sm text-edward truncate">{act.name}</span>
                         </div>
                       )) : <p className="text-sm text-edward italic">No activities planned yet.</p>}
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-between border-t border-gray-50 pt-6">
                     <span className="text-saffron font-black text-xl">${nextTrip.stops.reduce((acc, s) => acc + s.activities.reduce((a, b) => a + b.cost, 0), 0)}</span>
                     <div className="flex -space-x-3">
                        {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src={`https://picsum.photos/seed/p${i}/100/100`} alt="p" /></div>)}
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-20 text-center">
               <p className="text-edward font-bold">No trips on the horizon.</p>
               <button onClick={() => navigate('/create-trip')} className="text-saffron font-black mt-2 hover:underline">Start Planning &rarr;</button>
            </div>
          )}
        </div>

        {/* Explore More */}
        <div className="space-y-6">
           <h3 className="text-2xl font-black text-emperor">Global Feed</h3>
           <div className="space-y-4">
             {['Tokyo', 'Reykjavik', 'Cairo'].map(city => (
               <div key={city} className="group relative h-40 rounded-3xl overflow-hidden cursor-pointer">
                 <img src={`https://picsum.photos/seed/${city}/600/400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={city} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-5">
                   <h5 className="text-white font-black text-lg">{city}</h5>
                   <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Trending Now</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
