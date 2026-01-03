
import React, { useState, useEffect } from 'react';
import { User, Trip } from '../types';
import { MockDB } from '../services/db';
import { ICONS, COLORS } from '../constants';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', avatar: '' });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const currentUser = MockDB.getCurrentUser();
    const allTrips = MockDB.getTrips();
    if (currentUser) {
      setUser(currentUser);
      setFormData({ 
        name: currentUser.name, 
        email: currentUser.email, 
        avatar: currentUser.avatar || '' 
      });
    }
    setTrips(allTrips);
  }, []);

  const totalSpent = trips.reduce((acc, trip) => 
    acc + trip.stops.reduce((sAcc, stop) => 
      sAcc + stop.activities.reduce((aAcc, act) => aAcc + act.cost, 0), 0), 0);

  const totalActivities = trips.reduce((acc, trip) => 
    acc + trip.stops.reduce((sAcc, stop) => sAcc + stop.activities.length, 0), 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        if (!isEditing) setIsEditing(true); // Auto-enable edit mode if they change photo
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaveStatus('saving');
    const updatedUser: User = { 
      ...user, 
      name: formData.name, 
      email: formData.email, 
      avatar: formData.avatar 
    };
    
    // Artificial delay for UX
    setTimeout(() => {
      MockDB.setCurrentUser(updatedUser);
      setUser(updatedUser);
      setSaveStatus('saved');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  if (!user) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <header>
        <h2 className="text-4xl font-bold mb-2 text-emperor">Profile & Settings</h2>
        <p className="text-edward text-lg">Manage your account and view your travel impact.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Card & Stats */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-saffron" />
            
            {/* Editable Avatar */}
            <div className="relative w-32 h-32 mx-auto mb-6 group/avatar">
              <div className="w-full h-full bg-gray-50 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
                <img 
                  src={formData.avatar || `https://picsum.photos/seed/${user.id}/300/300`} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <span className="text-[10px] text-white font-black uppercase tracking-widest">Change</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              
              {/* Badge for unsaved changes */}
              {formData.avatar !== (user.avatar || '') && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-saffron rounded-full border-2 border-white animate-pulse" title="Unsaved changes" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-emperor">{user.name}</h3>
            <p className="text-edward mb-6">{user.email}</p>
            
            <button 
              onClick={() => {
                if (isEditing) {
                  // Revert if canceling
                  setFormData({ 
                    name: user.name, 
                    email: user.email, 
                    avatar: user.avatar || '' 
                  });
                }
                setIsEditing(!isEditing);
              }}
              className={`w-full py-3 border rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isEditing ? 'border-red-100 text-red-500 bg-red-50' : 'border-gray-100 text-emperor hover:bg-gray-50'
              }`}
            >
              {isEditing ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  Edit Profile
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'Total Trips', value: trips.length, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Activities Done', value: totalActivities, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <span className="text-edward font-semibold">{stat.label}</span>
                <span className={`text-xl font-bold ${stat.color} ${stat.bg} px-3 py-1 rounded-lg`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Settings Form & Preferences */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="text-2xl font-bold mb-8 flex items-center gap-3 text-emperor">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Account Details
            </h4>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-edward uppercase mb-2 tracking-widest">Display Name</label>
                  <input 
                    disabled={!isEditing}
                    type="text"
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 disabled:opacity-60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron/20 transition-all font-bold text-emperor"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-edward uppercase mb-2 tracking-widest">Email Address</label>
                  <input 
                    disabled={!isEditing}
                    type="email"
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 disabled:opacity-60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron/20 transition-all font-bold text-emperor"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={saveStatus === 'saving'}
                    className="bg-saffron text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-saffron/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {saveStatus === 'saving' ? 'Saving Changes...' : 'Save Profile'}
                  </button>
                </div>
              )}
              {saveStatus === 'saved' && (
                <p className="text-green-500 text-sm font-bold text-right flex items-center justify-end gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Profile updated successfully!
                </p>
              )}
            </form>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="text-2xl font-bold mb-8 flex items-center gap-3 text-emperor">
              <ICONS.Map />
              Travel Preferences
            </h4>
            
            <div className="space-y-6">
              <div className="p-5 bg-gray-50 rounded-2xl flex items-center justify-between border border-transparent hover:border-saffron/10 transition-colors">
                <div>
                  <p className="font-bold text-emperor">AI Trip Style</p>
                  <p className="text-sm text-edward">How Gemini suggests activities for you.</p>
                </div>
                <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-emperor focus:outline-none focus:ring-2 focus:ring-saffron/20">
                  <option>Adventurous</option>
                  <option>Relaxed</option>
                  <option>Moderate</option>
                  <option>Luxury</option>
                </select>
              </div>

              <div className="p-5 bg-gray-50 rounded-2xl flex items-center justify-between border border-transparent hover:border-saffron/10 transition-colors">
                <div>
                  <p className="font-bold text-emperor">Currency</p>
                  <p className="text-sm text-edward">Default currency for budget tracking.</p>
                </div>
                <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-emperor focus:outline-none focus:ring-2 focus:ring-saffron/20">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                  <option>INR (₹)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center gap-2 text-saffron text-sm font-bold bg-saffron/5 p-4 rounded-xl border border-saffron/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
                These preferences help our AI customize your future itineraries.
              </div>
            </div>
          </section>

          <div className="pt-6 flex justify-between items-center">
            <button className="text-edward font-bold hover:text-emperor text-sm transition-colors">
              Terms of Service
            </button>
            <button className="text-red-500 font-bold hover:underline flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
