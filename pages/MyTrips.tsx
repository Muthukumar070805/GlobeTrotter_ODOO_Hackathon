
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../types';
import { MockDB } from '../services/db';
import { ICONS, COLORS } from '../constants';

const MyTrips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = () => {
    setTrips(MockDB.getTrips().sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
  };

  const handleDeleteTrip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Erase this adventure forever?')) {
      MockDB.deleteTrip(id);
      loadTrips();
    }
  };

  const filteredTrips = trips.filter(trip => 
    trip.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-emperor tracking-tight mb-2">My Adventures</h2>
          <p className="text-edward text-lg font-medium">Managing {trips.length} planned journeys.</p>
        </div>
        <button 
          onClick={() => navigate('/create-trip')}
          className="bg-saffron text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-saffron/20 hover:scale-[1.05] transition-all flex items-center gap-3"
        >
          <ICONS.Plus />
          Plan New Trip
        </button>
      </header>

      {/* Modern Search */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-edward group-focus-within:text-saffron transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input 
          type="text"
          placeholder="Filter your travels..."
          className="w-full pl-16 pr-8 py-5 rounded-[2rem] border border-gray-100 bg-white focus:outline-none focus:ring-4 focus:ring-saffron/5 focus:border-saffron transition-all text-emperor font-bold placeholder:text-edward/60 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTrips.map((trip) => {
            const totalCost = trip.stops.reduce((acc, stop) => 
              acc + stop.activities.reduce((aAcc, act) => aAcc + act.cost, 0), 0);
            const cityCount = trip.stops.length;
            const activityCount = trip.stops.reduce((acc, s) => acc + s.activities.length, 0);
            
            return (
              <div 
                key={trip.id} 
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="group cursor-pointer bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col"
              >
                <div className="h-56 bg-gray-100 relative overflow-hidden">
                   <img 
                    src={trip.coverImage || `https://picsum.photos/seed/${trip.id}/800/600`} 
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                   />
                   <div className="absolute top-6 left-6 flex gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm ${trip.isPublic ? 'bg-green-500/90 text-white' : 'bg-emperor/90 text-white'}`}>
                        {trip.isPublic ? 'Shared' : 'Private'}
                      </span>
                   </div>
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-emperor px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Open Editor</span>
                   </div>
                   <button 
                    onClick={(e) => handleDeleteTrip(e, trip.id)}
                    className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-red-500 text-white rounded-2xl backdrop-blur-md transition-all scale-0 group-hover:scale-100"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                   </button>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h4 className="text-2xl font-black text-emperor truncate mb-1">{trip.name}</h4>
                    <p className="text-edward text-sm font-bold">{new Date(trip.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                        <div className="text-saffron"><ICONS.Map /></div>
                        <div>
                           <p className="text-[10px] font-black text-edward uppercase tracking-tighter">Cities</p>
                           <p className="text-sm font-black text-emperor">{cityCount}</p>
                        </div>
                     </div>
                     <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                        <div className="text-saffron"><ICONS.Calendar /></div>
                        <div>
                           <p className="text-[10px] font-black text-edward uppercase tracking-tighter">Plans</p>
                           <p className="text-sm font-black text-emperor">{activityCount}</p>
                        </div>
                     </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] text-edward font-black uppercase tracking-widest mb-1">Total Cost</p>
                       <p className="text-2xl font-black text-emperor tracking-tight">${totalCost.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-saffron text-white rounded-2xl flex items-center justify-center shadow-lg shadow-saffron/20 group-hover:rotate-12 transition-transform">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100">
          <div className="w-24 h-24 bg-saffron/5 text-saffron rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12">
            <ICONS.Plane />
          </div>
          <h3 className="text-3xl font-black text-emperor mb-4">No matching adventures</h3>
          <p className="text-edward font-medium mb-10 max-w-sm mx-auto text-lg leading-relaxed">It seems your passport is currently empty. Time to ink a new journey!</p>
          <button 
            onClick={() => navigate('/create-trip')}
            className="bg-saffron text-white px-12 py-5 rounded-2xl font-black shadow-2xl shadow-saffron/20 hover:scale-[1.05] transition-all"
          >
            Plan Your First Trip
          </button>
        </div>
      )}
    </div>
  );
};

export default MyTrips;
