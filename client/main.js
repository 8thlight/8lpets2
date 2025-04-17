import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { PetsCollection } from '/imports/api/pets';

import './main.html';

// Set up routing
FlowRouter.route('/', {
  name: 'home',
  action() {
    this.render('main', { currentPage: 'home' });
  }
});

FlowRouter.route('/pets', {
  name: 'pets',
  action() {
    this.render('main', { currentPage: 'pets' });
  }
});

FlowRouter.route('/breeding', {
  name: 'breeding',
  action() {
    this.render('main', { currentPage: 'breeding' });
  }
});

FlowRouter.route('/care', {
  name: 'care',
  action() {
    this.render('main', { currentPage: 'care' });
  }
});

FlowRouter.route('/games', {
  name: 'games',
  action() {
    this.render('main', { currentPage: 'games' });
  }
});

FlowRouter.route('/profile', {
  name: 'profile',
  action() {
    this.render('main', { currentPage: 'profile' });
  }
});

FlowRouter.route('/login', {
  name: 'login',
  action() {
    this.render('main', { currentPage: 'login' });
  }
});

FlowRouter.route('/register', {
  name: 'register',
  action() {
    this.render('main', { currentPage: 'register' });
  }
});

// Main template helpers
Template.body.helpers({
  isLoggedIn() {
    return !!Meteor.userId();
  }
});

// Pets template helpers and events
Template.pets.helpers({
  pets() {
    return PetsCollection.find({}, { sort: { createdAt: -1 } });
  }
});

Template.pets.events({
  'click #add-pet-button'(event) {
    event.preventDefault();

    if (!Meteor.userId()) {
      alert('Please log in to add pets');
      return;
    }

    // Generate random pet data
    const species = ['dragon', 'fae', 'guardian', 'mirror', 'tundra'];
    const randomSpecies = species[Math.floor(Math.random() * species.length)];
    const randomGender = Math.random() > 0.5 ? 'male' : 'female';

    // Generate random colors
    const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

    // Create pet data
    const petData = {
      name: generatePetName(),
      species: randomSpecies,
      gender: randomGender,
      level: 1,
      age: 0,
      primaryColor: randomColor(),
      secondaryColor: randomColor(),
      tertiaryColor: randomColor(),
      health: 50 + Math.floor(Math.random() * 20),
      strength: 10 + Math.floor(Math.random() * 10),
      defense: 10 + Math.floor(Math.random() * 10),
      speed: 10 + Math.floor(Math.random() * 10),
      hunger: 50,
      happiness: 50,
      cleanliness: 50,
      description: `A newly acquired ${randomSpecies}.`
    };

    // Call the server method to create the pet
    Meteor.call('pets.create', petData, (error, result) => {
      if (error) {
        console.error('Error creating pet:', error);
        alert(`Failed to create pet: ${error.message}`);
      } else {
        console.log('Pet created successfully:', result);
      }
    });
  }
});

// Breeding template helpers
Template.breeding.helpers({
  pets() {
    return PetsCollection.find({}, { sort: { createdAt: -1 } });
  }
});

// Care template helpers
Template.care.helpers({
  pets() {
    return PetsCollection.find({}, { sort: { createdAt: -1 } });
  }
});

// Profile template helpers and events
Template.profile.helpers({
  userEmail() {
    const user = Meteor.user();
    return user && user.emails && user.emails[0] ? user.emails[0].address : 'N/A';
  },

  formatDate(date) {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  petCount() {
    return PetsCollection.find({ userId: Meteor.userId() }).count();
  },

  highestLevel() {
    const pets = PetsCollection.find({ userId: Meteor.userId() }).fetch();
    return pets.reduce((max, pet) => Math.max(max, pet.level), 0);
  }
});

Template.profile.events({
  'click #logout-button'(event) {
    event.preventDefault();
    Meteor.logout();
    FlowRouter.go('/login');
  }
});

// Login template events
Template.login.events({
  'submit #login-form'(event) {
    event.preventDefault();

    const email = event.target.querySelector('#login-email').value;
    const password = event.target.querySelector('#login-password').value;

    Meteor.loginWithPassword(email, password, (error) => {
      if (error) {
        alert(`Login failed: ${error.message}`);
      } else {
        FlowRouter.go('/');
      }
    });
  }
});

// Register template events
Template.register.events({
  'submit #register-form'(event) {
    event.preventDefault();

    const username = event.target.querySelector('#register-username').value;
    const email = event.target.querySelector('#register-email').value;
    const password = event.target.querySelector('#register-password').value;

    Accounts.createUser({
      username,
      email,
      password,
      profile: {
        createdAt: new Date()
      }
    }, (error) => {
      if (error) {
        alert(`Registration failed: ${error.message}`);
      } else {
        // Add starter pets
        Meteor.call('user.addStarterPets');
        FlowRouter.go('/');
      }
    });
  }
});

// Helper functions
function generatePetName() {
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
