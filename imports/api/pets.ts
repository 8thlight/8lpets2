import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export interface Pet {
  _id?: string;
  name: string;
  species: string;
  gender: 'male' | 'female';
  level: number;
  age: number;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  health: number;
  strength: number;
  defense: number;
  speed: number;
  hunger?: number;
  happiness?: number;
  cleanliness?: number;
  ailments?: string[];
  parents?: string[];
  offspring?: string[];
  description?: string;
  createdAt: Date;
  userId: string;
}

export const PetsCollection = new Mongo.Collection<Pet>('pets');

// Define methods for client-server interaction
Meteor.methods({
  'pets.create'(petData: Omit<Pet, '_id' | 'createdAt' | 'userId'>) {
    // Make sure the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to create a pet');
    }
    
    // Create the pet with user ID and timestamp
    return PetsCollection.insert({
      ...petData,
      userId: this.userId,
      createdAt: new Date()
    });
  },
  
  'pets.update'(petId: string, updates: Partial<Pet>) {
    // Make sure the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update a pet');
    }
    
    // Find the pet
    const pet = PetsCollection.findOne({ _id: petId });
    
    // Make sure the pet exists and belongs to the current user
    if (!pet) {
      throw new Meteor.Error('not-found', 'Pet not found');
    }
    
    if (pet.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only update your own pets');
    }
    
    // Update the pet
    return PetsCollection.update(petId, { $set: updates });
  },
  
  'pets.remove'(petId: string) {
    // Make sure the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to remove a pet');
    }
    
    // Find the pet
    const pet = PetsCollection.findOne({ _id: petId });
    
    // Make sure the pet exists and belongs to the current user
    if (!pet) {
      throw new Meteor.Error('not-found', 'Pet not found');
    }
    
    if (pet.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only remove your own pets');
    }
    
    // Remove the pet
    return PetsCollection.remove(petId);
  },
  
  'pets.feed'(petId: string, foodId?: string) {
    // Make sure the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to feed a pet');
    }
    
    // Find the pet
    const pet = PetsCollection.findOne({ _id: petId });
    
    // Make sure the pet exists and belongs to the current user
    if (!pet) {
      throw new Meteor.Error('not-found', 'Pet not found');
    }
    
    if (pet.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only feed your own pets');
    }
    
    // Update pet stats based on food
    const hunger = Math.max(0, (pet.hunger || 50) - 20);
    const happiness = Math.min(100, (pet.happiness || 50) + 5);
    const health = Math.min(100, pet.health + 2);
    
    // Update the pet
    PetsCollection.update(petId, {
      $set: {
        hunger,
        happiness,
        health
      }
    });
    
    // Return the updated pet
    return PetsCollection.findOne(petId);
  },
  
  'pets.breed'(parent1Id: string, parent2Id: string) {
    // Make sure the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to breed pets');
    }
    
    // Find the parents
    const parent1 = PetsCollection.findOne({ _id: parent1Id });
    const parent2 = PetsCollection.findOne({ _id: parent2Id });
    
    // Make sure both parents exist and belong to the current user
    if (!parent1 || !parent2) {
      throw new Meteor.Error('not-found', 'One or both parents not found');
    }
    
    if (parent1.userId !== this.userId || parent2.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only breed your own pets');
    }
    
    // Make sure parents are different genders
    if (parent1.gender === parent2.gender) {
      throw new Meteor.Error('invalid-breeding', 'Parents must be different genders');
    }
    
    // Create offspring
    const offspringId = PetsCollection.insert({
      name: generateOffspringName(),
      species: determineSpecies(parent1, parent2),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      level: 1,
      age: 0,
      primaryColor: inheritColor(parent1.primaryColor, parent2.primaryColor),
      secondaryColor: inheritColor(parent1.secondaryColor, parent2.secondaryColor),
      tertiaryColor: inheritColor(parent1.tertiaryColor, parent2.tertiaryColor),
      health: calculateStat(parent1.health, parent2.health, 0.8),
      strength: calculateStat(parent1.strength, parent2.strength, 0.8),
      defense: calculateStat(parent1.defense, parent2.defense, 0.8),
      speed: calculateStat(parent1.speed, parent2.speed, 0.8),
      hunger: 50,
      happiness: 80,
      cleanliness: 100,
      parents: [parent1Id, parent2Id],
      description: `Offspring of ${parent1.name} and ${parent2.name}.`,
      createdAt: new Date(),
      userId: this.userId
    });
    
    // Update parents to include this offspring
    PetsCollection.update(parent1Id, {
      $push: { offspring: offspringId }
    });
    
    PetsCollection.update(parent2Id, {
      $push: { offspring: offspringId }
    });
    
    // Return the offspring
    return PetsCollection.findOne(offspringId);
  }
});

// Helper functions for breeding
function determineSpecies(parent1: Pet, parent2: Pet): string {
  // If parents are the same species, offspring will be that species
  if (parent1.species === parent2.species) {
    return parent1.species;
  }
  
  // Otherwise, randomly choose one of the parent's species
  return Math.random() > 0.5 ? parent1.species : parent2.species;
}

function calculateStat(stat1: number, stat2: number, inheritanceFactor: number): number {
  // Calculate base stat as average of parents with some inheritance factor
  const baseStat = (stat1 + stat2) / 2 * inheritanceFactor;
  
  // Add some random variation
  const variation = Math.random() * 10 - 5; // -5 to +5
  
  // Ensure stat is within bounds
  return Math.max(1, Math.min(100, Math.floor(baseStat + variation)));
}

function inheritColor(color1: string, color2: string): string {
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
    return blendColors(color1, color2);
  }
}

function blendColors(color1: string, color2: string): string {
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

function generateOffspringName(): string {
  const prefixes = ['Tiny', 'Little', 'Baby', 'Young', 'Small', 'Cute', 'Sweet', 'Precious'];
  const names = ['Ember', 'Frost', 'Shadow', 'Storm', 'Blaze', 'Crystal', 'Twilight', 'Dawn', 'Dusk', 'Mystic'];
  
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${names[Math.floor(Math.random() * names.length)]}`;
}
