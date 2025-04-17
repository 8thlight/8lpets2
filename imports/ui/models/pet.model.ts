export interface Pet {
  _id: string;
  name: string;
  species: string;
  gender: 'male' | 'female';
  level: number;
  age: number;
  
  // Appearance
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  
  // Stats
  health: number;
  strength: number;
  defense: number;
  speed: number;
  
  // Care stats
  hunger?: number;
  happiness?: number;
  cleanliness?: number;
  
  // Health
  ailments?: string[];
  
  // Family
  parents?: string[];
  offspring?: string[];
  
  // Other
  description?: string;
  createdAt: Date;
}
