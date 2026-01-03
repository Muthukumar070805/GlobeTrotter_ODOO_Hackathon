
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MockDB } from '../services/db';
import { Trip } from '../types';
import { ICONS } from '../constants';

const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    budgetLimit: 1000,
    isPublic: false
  });
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      userId: MockDB.getCurrentUser()?.id || 'guest',
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budgetLimit: formData.budgetLimit,
      isPublic: formData.isPublic,
      stops: [],
      coverImage: coverImage
    };
    MockDB.saveTrip(newTrip);
    navigate(`/trips/${newTrip.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 animate-in slide-in-from-bottom-10 duration-500 px-4 md:px-0">
      <button 
        onClick={() => navigate(-1)}
        className="text-edward hover:text-emperor flex items-center gap-2 mb-8 transition-colors font-semibold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back
      </button>

      <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-saffron/10 text-saffron rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ICONS.Map />
          </div>
          <h2 className="text-3xl font-bold mb-2">Plan a New Adventure</h2>
          <p className="text-edward">Fill in the basics to get your journey started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Optional Cover Photo Upload */}
          <div>
            <label className="block text-sm font-bold text-emperor mb-2">Cover Photo (Optional)</label>
            <div className={`relative h-48 w-full border-2 border-dashed rounded-2xl transition-all flex items-center justify-center overflow-hidden ${coverImage ? 'border-saffron' : 'border-gray-200 hover:border-saffron/50'}`}>
              {coverImage ? (
                <>
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setCoverImage(undefined)}
                    className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                  <div className="text-saffron">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                  <span className="text-sm font-semibold text-edward">Click to upload or drag cover image</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-emperor mb-2">Trip Name</label>
            <input 
              required
              type="text"
              placeholder="e.g. Summer European Escape"
              className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-emperor mb-2">Start Date</label>
              <input 
                required
                type="date"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emperor mb-2">End Date</label>
              <input 
                required
                type="date"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-emperor mb-2">Budget Limit ($)</label>
            <input 
              required
              type="number"
              className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all"
              value={formData.budgetLimit}
              onChange={e => setFormData({...formData, budgetLimit: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex items-center gap-3 py-4">
            <input 
              type="checkbox" 
              id="isPublic"
              className="w-5 h-5 accent-saffron"
              checked={formData.isPublic}
              onChange={e => setFormData({...formData, isPublic: e.target.checked})}
            />
            <label htmlFor="isPublic" className="text-emperor font-medium cursor-pointer">Make this itinerary public</label>
          </div>

          <button 
            type="submit"
            className="w-full bg-saffron text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-saffron/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Create Itinerary
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
