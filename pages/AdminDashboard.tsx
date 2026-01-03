
import React, { useState, useEffect } from 'react';
import { MockDB } from '../services/db';
import { User, Trip } from '../types';
import { ICONS, COLORS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setStats(MockDB.getGlobalStats());
    setUsers(MockDB.getAllUsers());
    setTrips(MockDB.getTrips());
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role'];
    const rows = users.map(u => [u.id, u.name, u.email, u.role || 'user']);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "globetrotter_users_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      MockDB.updateUser(editingUser);
      setEditingUser(null);
      refreshData();
    }
  };

  if (!stats) return <div className="p-20 text-center font-bold text-edward">Loading Analytics...</div>;

  // Filtered users for the table
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock data for user growth line chart
  const growthData = [
    { name: 'Week 1', users: 12 },
    { name: 'Week 2', users: 24 },
    { name: 'Week 3', users: 45 },
    { name: 'Week 4', users: users.length },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-emperor tracking-tight mb-2">Admin Control Center</h2>
          <p className="text-edward text-lg font-medium">Monitoring GlobeTrotter platform adoption & metrics.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-emperor text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-bold">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Platform Status: Live
           </div>
        </div>
      </header>

      {/* High Level Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.userCount, icon: '👥', color: 'bg-blue-50 text-blue-500' },
          { label: 'Active Trips', value: stats.tripCount, icon: '✈️', color: 'bg-saffron/10 text-saffron' },
          { label: 'Platform GTV', value: `$${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-green-50 text-green-500' },
          { label: 'Growth rate', value: '+12%', icon: '📈', color: 'bg-purple-50 text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
             <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
               {stat.icon}
             </div>
             <div>
               <p className="text-[10px] font-black text-edward uppercase tracking-widest">{stat.label}</p>
               <h3 className="text-2xl font-black text-emperor">{stat.value}</h3>
             </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-10">
              <h4 className="text-xl font-black text-emperor">User Acquisition</h4>
              <select className="text-xs font-bold text-edward border-none outline-none cursor-pointer">
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
              </select>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#ABACAC', fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#ABACAC', fontWeight: 700}} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="users" stroke={COLORS.SAFFRON} strokeWidth={4} dot={{r: 6, fill: COLORS.SAFFRON, strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Top Cities Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
           <h4 className="text-xl font-black text-emperor mb-10">Most Popular Destinations</h4>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topCities} layout="vertical">
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#504D4E', fontWeight: 800}} width={80} />
                   <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px'}} />
                   <Bar dataKey="visits" fill={COLORS.SAFFRON} radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-4 space-y-4">
              {stats.topCities.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-edward">0{i+1}</span>
                      <span className="font-bold text-emperor text-sm">{c.name}</span>
                   </div>
                   <span className="text-xs font-black text-saffron bg-saffron/5 px-3 py-1 rounded-full">{c.visits} trips</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* User Management Table */}
      <section className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
         <div className="p-10 border-b border-gray-50 flex items-center justify-between">
            <h4 className="text-2xl font-black text-emperor">User Management</h4>
            <div className="flex gap-2">
               <input 
                type="text" 
                placeholder="Search users..." 
                className="bg-gray-50 border-none px-6 py-3 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-saffron/20" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
               />
               <button 
                onClick={handleExportCSV}
                className="bg-emperor text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-black transition-colors"
               >
                 Export CSV
               </button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50/50">
                     <th className="px-10 py-5 text-[10px] font-black text-edward uppercase tracking-widest">User</th>
                     <th className="px-10 py-5 text-[10px] font-black text-edward uppercase tracking-widest">Role</th>
                     <th className="px-10 py-5 text-[10px] font-black text-edward uppercase tracking-widest">Email</th>
                     <th className="px-10 py-5 text-[10px] font-black text-edward uppercase tracking-widest">Status</th>
                     <th className="px-10 py-5 text-[10px] font-black text-edward uppercase tracking-widest">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/30 transition-colors">
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                <img src={u.avatar || `https://picsum.photos/seed/${u.id}/100/100`} alt={u.name} />
                             </div>
                             <span className="font-bold text-emperor">{u.name}</span>
                          </div>
                       </td>
                       <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                             {u.role || 'user'}
                          </span>
                       </td>
                       <td className="px-10 py-6 text-edward font-medium text-sm">{u.email}</td>
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                             <span className="text-xs font-bold text-emperor">Active</span>
                          </div>
                       </td>
                       <td className="px-10 py-6">
                          <button 
                            onClick={() => setEditingUser(u)}
                            className="text-xs font-black text-saffron uppercase hover:underline"
                          >
                            Edit User
                          </button>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-10 py-10 text-center text-edward font-bold italic">No users found matching your search.</td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </section>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-emperor/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-emperor">Modify User Access</h3>
                 <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-50 rounded-full text-edward transition-colors">✕</button>
              </div>
              
              <form onSubmit={handleSaveUser} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-edward uppercase mb-2 tracking-widest">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 focus:bg-white border-none outline-none font-bold text-emperor focus:ring-2 focus:ring-saffron/20 transition-all" 
                      value={editingUser.name} 
                      onChange={e => setEditingUser({...editingUser, name: e.target.value})} 
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-edward uppercase mb-2 tracking-widest">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 focus:bg-white border-none outline-none font-bold text-emperor focus:ring-2 focus:ring-saffron/20 transition-all" 
                      value={editingUser.email} 
                      onChange={e => setEditingUser({...editingUser, email: e.target.value})} 
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-edward uppercase mb-2 tracking-widest">System Role</label>
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                        type="button"
                        onClick={() => setEditingUser({...editingUser, role: 'user'})}
                        className={`py-4 rounded-2xl font-black text-xs uppercase transition-all ${editingUser.role === 'user' || !editingUser.role ? 'bg-saffron text-white shadow-lg' : 'bg-gray-50 text-edward border border-transparent hover:border-saffron/30'}`}
                       >
                         User
                       </button>
                       <button 
                        type="button"
                        onClick={() => setEditingUser({...editingUser, role: 'admin'})}
                        className={`py-4 rounded-2xl font-black text-xs uppercase transition-all ${editingUser.role === 'admin' ? 'bg-emperor text-white shadow-lg' : 'bg-gray-50 text-edward border border-transparent hover:border-emperor/30'}`}
                       >
                         Admin
                       </button>
                    </div>
                 </div>

                 <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="flex-1 py-4 border border-gray-100 rounded-2xl font-black text-edward text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-saffron text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-saffron/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Save Updates
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
