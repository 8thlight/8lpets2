// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize authentication
  initAuth();

  // Set up navigation
  setupNavigation();

  // Set up event listeners for interactive elements
  setupEventListeners();

  // Check for hash in URL and navigate to that page
  const hash = window.location.hash.substring(1);
  if (hash) {
    showPage(hash);
  } else {
    // If no hash, check auth status and show appropriate page
    const isLoggedIn = checkAuth();
    if (!isLoggedIn) {
      showPage('login');
    }
  }
});

// User data store
const userStore = {
  users: JSON.parse(localStorage.getItem('users') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),

  // Save users to localStorage
  saveUsers: function() {
    localStorage.setItem('users', JSON.stringify(this.users));
  },

  // Save current user to localStorage
  saveCurrentUser: function() {
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  },

  // Register a new user
  registerUser: function(username, email, password) {
    // Check if email already exists
    const existingUser = this.users.find(user => user.email === email);
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password, // In a real app, this would be hashed
      createdAt: new Date().toISOString(),
      pets: []
    };

    // Add to users array
    this.users.push(newUser);
    this.saveUsers();

    // Set as current user
    this.currentUser = { ...newUser };
    delete this.currentUser.password; // Don't store password in current user
    this.saveCurrentUser();

    return { success: true, user: this.currentUser };
  },

  // Login user
  loginUser: function(email, password) {
    // Find user by email
    const user = this.users.find(user => user.email === email);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Check password
    if (user.password !== password) { // In a real app, this would use proper comparison
      return { success: false, message: 'Incorrect password' };
    }

    // Set as current user
    this.currentUser = { ...user };
    delete this.currentUser.password; // Don't store password in current user
    this.saveCurrentUser();

    return { success: true, user: this.currentUser };
  },

  // Logout user
  logoutUser: function() {
    this.currentUser = null;
    this.saveCurrentUser();
    return { success: true };
  },

  // Check if user is logged in
  isLoggedIn: function() {
    return !!this.currentUser;
  },

  // Get current user
  getCurrentUser: function() {
    return this.currentUser;
  },

  // Add a pet to the current user
  addPet: function(pet) {
    if (!this.currentUser) return { success: false, message: 'Not logged in' };

    // Find user in users array
    const userIndex = this.users.findIndex(user => user.id === this.currentUser.id);
    if (userIndex === -1) return { success: false, message: 'User not found' };

    // Add pet to user's pets
    if (!this.users[userIndex].pets) this.users[userIndex].pets = [];
    this.users[userIndex].pets.push(pet);
    this.saveUsers();

    // Update current user
    this.currentUser.pets = this.users[userIndex].pets;
    this.saveCurrentUser();

    return { success: true, pet };
  },

  // Get pets for current user
  getPets: function() {
    if (!this.currentUser) return [];
    return this.currentUser.pets || [];
  }
};

// Initialize authentication
function initAuth() {
  // Set up login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      const result = userStore.loginUser(email, password);
      if (result.success) {
        updateAuthUI(true);
        showPage('home');
      } else {
        // Show error
        showAuthError('login', result.message);
      }
    });
  }

  // Set up register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const username = document.getElementById('register-username').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;

      const result = userStore.registerUser(username, email, password);
      if (result.success) {
        updateAuthUI(true);
        showPage('home');

        // Add starter pet
        addStarterPet();
      } else {
        // Show error
        showAuthError('register', result.message);
      }
    });
  }

  // Set up logout buttons
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function() {
      userStore.logoutUser();
      updateAuthUI(false);
      showPage('login');
    });
  }

  const profileLogoutButton = document.getElementById('profile-logout-button');
  if (profileLogoutButton) {
    profileLogoutButton.addEventListener('click', function() {
      userStore.logoutUser();
      updateAuthUI(false);
      showPage('login');
    });
  }

  // Check initial auth state
  updateAuthUI(userStore.isLoggedIn());
}

// Check authentication status
function checkAuth() {
  const isLoggedIn = userStore.isLoggedIn();
  updateAuthUI(isLoggedIn);
  return isLoggedIn;
}

// Update UI based on authentication state
function updateAuthUI(isLoggedIn) {
  // Update navigation
  const loginButton = document.getElementById('login-button');
  const registerButton = document.getElementById('register-button');
  const logoutButton = document.getElementById('logout-button');

  if (loginButton && registerButton && logoutButton) {
    if (isLoggedIn) {
      loginButton.style.display = 'none';
      registerButton.style.display = 'none';
      logoutButton.style.display = 'block';
    } else {
      loginButton.style.display = 'block';
      registerButton.style.display = 'block';
      logoutButton.style.display = 'none';
    }
  }

  // Update profile page if user is logged in
  if (isLoggedIn) {
    updateProfilePage();
  }
}

// Show authentication error
function showAuthError(formType, message) {
  const form = document.getElementById(`${formType}-form`);

  // Remove any existing error
  const existingError = form.querySelector('.auth-error');
  if (existingError) {
    existingError.remove();
  }

  // Create error element
  const errorElement = document.createElement('div');
  errorElement.className = 'auth-error';
  errorElement.textContent = message;

  // Insert at top of form
  form.insertBefore(errorElement, form.firstChild);
}

// Update profile page with user data
function updateProfilePage() {
  const user = userStore.getCurrentUser();
  if (!user) return;

  // Update profile information
  const usernameElement = document.getElementById('profile-username');
  const emailElement = document.getElementById('profile-email');
  const dateElement = document.getElementById('profile-date');

  if (usernameElement) usernameElement.textContent = user.username;
  if (emailElement) emailElement.textContent = user.email;
  if (dateElement) {
    const date = new Date(user.createdAt);
    dateElement.textContent = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Update pet stats
  const pets = userStore.getPets();
  const petCountElement = document.querySelector('#profile-page .stat-card:nth-child(1) .stat-value');
  const highestLevelElement = document.querySelector('#profile-page .stat-card:nth-child(2) .stat-value');

  if (petCountElement) petCountElement.textContent = pets.length;
  if (highestLevelElement) {
    const highestLevel = pets.reduce((max, pet) => Math.max(max, pet.level || 1), 0);
    highestLevelElement.textContent = highestLevel;
  }
}

// Add a starter pet for new users
function addStarterPet() {
  // Generate random pet data
  const species = ['dragon', 'fae', 'guardian', 'mirror', 'tundra'];
  const randomSpecies = species[Math.floor(Math.random() * species.length)];
  const randomGender = Math.random() > 0.5 ? 'male' : 'female';

  // Generate random colors
  const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

  // Create pet data
  const pet = {
    id: Date.now().toString(),
    name: 'Starter ' + generatePetName(),
    species: randomSpecies,
    gender: randomGender,
    level: 1,
    primaryColor: randomColor(),
    secondaryColor: randomColor(),
    tertiaryColor: randomColor(),
    health: 50 + Math.floor(Math.random() * 20),
    strength: 10 + Math.floor(Math.random() * 10),
    defense: 10 + Math.floor(Math.random() * 10),
    speed: 10 + Math.floor(Math.random() * 10),
    createdAt: new Date().toISOString()
  };

  // Add to user's pets
  userStore.addPet(pet);

  // Show success message
  alert(`Welcome! A starter pet named ${pet.name} has been added to your collection.`);
}

// Set up navigation links
function setupNavigation() {
  // Get all navigation links
  const navLinks = document.querySelectorAll('.nav-link');

  // Add click event listeners to each link
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Get the page to show from the data-page attribute
      const page = this.getAttribute('data-page');
      if (page) {
        e.preventDefault();
        showPage(page);
        // Update URL hash
        window.location.hash = page;
      }
    });
  });

  // Set up auth switch links
  const switchAuthLinks = document.querySelectorAll('.switch-auth');
  switchAuthLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      if (page) {
        showPage(page);
        window.location.hash = page;
      }
    });
  });

  // Listen for hash changes in the URL
  window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      showPage(hash);
    }
  });
}

// Show a specific page and hide others
function showPage(pageName) {
  // Check if page requires authentication
  const protectedPages = ['pets', 'breeding', 'care', 'games', 'profile'];
  if (protectedPages.includes(pageName) && !userStore.isLoggedIn()) {
    // Redirect to login page
    pageName = 'login';
    window.location.hash = pageName;
  }

  // Hide all pages
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.style.display = 'none';
  });

  // Show the requested page
  const pageToShow = document.getElementById(`${pageName}-page`);
  if (pageToShow) {
    pageToShow.style.display = 'block';

    // Special handling for specific pages
    if (pageName === 'pets') {
      renderUserPets();
    } else if (pageName === 'breeding') {
      renderBreedingPets();
    }
  }

  // Update active state in navigation
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === pageName) {
      link.classList.add('active');
    }
  });
}

// Render the user's pets on the pets page
function renderUserPets() {
  if (!userStore.isLoggedIn()) return;

  const pets = userStore.getPets();
  const petGrid = document.getElementById('pet-grid');
  if (!petGrid) return;

  // Clear existing pet cards (except the add button)
  petGrid.querySelectorAll('.pet-card:not(.add-pet)').forEach(card => {
    card.remove();
  });

  // Add pet cards for each pet
  pets.forEach(pet => {
    const petCard = document.createElement('div');
    petCard.className = 'pet-card';
    petCard.dataset.petId = pet.id;
    petCard.innerHTML = `
      <div class="pet-image" style="background-color: ${pet.primaryColor};"></div>
      <div class="pet-info">
        <h3>${pet.name}</h3>
        <p>${pet.species} - Level ${pet.level}</p>
        <div class="pet-stats">
          <span>❤️ ${pet.health}</span>
          <span>⚔️ ${pet.strength}</span>
          <span>🛡️ ${pet.defense}</span>
        </div>
      </div>
    `;

    // Add click event to view pet details
    petCard.addEventListener('click', function() {
      alert(`Viewing details for ${pet.name}`);
    });

    // Add the pet card to the grid
    const addButton = petGrid.querySelector('.add-pet');
    if (addButton) {
      petGrid.insertBefore(petCard, addButton);
    } else {
      petGrid.appendChild(petCard);
    }
  });
}

// Render the user's pets on the breeding page
function renderBreedingPets() {
  if (!userStore.isLoggedIn()) return;

  const pets = userStore.getPets();
  if (pets.length < 2) {
    // Show message if not enough pets for breeding
    const breedingPage = document.getElementById('breeding-page');
    const breedingContent = breedingPage.querySelector('.breeding-content');

    if (breedingContent) {
      breedingContent.innerHTML = `
        <h2>Pet Breeding</h2>
        <p>You need at least 2 pets to breed. Please add more pets to your collection.</p>
        <button class="btn btn-primary" onclick="showPage('pets')">Go to My Pets</button>
      `;
    }
    return;
  }

  // Get the parent selection containers
  const breedingPage = document.getElementById('breeding-page');
  if (!breedingPage) return;

  // Clear existing content
  const breedingContent = breedingPage.querySelector('.breeding-content');
  if (!breedingContent) return;

  // Create new breeding UI
  breedingContent.innerHTML = `
    <h2>Pet Breeding</h2>
    <p>Select two compatible pets to breed and create offspring with combined traits.</p>

    <div class="breeding-selection">
      <div class="parent-selection">
        <h3>Select First Parent</h3>
        <div class="pet-grid small" id="parent1-grid"></div>
      </div>

      <div class="parent-selection">
        <h3>Select Second Parent</h3>
        <div class="pet-grid small" id="parent2-grid"></div>
      </div>
    </div>

    <button id="breed-button" class="btn btn-primary" disabled>Breed Selected Pets</button>
  `;

  // Get the parent grids
  const parent1Grid = document.getElementById('parent1-grid');
  const parent2Grid = document.getElementById('parent2-grid');

  if (!parent1Grid || !parent2Grid) return;

  // Track selected pets
  let selectedParent1 = null;
  let selectedParent2 = null;

  // Add pet cards to both parent grids
  pets.forEach(pet => {
    // Create pet card for parent 1
    const parent1Card = createBreedingPetCard(pet, 1);
    parent1Grid.appendChild(parent1Card);

    // Create pet card for parent 2
    const parent2Card = createBreedingPetCard(pet, 2);
    parent2Grid.appendChild(parent2Card);
  });

  // Set up breed button
  const breedButton = document.getElementById('breed-button');
  if (breedButton) {
    breedButton.addEventListener('click', function() {
      if (selectedParent1 && selectedParent2) {
        breedPets(selectedParent1, selectedParent2);
      }
    });
  }

  // Function to create a breeding pet card
  function createBreedingPetCard(pet, parentNum) {
    const petCard = document.createElement('div');
    petCard.className = 'pet-card';
    petCard.dataset.petId = pet.id;
    petCard.innerHTML = `
      <div class="pet-image" style="background-color: ${pet.primaryColor};"></div>
      <div class="pet-info">
        <h4>${pet.name}</h4>
        <p>${pet.species} - ${pet.gender}</p>
      </div>
    `;

    // Add click event for selection
    petCard.addEventListener('click', function() {
      // Handle selection based on parent number
      if (parentNum === 1) {
        // Deselect previous selection
        const previousSelection = parent1Grid.querySelector('.selected');
        if (previousSelection) {
          previousSelection.classList.remove('selected');
        }

        // Select this pet
        this.classList.add('selected');
        selectedParent1 = this;
      } else {
        // Deselect previous selection
        const previousSelection = parent2Grid.querySelector('.selected');
        if (previousSelection) {
          previousSelection.classList.remove('selected');
        }

        // Select this pet
        this.classList.add('selected');
        selectedParent2 = this;
      }

      // Enable/disable breed button
      if (breedButton) {
        breedButton.disabled = !(selectedParent1 && selectedParent2);
      }
    });

    return petCard;
  }
}

// Set up event listeners for interactive elements
function setupEventListeners() {
  // Navigation buttons in header
  const loginButton = document.getElementById('login-button');
  if (loginButton) {
    loginButton.addEventListener('click', function() {
      showPage('login');
    });
  }

  const registerButton = document.getElementById('register-button');
  if (registerButton) {
    registerButton.addEventListener('click', function() {
      showPage('register');
    });
  }

  // Add Pet Button
  const addPetButton = document.getElementById('add-pet-button');
  if (addPetButton) {
    addPetButton.addEventListener('click', function() {
      createRandomPet();
    });
  }

  // Breeding button will be set up in renderBreedingPets function

  // Breed Button
  const breedButton = document.getElementById('breed-button');
  if (breedButton) {
    breedButton.addEventListener('click', function() {
      const selectedPets = document.querySelectorAll('#breeding-page .pet-card.selected');
      if (selectedPets.length === 2) {
        breedPets(selectedPets[0], selectedPets[1]);
      }
    });
  }

  // Care Tabs
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all tab buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to clicked button
      this.classList.add('active');

      // Show corresponding tab panel
      const tabName = this.getAttribute('data-tab');
      const tabPanels = document.querySelectorAll('.tab-panel');
      tabPanels.forEach(panel => panel.classList.remove('active'));

      const activePanel = document.getElementById(`${tabName}-tab`);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });

  // Feed Button
  const feedButton = document.getElementById('feed-button');
  if (feedButton) {
    feedButton.addEventListener('click', function() {
      alert('Pet has been fed! Health +5, Happiness +3');
    });
  }

  // Game Play Buttons
  const playButtons = document.querySelectorAll('.play-button');
  playButtons.forEach(button => {
    button.addEventListener('click', function() {
      const gameCard = this.closest('.game-card');
      const gameId = gameCard.id;

      // Launch the appropriate game
      switch(gameId) {
        case 'treasure-hunt':
          playTreasureHunt();
          break;
        case 'pet-race':
          playPetRace();
          break;
        case 'puzzle-solve':
          playPuzzleGame();
          break;
        default:
          alert(`Playing ${gameId}! This feature is coming soon.`);
      }
    });
  });

  // Logout Button
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function() {
      alert('You have been logged out.');
      showPage('home');
    });
  }
}

// Create a random pet
function createRandomPet() {
  // Check if user is logged in
  if (!userStore.isLoggedIn()) {
    alert('Please log in to add pets');
    showPage('login');
    return;
  }

  // Generate random pet data
  const species = ['dragon', 'fae', 'guardian', 'mirror', 'tundra'];
  const randomSpecies = species[Math.floor(Math.random() * species.length)];
  const randomGender = Math.random() > 0.5 ? 'male' : 'female';

  // Generate random colors
  const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  const primaryColor = randomColor();

  // Generate random stats
  const health = 50 + Math.floor(Math.random() * 20);
  const strength = 10 + Math.floor(Math.random() * 10);
  const defense = 10 + Math.floor(Math.random() * 10);
  const level = 1;

  // Generate a name
  const name = generatePetName();

  // Create pet data
  const pet = {
    id: Date.now().toString(),
    name,
    species: randomSpecies,
    gender: randomGender,
    level,
    primaryColor,
    secondaryColor: randomColor(),
    tertiaryColor: randomColor(),
    health,
    strength,
    defense,
    speed: 10 + Math.floor(Math.random() * 10),
    createdAt: new Date().toISOString()
  };

  // Add to user's pets
  const result = userStore.addPet(pet);
  if (!result.success) {
    alert(`Error adding pet: ${result.message}`);
    return;
  }

  // Create the pet card
  const petCard = document.createElement('div');
  petCard.className = 'pet-card';
  petCard.dataset.petId = pet.id;
  petCard.innerHTML = `
    <div class="pet-image" style="background-color: ${primaryColor};"></div>
    <div class="pet-info">
      <h3>${name}</h3>
      <p>${randomSpecies} - Level ${level}</p>
      <div class="pet-stats">
        <span>❤️ ${health}</span>
        <span>⚔️ ${strength}</span>
        <span>🛡️ ${defense}</span>
      </div>
    </div>
  `;

  // Add click event to view pet details
  petCard.addEventListener('click', function() {
    alert(`Viewing details for ${name}`);
  });

  // Add the pet card to the grid
  const petGrid = document.getElementById('pet-grid');
  const addButton = document.getElementById('add-pet-button');
  if (petGrid && addButton) {
    petGrid.insertBefore(petCard, addButton);
  }

  // Update profile stats
  updateProfilePage();

  // Show success message
  alert(`${name} has been added to your collection!`);
}

// Generate a pet name
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

// Treasure Hunt Game
function playTreasureHunt() {
  // Create game container
  const gameContainer = document.createElement('div');
  gameContainer.className = 'game-container';
  gameContainer.id = 'treasure-hunt-game';

  // Create game content
  gameContainer.innerHTML = `
    <div class="game-header">
      <h2>Treasure Hunt</h2>
      <p>Find the hidden treasure by clicking on the grid!</p>
      <div class="game-stats">
        <span>Attempts: <span id="attempts">0</span></span>
        <span>Score: <span id="score">0</span></span>
      </div>
    </div>
    <div class="game-grid" id="treasure-grid"></div>
    <button id="end-game" class="btn btn-danger">End Game</button>
  `;

  // Add to page
  const gamesPage = document.getElementById('games-page');
  const gamesContent = gamesPage.querySelector('.games-content');

  // Save the original games list
  if (!gamesContent.dataset.originalContent) {
    gamesContent.dataset.originalContent = gamesContent.innerHTML;
  }

  // Clear and add game container
  gamesContent.innerHTML = '';
  gamesContent.appendChild(gameContainer);

  // Create grid
  const grid = document.getElementById('treasure-grid');
  const gridSize = 5;
  const treasurePosition = {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize)
  };

  let attempts = 0;
  let score = 0;
  const attemptsElement = document.getElementById('attempts');
  const scoreElement = document.getElementById('score');

  // Create grid cells
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.x = x;
      cell.dataset.y = y;

      cell.addEventListener('click', function() {
        // Increment attempts
        attempts++;
        attemptsElement.textContent = attempts;

        // Check if treasure found
        if (parseInt(this.dataset.x) === treasurePosition.x &&
            parseInt(this.dataset.y) === treasurePosition.y) {
          this.classList.add('treasure');
          score += 100 - (attempts * 5);
          if (score < 0) score = 0;
          scoreElement.textContent = score;

          setTimeout(() => {
            alert(`You found the treasure! Score: ${score}`);
            // Add currency based on score
            alert(`You earned ${score} currency!`);

            // Show game completion UI with play again option
            showGameCompletion('treasure-hunt', score);
          }, 500);
        } else {
          // Calculate distance to treasure
          const distance = Math.sqrt(
            Math.pow(parseInt(this.dataset.x) - treasurePosition.x, 2) +
            Math.pow(parseInt(this.dataset.y) - treasurePosition.y, 2)
          );

          // Give hint based on distance
          if (distance < 1.5) {
            this.classList.add('very-hot');
            this.textContent = '🔥';
          } else if (distance < 2.5) {
            this.classList.add('hot');
            this.textContent = '🔥';
          } else if (distance < 3.5) {
            this.classList.add('warm');
            this.textContent = '🔥';
          } else {
            this.classList.add('cold');
            this.textContent = '❄️';
          }

          // Disable clicked cell
          this.style.pointerEvents = 'none';
        }
      });

      grid.appendChild(cell);
    }
  }

  // End game button
  document.getElementById('end-game').addEventListener('click', function() {
    restoreGamesList();
  });

  // Add game styles
  const style = document.createElement('style');
  style.textContent = `
    .game-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .game-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .game-stats {
      display: flex;
      justify-content: space-around;
      margin: 15px 0;
      font-weight: bold;
    }

    .game-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }

    .grid-cell {
      width: 60px;
      height: 60px;
      background-color: #f8f9fa;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      transition: background-color 0.3s;
    }

    .grid-cell:hover {
      background-color: #e9ecef;
    }

    .grid-cell.treasure {
      background-color: #ffd700;
      animation: pulse 1s infinite;
    }

    .grid-cell.very-hot {
      background-color: #ff4d4d;
    }

    .grid-cell.hot {
      background-color: #ff8c66;
    }

    .grid-cell.warm {
      background-color: #ffcc80;
    }

    .grid-cell.cold {
      background-color: #80d8ff;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `;

  document.head.appendChild(style);
}

// Pet Race Game
function playPetRace() {
  // Create game container
  const gameContainer = document.createElement('div');
  gameContainer.className = 'game-container';
  gameContainer.id = 'pet-race-game';

  // Create game content
  gameContainer.innerHTML = `
    <div class="game-header">
      <h2>Pet Race</h2>
      <p>Press the button repeatedly to make your pet run faster!</p>
      <div class="game-stats">
        <span>Time: <span id="race-time">30</span>s</span>
        <span>Distance: <span id="race-distance">0</span>m</span>
      </div>
    </div>
    <div class="race-track">
      <div class="pet-racer" id="player-pet"></div>
      <div class="finish-line"></div>
    </div>
    <button id="race-button" class="btn btn-primary">Run!</button>
    <button id="end-race" class="btn btn-danger">End Game</button>
  `;

  // Add to page
  const gamesPage = document.getElementById('games-page');
  const gamesContent = gamesPage.querySelector('.games-content');

  // Save the original games list
  if (!gamesContent.dataset.originalContent) {
    gamesContent.dataset.originalContent = gamesContent.innerHTML;
  }

  // Clear and add game container
  gamesContent.innerHTML = '';
  gamesContent.appendChild(gameContainer);

  // Game variables
  let distance = 0;
  let timeLeft = 30;
  let gameInterval;
  let isRacing = false;

  const distanceElement = document.getElementById('race-distance');
  const timeElement = document.getElementById('race-time');
  const playerPet = document.getElementById('player-pet');
  const raceButton = document.getElementById('race-button');

  // Start the race
  raceButton.addEventListener('click', function() {
    if (!isRacing) {
      // Start the timer
      isRacing = true;
      gameInterval = setInterval(() => {
        timeLeft--;
        timeElement.textContent = timeLeft;

        if (timeLeft <= 0) {
          endRace();
        }
      }, 1000);
    }

    // Move the pet
    distance += 5;
    distanceElement.textContent = distance;
    playerPet.style.left = `${Math.min(distance / 2, 80)}%`;

    // Check if finished
    if (distance >= 200) {
      clearInterval(gameInterval);
      const finalTime = 30 - timeLeft;
      const score = Math.floor(1000 / finalTime);

      setTimeout(() => {
        alert(`Race finished! Time: ${finalTime}s, Score: ${score}`);
        alert(`You earned ${score} currency!`);
        showGameCompletion('pet-race', score);
      }, 500);
    }
  });

  // End race function
  function endRace() {
    clearInterval(gameInterval);
    isRacing = false;
    alert(`Time's up! Distance: ${distance}m`);
    const score = Math.floor(distance * 0.5);
    showGameCompletion('pet-race', score);
  }

  // End game button
  document.getElementById('end-race').addEventListener('click', function() {
    clearInterval(gameInterval);
    restoreGamesList();
  });

  // Add game styles
  const style = document.createElement('style');
  style.textContent = `
    .race-track {
      height: 100px;
      background-color: #f8f9fa;
      border-radius: 4px;
      margin: 20px 0;
      position: relative;
      overflow: hidden;
    }

    .pet-racer {
      width: 50px;
      height: 50px;
      background-color: #ff5733;
      border-radius: 50%;
      position: absolute;
      left: 0;
      top: 25px;
      transition: left 0.3s;
    }

    .finish-line {
      width: 5px;
      height: 100%;
      background-color: #000;
      position: absolute;
      right: 10%;
      top: 0;
    }

    #race-button {
      display: block;
      margin: 0 auto 15px;
      padding: 10px 30px;
      font-size: 18px;
    }
  `;

  document.head.appendChild(style);
}

// Breeding function
function breedPets(parent1, parent2) {
  // Check if user is logged in
  if (!userStore.isLoggedIn()) {
    alert('Please log in to breed pets');
    showPage('login');
    return;
  }

  // Get parent IDs
  const parent1Id = parent1.dataset.petId;
  const parent2Id = parent2.dataset.petId;

  // Get parent pets from user store
  const pets = userStore.getPets();
  const parent1Pet = pets.find(pet => pet.id === parent1Id);
  const parent2Pet = pets.find(pet => pet.id === parent2Id);

  if (!parent1Pet || !parent2Pet) {
    alert('Error: Could not find parent pets');
    return;
  }

  // Get parent data
  const parent1Name = parent1Pet.name;
  const parent2Name = parent2Pet.name;
  const parent1Color = parent1Pet.primaryColor;
  const parent2Color = parent2Pet.primaryColor;

  // Generate offspring data
  const species = parent1Pet.species;
  const randomGender = Math.random() > 0.5 ? 'male' : 'female';

  // Blend colors
  const blendColors = (color1, color2) => {
    // Simple color blending
    const randomFactor = Math.random();
    return randomFactor > 0.7 ? color1 : (randomFactor > 0.4 ? color2 : mixColors(color1, color2));
  };

  const mixColors = (color1, color2) => {
    // For simplicity, just return one of the colors
    // In a real app, this would do proper color mixing
    return Math.random() > 0.5 ? color1 : color2;
  };

  const offspringColor = blendColors(parent1Color, parent2Color);

  // Generate stats
  const health = 50 + Math.floor(Math.random() * 20);
  const strength = 10 + Math.floor(Math.random() * 10);
  const defense = 10 + Math.floor(Math.random() * 10);
  const speed = 10 + Math.floor(Math.random() * 10);

  // Generate name
  const name = generateOffspringName(parent1Name, parent2Name);

  // Show breeding animation
  const breedingPage = document.getElementById('breeding-page');
  const breedingContent = breedingPage.querySelector('.breeding-content');

  // Create animation container
  const animationContainer = document.createElement('div');
  animationContainer.className = 'breeding-animation';
  animationContainer.innerHTML = `
    <div class="animation-content">
      <div class="parent parent1" style="background-color: ${parent1Color};"></div>
      <div class="heart">❤️</div>
      <div class="parent parent2" style="background-color: ${parent2Color};"></div>
      <div class="arrow">→</div>
      <div class="offspring" style="background-color: ${offspringColor};"></div>
    </div>
    <p>Breeding ${parent1Name} and ${parent2Name}...</p>
  `;

  breedingContent.innerHTML = '';
  breedingContent.appendChild(animationContainer);

  // Create pet data
  const pet = {
    id: Date.now().toString(),
    name,
    species,
    gender: randomGender,
    level: 1,
    primaryColor: offspringColor,
    secondaryColor: blendColors(parent1Color, parent2Color),
    tertiaryColor: blendColors(parent1Color, parent2Color),
    health,
    strength,
    defense,
    speed,
    parents: [parent1Name, parent2Name],
    createdAt: new Date().toISOString()
  };

  // After animation, show result
  setTimeout(() => {
    // Add to user's pets
    const result = userStore.addPet(pet);
    if (!result.success) {
      alert(`Error adding pet: ${result.message}`);
      return;
    }

    alert(`Breeding successful! ${name} has been born!`);

    // Go to pets page
    showPage('pets');
  }, 2000);

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    .breeding-animation {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }

    .animation-content {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 30px 0;
    }

    .parent, .offspring {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin: 0 10px;
    }

    .heart, .arrow {
      font-size: 24px;
      margin: 0 10px;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
  `;

  document.head.appendChild(style);
}

// Generate offspring name
function generateOffspringName(parent1Name, parent2Name) {
  // Option 1: Combine parts of parent names
  if (Math.random() > 0.7) {
    const part1 = parent1Name.substring(0, Math.floor(parent1Name.length / 2));
    const part2 = parent2Name.substring(Math.floor(parent2Name.length / 2));
    return part1 + part2;
  }

  // Option 2: Use a prefix with one of the parent names
  if (Math.random() > 0.5) {
    const prefixes = ['Baby', 'Little', 'Young', 'Mini'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const parentName = Math.random() > 0.5 ? parent1Name : parent2Name;
    return `${prefix} ${parentName}`;
  }

  // Option 3: Generate a new name
  return generatePetName();
}

// Puzzle Game
// Function to restore games list
function restoreGamesList() {
  const gamesPage = document.getElementById('games-page');
  const gamesContent = gamesPage.querySelector('.games-content');

  if (gamesContent.dataset.originalContent) {
    gamesContent.innerHTML = gamesContent.dataset.originalContent;

    // Re-attach event listeners to game cards
    const playButtons = gamesContent.querySelectorAll('.play-button');
    playButtons.forEach(button => {
      button.addEventListener('click', function() {
        const gameCard = this.closest('.game-card');
        const gameId = gameCard.id;

        // Launch the appropriate game
        switch(gameId) {
          case 'treasure-hunt':
            playTreasureHunt();
            break;
          case 'pet-race':
            playPetRace();
            break;
          case 'puzzle-solve':
            playPuzzleGame();
            break;
          default:
            alert(`Playing ${gameId}! This feature is coming soon.`);
        }
      });
    });
  }
}

// Function to show game completion UI
function showGameCompletion(gameId, score) {
  const gamesPage = document.getElementById('games-page');
  const gamesContent = gamesPage.querySelector('.games-content');

  // Create completion UI
  const completionContainer = document.createElement('div');
  completionContainer.className = 'game-completion';

  // Game-specific messages
  let gameTitle = '';
  let gameDescription = '';

  switch(gameId) {
    case 'treasure-hunt':
      gameTitle = 'Treasure Hunt';
      gameDescription = 'You found the hidden treasure!';
      break;
    case 'pet-race':
      gameTitle = 'Pet Race';
      gameDescription = 'Your pet completed the race!';
      break;
    case 'puzzle-solve':
      gameTitle = 'Pet Puzzle';
      gameDescription = 'You solved the puzzle!';
      break;
  }

  completionContainer.innerHTML = `
    <div class="completion-content">
      <h2>${gameTitle} Completed!</h2>
      <p>${gameDescription}</p>
      <div class="score-display">
        <h3>Score: ${score}</h3>
        <p>You earned ${score} currency!</p>
      </div>
      <div class="completion-buttons">
        <button id="play-again" class="btn btn-primary">Play Again</button>
        <button id="return-to-games" class="btn btn-secondary">Return to Games</button>
      </div>
    </div>
  `;

  // Clear and add completion container
  gamesContent.innerHTML = '';
  gamesContent.appendChild(completionContainer);

  // Add event listeners
  document.getElementById('play-again').addEventListener('click', function() {
    // Play the same game again
    switch(gameId) {
      case 'treasure-hunt':
        playTreasureHunt();
        break;
      case 'pet-race':
        playPetRace();
        break;
      case 'puzzle-solve':
        playPuzzleGame();
        break;
    }
  });

  document.getElementById('return-to-games').addEventListener('click', function() {
    restoreGamesList();
  });

  // Add completion styles
  const style = document.createElement('style');
  style.textContent = `
    .game-completion {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }

    .completion-content {
      padding: 20px;
    }

    .score-display {
      margin: 20px 0;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .score-display h3 {
      color: #007bff;
      font-size: 24px;
      margin-bottom: 10px;
    }

    .completion-buttons {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 20px;
    }

    .btn-secondary {
      color: #fff;
      background-color: #6c757d;
      border-color: #6c757d;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
      border-color: #545b62;
    }
  `;

  document.head.appendChild(style);
}

function playPuzzleGame() {
  // Create game container
  const gameContainer = document.createElement('div');
  gameContainer.className = 'game-container';
  gameContainer.id = 'puzzle-game';

  // Create game content
  gameContainer.innerHTML = `
    <div class="game-header">
      <h2>Pet Puzzle</h2>
      <p>Solve the puzzle by arranging the tiles in order!</p>
      <div class="game-stats">
        <span>Moves: <span id="puzzle-moves">0</span></span>
        <span>Time: <span id="puzzle-time">0</span>s</span>
      </div>
    </div>
    <div class="puzzle-board" id="puzzle-board"></div>
    <button id="shuffle-puzzle" class="btn btn-primary">Shuffle</button>
    <button id="end-puzzle" class="btn btn-danger">End Game</button>
  `;

  // Add to page
  const gamesPage = document.getElementById('games-page');
  const gamesContent = gamesPage.querySelector('.games-content');

  // Save the original games list
  if (!gamesContent.dataset.originalContent) {
    gamesContent.dataset.originalContent = gamesContent.innerHTML;
  }

  // Clear and add game container
  gamesContent.innerHTML = '';
  gamesContent.appendChild(gameContainer);

  // Game variables
  const boardSize = 3;
  let moves = 0;
  let time = 0;
  let gameInterval;
  let tiles = [];

  const movesElement = document.getElementById('puzzle-moves');
  const timeElement = document.getElementById('puzzle-time');
  const puzzleBoard = document.getElementById('puzzle-board');

  // Create puzzle tiles
  for (let i = 0; i < boardSize * boardSize; i++) {
    const tile = document.createElement('div');
    tile.className = 'puzzle-tile';
    tile.dataset.index = i;

    if (i < boardSize * boardSize - 1) {
      tile.textContent = i + 1;
      tile.addEventListener('click', () => moveTile(tile));
    } else {
      tile.className += ' empty';
      tile.textContent = '';
    }

    puzzleBoard.appendChild(tile);
    tiles.push(tile);
  }

  // Start the game
  gameInterval = setInterval(() => {
    time++;
    timeElement.textContent = time;
  }, 1000);

  // Shuffle the puzzle
  document.getElementById('shuffle-puzzle').addEventListener('click', shufflePuzzle);
  shufflePuzzle(); // Initial shuffle

  // Move tile function
  function moveTile(tile) {
    const emptyTile = document.querySelector('.puzzle-tile.empty');
    const tileIndex = parseInt(tile.dataset.index);
    const emptyIndex = parseInt(emptyTile.dataset.index);

    // Check if the tile is adjacent to the empty tile
    if (isAdjacent(tileIndex, emptyIndex)) {
      // Swap positions
      [tile.dataset.index, emptyTile.dataset.index] = [emptyTile.dataset.index, tile.dataset.index];

      // Update visual positions
      updateTilePositions();

      // Increment moves
      moves++;
      movesElement.textContent = moves;

      // Check if puzzle is solved
      if (isPuzzleSolved()) {
        clearInterval(gameInterval);
        const score = Math.floor(1000 / (moves + time / 10));

        setTimeout(() => {
          alert(`Puzzle solved! Moves: ${moves}, Time: ${time}s, Score: ${score}`);
          alert(`You earned ${score} currency!`);
          showGameCompletion('puzzle-solve', score);
        }, 500);
      }
    }
  }

  // Check if two tiles are adjacent
  function isAdjacent(index1, index2) {
    const row1 = Math.floor(index1 / boardSize);
    const col1 = index1 % boardSize;
    const row2 = Math.floor(index2 / boardSize);
    const col2 = index2 % boardSize;

    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) ||
      (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
  }

  // Update tile positions
  function updateTilePositions() {
    tiles.forEach(tile => {
      const index = parseInt(tile.dataset.index);
      const row = Math.floor(index / boardSize);
      const col = index % boardSize;

      tile.style.top = `${row * 33.33}%`;
      tile.style.left = `${col * 33.33}%`;
    });
  }

  // Check if puzzle is solved
  function isPuzzleSolved() {
    for (let i = 0; i < tiles.length; i++) {
      if (parseInt(tiles[i].dataset.index) !== i) {
        return false;
      }
    }
    return true;
  }

  // Shuffle the puzzle
  function shufflePuzzle() {
    // Reset moves
    moves = 0;
    movesElement.textContent = moves;

    // Shuffle tiles
    const indices = Array.from({length: boardSize * boardSize}, (_, i) => i);

    // Make sure the puzzle is solvable
    do {
      indices.sort(() => Math.random() - 0.5);
    } while (!isSolvable(indices));

    // Update tile indices
    tiles.forEach((tile, i) => {
      tile.dataset.index = indices[i];
    });

    updateTilePositions();
  }

  // Check if puzzle is solvable
  function isSolvable(indices) {
    // Count inversions
    let inversions = 0;
    const values = indices.map(i => i === boardSize * boardSize - 1 ? 0 : i + 1);

    for (let i = 0; i < values.length; i++) {
      if (values[i] === 0) continue;

      for (let j = i + 1; j < values.length; j++) {
        if (values[j] === 0) continue;
        if (values[i] > values[j]) inversions++;
      }
    }

    // For 3x3 puzzle, if inversions count is even, the puzzle is solvable
    return inversions % 2 === 0;
  }

  // End game button
  document.getElementById('end-puzzle').addEventListener('click', function() {
    clearInterval(gameInterval);
    restoreGamesList();
  });

  // Add game styles
  const style = document.createElement('style');
  style.textContent = `
    .puzzle-board {
      width: 300px;
      height: 300px;
      margin: 20px auto;
      position: relative;
      background-color: #f8f9fa;
      border-radius: 4px;
    }

    .puzzle-tile {
      width: 33.33%;
      height: 33.33%;
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      background-color: #007bff;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .puzzle-tile.empty {
      background-color: transparent;
      cursor: default;
    }

    #shuffle-puzzle, #end-puzzle {
      display: inline-block;
      margin: 10px;
    }
  `;

  document.head.appendChild(style);
}
