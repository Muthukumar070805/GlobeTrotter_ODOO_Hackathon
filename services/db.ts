
import { User, Trip, TripStop, Activity } from '../types';

const STORAGE_KEYS = {
  TRIPS: 'globetrotter_trips',
  USER: 'globetrotter_user',
  USERS_LIST: 'globetrotter_users_list', // For admin view
};

export const MockDB = {
  getTrips: (): Trip[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRIPS);
    return data ? JSON.parse(data) : [];
  },

  getTrip: (id: string): Trip | undefined => {
    return MockDB.getTrips().find(t => t.id === id);
  },

  saveTrip: (trip: Trip) => {
    const trips = MockDB.getTrips();
    const index = trips.findIndex(t => t.id === trip.id);
    if (index > -1) {
      trips[index] = trip;
    } else {
      trips.push(trip);
    }
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  },

  deleteTrip: (id: string) => {
    const trips = MockDB.getTrips().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      // Track this user in the global list for admin analytics
      const users = MockDB.getAllUsers();
      if (!users.find(u => u.id === user.id)) {
        users.push(user);
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  getAllUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
    const users = data ? JSON.parse(data) : [];
    // Ensure we have at least some data for charts if empty
    if (users.length === 0) {
      const defaultAdmin = { id: '1', name: 'Iyynes', email: 'iyynes@gmail.com', role: 'admin' as const };
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify([defaultAdmin]));
      return [defaultAdmin];
    }
    return users;
  },

  updateUser: (updatedUser: User) => {
    const users = MockDB.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index > -1) {
      users[index] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
      
      // If the updated user is also the current session user, update their session too
      const current = MockDB.getCurrentUser();
      if (current && current.id === updatedUser.id) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      }
    }
  },

  getGlobalStats: () => {
    const trips = MockDB.getTrips();
    const users = MockDB.getAllUsers();
    const totalRevenue = trips.reduce((acc, t) => 
      acc + t.stops.reduce((sAcc, s) => sAcc + s.activities.reduce((aAcc, a) => aAcc + a.cost, 0), 0), 0);
    
    // Most visited cities
    const cityCounts: Record<string, number> = {};
    trips.forEach(t => t.stops.forEach(s => {
      cityCounts[s.city] = (cityCounts[s.city] || 0) + 1;
    }));
    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, visits]) => ({ name, visits }));

    return {
      userCount: users.length,
      tripCount: trips.length,
      totalRevenue,
      topCities
    };
  }
};
