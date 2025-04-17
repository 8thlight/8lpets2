import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Pet } from '../models/pet.model';
import { PetsService } from './pets.service';

@Injectable({
  providedIn: 'root'
})
export class BreedingService {
  
  constructor(private petsService: PetsService) {}
  
  breedPets(parent1Id: string, parent2Id: string): Observable<Pet> {
    // Get parents
    let parent1: Pet | null = null;
    let parent2: Pet | null = null;
    
    this.petsService.getPetById(parent1Id).subscribe(pet => {
      parent1 = pet;
    });
    
    this.petsService.getPetById(parent2Id).subscribe(pet => {
      parent2 = pet;
    });
    
    if (!parent1 || !parent2) {
      throw new Error('Parents not found');
    }
    
    // Create offspring
    const offspring: Pet = {
      _id: this.generateId(),
      name: this.generateName(),
      species: this.determineSpecies(parent1, parent2),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      level: 1,
      age: 0,
      
      primaryColor: this.inheritColor(parent1.primaryColor, parent2.primaryColor),
      secondaryColor: this.inheritColor(parent1.secondaryColor, parent2.secondaryColor),
      tertiaryColor: this.inheritColor(parent1.tertiaryColor, parent2.tertiaryColor),
      
      health: this.calculateStat(parent1.health, parent2.health, 0.8),
      strength: this.calculateStat(parent1.strength, parent2.strength, 0.8),
      defense: this.calculateStat(parent1.defense, parent2.defense, 0.8),
      speed: this.calculateStat(parent1.speed, parent2.speed, 0.8),
      
      hunger: 50,
      happiness: 80,
      cleanliness: 100,
      
      parents: [parent1Id, parent2Id],
      
      description: `Offspring of ${parent1.name} and ${parent2.name}.`,
      createdAt: new Date()
    };
    
    // Update parents to include this offspring
    if (!parent1.offspring) parent1.offspring = [];
    if (!parent2.offspring) parent2.offspring = [];
    
    parent1.offspring.push(offspring._id);
    parent2.offspring.push(offspring._id);
    
    // Add offspring to pets collection
    this.petsService.getPets().subscribe(pets => {
      pets.push(offspring);
    });
    
    return of(offspring);
  }
  
  private determineSpecies(parent1: Pet, parent2: Pet): string {
    // If parents are the same species, offspring will be that species
    if (parent1.species === parent2.species) {
      return parent1.species;
    }
    
    // Otherwise, randomly choose one of the parent's species
    return Math.random() > 0.5 ? parent1.species : parent2.species;
  }
  
  private calculateStat(stat1: number, stat2: number, inheritanceFactor: number): number {
    // Calculate base stat as average of parents with some inheritance factor
    const baseStat = (stat1 + stat2) / 2 * inheritanceFactor;
    
    // Add some random variation
    const variation = Math.random() * 10 - 5; // -5 to +5
    
    // Ensure stat is within bounds
    return Math.max(1, Math.min(100, Math.floor(baseStat + variation)));
  }
  
  private inheritColor(color1: string, color2: string): string {
    // Simple color inheritance - either take one parent's color or blend them
    const inheritanceType = Math.random();
    
    if (inheritanceType < 0.4) {
      // Inherit from parent 1
      return color1;
    } else if (inheritanceType < 0.8) {
      // Inherit from parent 2
      return color2;
    } else {
      // Blend colors
      return this.blendColors(color1, color2);
    }
  }
  
  private blendColors(color1: string, color2: string): string {
    // Convert hex to RGB
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    // Blend with random weight
    const weight = Math.random();
    const r = Math.floor(r1 * weight + r2 * (1 - weight));
    const g = Math.floor(g1 * weight + g2 * (1 - weight));
    const b = Math.floor(b1 * weight + b2 * (1 - weight));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  private generateName(): string {
    const prefixes = ['Tiny', 'Little', 'Baby', 'Young', 'Small', 'Cute', 'Sweet', 'Precious'];
    const names = ['Ember', 'Frost', 'Shadow', 'Storm', 'Blaze', 'Crystal', 'Twilight', 'Dawn', 'Dusk', 'Mystic'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${names[Math.floor(Math.random() * names.length)]}`;
  }
}
