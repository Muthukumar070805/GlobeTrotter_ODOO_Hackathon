
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'user' | 'admin';
}

export interface Activity {
  id: string;
  stopId: string;
  name: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  cost: number;
  category: 'Food' | 'Sightseeing' | 'Transport' | 'Accommodation' | 'Other';
}

export interface TripStop {
  id: string;
  tripId: string;
  city: string;
  order: number;
  arrivalDate: string;
  departureDate: string;
  activities: Activity[];
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  budgetLimit: number;
  isPublic: boolean;
  stops: TripStop[];
  coverImage?: string;
}

export interface CityInfo {
  name: string;
  country: string;
  region: string;
  costIndex: 1 | 2 | 3 | 4 | 5; // 1: Cheap, 5: Expensive
  popularity: number; // 1-100
  description: string;
  imageUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface GeminiSuggestion {
  name: string;
  description: string;
  estimatedCost: number;
  category: Activity['category'];
  bestTime: string;
}
