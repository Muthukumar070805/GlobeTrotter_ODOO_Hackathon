
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeminiService } from '../services/geminiService';
import { CityInfo, Trip } from '../types';
import { MockDB } from '../services/db';
import { ICONS, COLORS } from '../constants';

const CitySearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All');
  const [results, setResults] = useState<CityInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityInfo | null>(null);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);

  const regions = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania'];

  useEffect(() => {
    setUserTrips(MockDB.getTrips());
    handleSearch('Trending Cities', 'All');
  }, []);

  const handleSearch = async (sQuery: string, sRegion: string) => {
    setIsLoading(true);
    const cities = await GeminiService.searchCities(sQuery || "Popular cities", sRegion);
    setResults(cities);
    setIsLoading(false);
  };

  const handleAddStop = (tripId: string) => {
    if (!selectedCity) return;
    const trip = MockDB.getTrip(tripId);
    if (!trip) return;

    const newStop = {
      id: Math.random().toString(36).substr(2, 9),
      tripId: trip.id,
      city: selectedCity.name,
      order: trip.stops.length,
      arrivalDate: trip.startDate,
      departureDate: trip.endDate,
      activities: []
    };

    const updatedTrip = { ...trip, stops: [...trip.stops, newStop] };
    MockDB.saveTrip(updatedTrip);
    navigate(`/trips/${trip.id}`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header>
        <h2 className="text-4xl font-black text-emperor tracking-tight mb-2">Explore Destinations</h2>
        <p className="text-edward text-lg font-medium">Discover your next stop with AI-powered insights.</p>
      </header>

      {/* Search Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-edward group-focus-within:text-saffron transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            type="text"
            placeholder="Search for a city or vibe (e.g. 'Cozy European towns')..."
            className="w-full pl-16 pr-8 py-5 rounded-[2rem] border border-gray-100 bg-white focus:outline-none focus:ring-4 focus:ring-saffron/5 focus:border-saffron transition-all text-emperor font-bold"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query, region)}
          />
        </div>
        <div className="flex bg-gray-50 p-2 rounded-[2rem] gap-1 overflow-x-auto no-scrollbar">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => { setRegion(r); handleSearch(query, r); }}
              className={`px-6 py-3 rounded-[1.5rem] text-sm font-bold whitespace-nowrap transition-all ${region === r ? 'bg-white text-saffron shadow-sm' : 'text-edward hover:text-emperor'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="min-h-[400px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-saffron/10 border-t-saffron rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-saffron/5 rounded-full flex items-center justify-center text-saffron">
                  <ICONS.Plane />
                </div>
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-black text-emperor mb-1">Discovering Destinations...</h4>
              <p className="text-edward font-bold text-xs uppercase tracking-widest">Gemini is curating world-class cities for you</p>
            </div>
            
            {/* Background Skeleton Grid for context */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-20 pointer-events-none mt-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[2.5rem] border border-gray-50 h-80" />
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((city, idx) => (
              <div key={idx} className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col">
                <div className="h-48 bg-gray-100 relative">
                  <img src={`https://picsum.photos/seed/${city.name}/600/400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={city.name} />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-saffron uppercase tracking-widest shadow-sm">
                    {city.region}
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-2xl font-black text-emperor truncate">{city.name}</h4>
                    <span className="text-saffron font-black text-sm">{"$".repeat(city.costIndex)}</span>
                  </div>
                  <p className="text-edward font-bold text-xs uppercase tracking-widest mb-4">{city.country}</p>
                  <p className="text-sm text-edward leading-relaxed mb-6 line-clamp-2">{city.description}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-black text-edward uppercase">Pop. Score</span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-saffron" style={{ width: `${city.popularity}%` }} />
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedCity(city)}
                      className="bg-saffron text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      Add to Trip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-edward text-3xl mb-4">🌍</div>
             <h4 className="text-2xl font-black text-emperor">No destinations found</h4>
             <p className="text-edward font-medium max-w-md">Try searching for a different city, country, or even a travel vibe like "adventure" or "beach".</p>
          </div>
        )}
      </div>

      {/* Add to Trip Modal */}
      {selectedCity && (
        <div className="fixed inset-0 bg-emperor/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-black text-emperor mb-2">Add {selectedCity.name}</h3>
              <p className="text-edward font-medium">Select a trip to include this destination.</p>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2 mb-8">
              {userTrips.length > 0 ? userTrips.map(trip => (
                <button
                  key={trip.id}
                  onClick={() => handleAddStop(trip.id)}
                  className="w-full p-5 bg-gray-50 hover:bg-saffron/5 border border-gray-100 rounded-2xl flex items-center justify-between transition-all group"
                >
                  <div className="text-left">
                    <p className="font-black text-emperor group-hover:text-saffron">{trip.name}</p>
                    <p className="text-xs text-edward font-bold">{trip.stops.length} Cities planned</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-edward group-hover:text-saffron"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              )) : (
                <p className="text-center py-4 text-edward font-bold">No active trips found.</p>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedCity(null)}
                className="flex-1 py-4 border border-gray-100 rounded-2xl font-black text-edward text-sm uppercase"
              >
                Cancel
              </button>
              <button 
                onClick={() => navigate('/create-trip')}
                className="flex-1 py-4 bg-saffron text-white rounded-2xl font-black text-sm uppercase shadow-lg shadow-saffron/20"
              >
                Create New Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySearch;
