import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { PetsCollection } from '/imports/api/pets';

// Sample data for new users
const samplePets = [
  {
    name: 'Ember',
    species: 'dragon',
    gender: 'female' as const,
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
    description: 'A fiery dragon with a playful personality.'
  },
  {
    name: 'Frost',
    species: 'tundra',
    gender: 'male' as const,
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
    description: 'A calm and collected tundra dragon who loves the cold.'
  },
  {
    name: 'Whisper',
    species: 'fae',
    gender: 'female' as const,
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
    description: 'A tiny fae dragon who moves with incredible speed.'
  }
];

Meteor.startup(async () => {
  // Create a default admin user if none exists
  if (await Meteor.users.find().countAsync() === 0) {
    const userId = await Accounts.createUserAsync({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password',
      profile: {
        createdAt: new Date()
      }
    });

    // Add sample pets for the admin user
    for (const petData of samplePets) {
      await PetsCollection.insertAsync({
        ...petData,
        userId,
        createdAt: new Date(Date.now() - Math.random() * 100 * 24 * 60 * 60 * 1000) // Random date in the past 100 days
      });
    }
  }

  // Publish pets collection to clients (only their own pets)
  Meteor.publish('pets', function () {
    if (!this.userId) {
      return this.ready();
    }
    return PetsCollection.find({ userId: this.userId });
  });

  // Publish user data
  Meteor.publish('userData', function () {
    if (!this.userId) {
      return this.ready();
    }
    return Meteor.users.find(
      { _id: this.userId },
      { fields: { username: 1, emails: 1, profile: 1 } }
    );
  });

  // Hook to add starter pets for new users
  Accounts.onCreateUser((options, user) => {
    // Make sure profile exists
    user.profile = options.profile || {};

    // Add creation date if not present
    if (!user.profile.createdAt) {
      user.profile.createdAt = new Date();
    }

    // Return the user object
    return user;
  });
});

// After user creation, add starter pets
Meteor.methods({
  'user.addStarterPets'() {
    // Make sure the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    // Check if the user already has pets
    const petCount = PetsCollection.find({ userId: this.userId }).count();
    if (petCount > 0) {
      throw new Meteor.Error('already-has-pets', 'User already has starter pets');
    }

    // Add a starter pet for the user
    const starterPet = {
      name: 'Newbie',
      species: 'dragon',
      gender: Math.random() > 0.5 ? 'male' : 'female',
      level: 1,
      age: 0,
      primaryColor: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      secondaryColor: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      tertiaryColor: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      health: 50,
      strength: 10,
      defense: 10,
      speed: 10,
      hunger: 50,
      happiness: 50,
      cleanliness: 50,
      description: 'Your first pet! Take good care of it.',
      userId: this.userId,
      createdAt: new Date()
    };

    return PetsCollection.insert(starterPet);
  }
});
