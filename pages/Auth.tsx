
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MockDB } from '../services/db';
import { User } from '../types';

interface AuthProps {
  type: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ type }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Admin credentials check
    if (email === 'iyynes@gmail.com' && password === 'iyynes@123') {
      setShowRoleSelection(true);
      return;
    }

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || 'Traveler',
      email: email,
      role: 'user'
    };
    MockDB.setCurrentUser(mockUser);
    navigate('/');
  };

  const loginAs = (role: 'user' | 'admin') => {
    const mockUser: User = {
      id: 'admin-id-123',
      name: name || 'Iyynes Admin',
      email: email,
      role: role
    };
    MockDB.setCurrentUser(mockUser);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:block relative overflow-hidden">
        <img 
          src="https://picsum.photos/seed/travel/1200/1800" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Auth Background" 
        />
        <div className="absolute inset-0 bg-saffron/10 backdrop-blur-[2px]" />
        <div className="absolute bottom-20 left-20 right-20 text-white">
          <h1 className="text-6xl font-bold mb-6">Plan your perfect journey.</h1>
          <p className="text-xl font-medium opacity-90 max-w-md">Join thousands of travelers creating personalized, high-performance itineraries with GlobeTrotter.</p>
        </div>
      </div>

      <div className="bg-white flex items-center justify-center p-8 md:p-20 relative">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-saffron rounded-xl flex items-center justify-center text-white font-bold text-xl">G</div>
            <span className="text-2xl font-bold tracking-tight text-emperor">GlobeTrotter</span>
          </div>

          <h2 className="text-4xl font-bold mb-2">{type === 'login' ? 'Welcome Back' : 'Get Started'}</h2>
          <p className="text-edward mb-10">{type === 'login' ? 'Login to access your adventures.' : 'Create an account to start planning.'}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {type === 'signup' && (
              <div>
                <label className="block text-sm font-bold text-emperor mb-2">Full Name</label>
                <input 
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron/20 transition-all"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-emperor mb-2">Email Address</label>
              <input 
                required
                type="email"
                placeholder="you@example.com"
                className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron/20 transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emperor mb-2">Password</label>
              <input 
                required
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron/20 transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-saffron text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-saffron/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {type === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-edward">
            {type === 'login' ? (
              <p>Don't have an account? <Link to="/signup" className="text-saffron font-bold">Sign up free</Link></p>
            ) : (
              <p>Already have an account? <Link to="/login" className="text-saffron font-bold">Login</Link></p>
            )}
          </div>
        </div>

        {/* Admin Role Selection Overlay */}
        {showRoleSelection && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-12 animate-in fade-in zoom-in-95">
             <div className="w-16 h-16 bg-saffron/10 text-saffron rounded-2xl flex items-center justify-center mb-6">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
             </div>
             <h3 className="text-3xl font-black text-emperor text-center mb-2">Admin Detected</h3>
             <p className="text-edward font-medium text-center mb-10">How would you like to access GlobeTrotter today?</p>
             
             <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                <button 
                  onClick={() => loginAs('admin')}
                  className="w-full bg-emperor text-white py-6 rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
                  Login as Admin
                </button>
                <button 
                  onClick={() => loginAs('user')}
                  className="w-full bg-saffron text-white py-6 rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Login as User
                </button>
                <button 
                  onClick={() => setShowRoleSelection(false)}
                  className="mt-4 text-edward font-bold hover:text-emperor"
                >
                  Back to Form
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
