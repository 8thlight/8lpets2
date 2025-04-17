import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Pet } from '../models/pet.model';

@Injectable({
  providedIn: 'root'
})
export class PetsService {
  private pets: Pet[] = [];
  
  constructor() {
    // Add some sample pets for demonstration
    this.generateSamplePets();
  }
  
  getPets(): Observable<Pet[]> {
    return of(this.pets);
  }
  
  getPetById(id: string): Observable<Pet | null> {
    const pet = this.pets.find(p => p._id === id);
    return of(pet || null);
  }
  
  generateRandomPet(): Observable<Pet> {
    const species = ['dragon', 'fae', 'guardian', 'mirror', 'tundra'];
    const genders = ['male', 'female'];
    
    const newPet: Pet = {
      _id: this.generateId(),
      name: this.generateName(),
      species: species[Math.floor(Math.random() * species.length)],
      gender: genders[Math.floor(Math.random() * genders.length)] as 'male' | 'female',
      level: 1,
      age: 0,
      
      primaryColor: this.getRandomColor(),
      secondaryColor: this.getRandomColor(),
      tertiaryColor: this.getRandomColor(),
      
      health: 50 + Math.floor(Math.random() * 20),
      strength: 10 + Math.floor(Math.random() * 10),
      defense: 10 + Math.floor(Math.random() * 10),
      speed: 10 + Math.floor(Math.random() * 10),
      
      hunger: 50,
      happiness: 50,
      cleanliness: 50,
      
      createdAt: new Date()
    };
    
    this.pets.push(newPet);
    return of(newPet);
  }
  
  feedPet(petId: string, foodId?: string): Observable<Pet> {
    const pet = this.pets.find(p => p._id === petId);
    if (!pet) {
      throw new Error('Pet not found');
    }
    
    // Update pet stats based on food
    pet.hunger = Math.max(0, (pet.hunger || 50) - 20);
    pet.happiness = Math.min(100, (pet.happiness || 50) + 5);
    pet.health = Math.min(100, pet.health + 2);
    
    return of(pet);
  }
  
  playWithPet(petId: string): Observable<Pet> {
    const pet = this.pets.find(p => p._id === petId);
    if (!pet) {
      throw new Error('Pet not found');
    }
    
    // Update pet stats
    pet.happiness = Math.min(100, (pet.happiness || 50) + 15);
    pet.hunger = Math.min(100, (pet.hunger || 50) + 10);
    
    return of(pet);
  }
  
  groomPet(petId: string, toolId?: string): Observable<Pet> {
    const pet = this.pets.find(p => p._id === petId);
    if (!pet) {
      throw new Error('Pet not found');
    }
    
    // Update pet stats
    pet.cleanliness = Math.min(100, (pet.cleanliness || 50) + 30);
    pet.happiness = Math.min(100, (pet.happiness || 50) + 5);
    
    return of(pet);
  }
  
  healPet(petId: string, medicineId?: string): Observable<Pet> {
    const pet = this.pets.find(p => p._id === petId);
    if (!pet) {
      throw new Error('Pet not found');
    }
    
    // Update pet stats
    pet.health = Math.min(100, pet.health + 20);
    pet.ailments = [];
    
    return of(pet);
  }
  
  trainPet(petId: string, activityId?: string): Observable<Pet> {
    const pet = this.pets.find(p => p._id === petId);
    if (!pet) {
      throw new Error('Pet not found');
    }
    
    // Update pet stats based on training activity
    if (!activityId || activityId === 'strength-training') {
      pet.strength = Math.min(100, pet.strength + 3);
    } else if (activityId === 'defense-training') {
      pet.defense = Math.min(100, pet.defense + 3);
    } else if (activityId === 'agility-training') {
      pet.speed = Math.min(100, pet.speed + 3);
    }
    
    // Increase level if stats are high enough
    if (pet.strength + pet.defense + pet.speed > pet.level * 30) {
      pet.level += 1;
    }
    
    return of(pet);
  }
  
  private generateSamplePets() {
    // Add a few sample pets
    const pet1: Pet = {
      _id: this.generateId(),
      name: 'Ember',
      species: 'dragon',
      gender: 'female',
      level: 5,
      age: 120,
      
      primaryColor: '#FF5733',
      secondaryColor: '#FFC300',
      tertiaryColor: '#DAF7A6',
      
      health: 80,
      strength: 25,
      defense: 20,
      speed: 30,
      
      hunger: 20,
      happiness: 90,
      cleanliness: 70,
      
      description: 'A fiery dragon with a playful personality.',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) // 120 days ago
    };
    
    const pet2: Pet = {
      _id: this.generateId(),
      name: 'Frost',
      species: 'tundra',
      gender: 'male',
      level: 3,
      age: 45,
      
      primaryColor: '#AED6F1',
      secondaryColor: '#85C1E9',
      tertiaryColor: '#FFFFFF',
      
      health: 65,
      strength: 15,
      defense: 30,
      speed: 15,
      
      hunger: 40,
      happiness: 60,
      cleanliness: 90,
      
      description: 'A calm and collected tundra dragon who loves the cold.',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
    };
    
    const pet3: Pet = {
      _id: this.generateId(),
      name: 'Whisper',
      species: 'fae',
      gender: 'female',
      level: 2,
      age: 30,
      
      primaryColor: '#D7BDE2',
      secondaryColor: '#A569BD',
      tertiaryColor: '#F5EEF8',
      
      health: 50,
      strength: 10,
      defense: 10,
      speed: 40,
      
      hunger: 60,
      happiness: 80,
      cleanliness: 85,
      
      description: 'A tiny fae dragon who moves with incredible speed.',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    };
    
    this.pets = [pet1, pet2, pet3];
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  private generateName(): string {
    const prefixes = ['Ember', 'Frost', 'Shadow', 'Storm', 'Blaze', 'Crystal', 'Twilight', 'Dawn', 'Dusk', 'Mystic'];
    const suffixes = ['scale', 'wing', 'claw', 'fang', 'heart', 'soul', 'spirit', 'flame', 'frost', 'shadow'];
    
    // Either return a single name or a combined name
    if (Math.random() > 0.5) {
      return prefixes[Math.floor(Math.random() * prefixes.length)];
    } else {
      return prefixes[Math.floor(Math.random() * prefixes.length)] + 
             suffixes[Math.floor(Math.random() * suffixes.length)];
    }
  }
  
  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
