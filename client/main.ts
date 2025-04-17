import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { PetsCollection } from '/imports/api/pets';
import { AuthComponent } from '/imports/ui/components/auth/auth.component';
import { UserProfileComponent } from '/imports/ui/components/user-profile/user-profile.component';

// Simple router to handle page navigation
class Router {
  private currentPage: string = 'home';
  private pages: { [key: string]: HTMLElement } = {};
  private container: HTMLElement | null = null;
  private isAuthenticated: boolean = false;
  private authComponent: AuthComponent = new AuthComponent();
  private userProfileComponent: UserProfileComponent = new UserProfileComponent();

  init() {
    this.container = document.getElementById('app-container');

    // Set up authentication tracking
    this.setupAuthTracking();

    // Create pages
    this.createPages();

    // Show initial page based on auth state
    this.updateAuthState();

    // Add event listeners to navigation buttons
    this.setupEventListeners();
  }

  private setupAuthTracking() {
    // Track authentication state changes
    Tracker.autorun(() => {
      this.isAuthenticated = !!Meteor.userId();
      this.updateAuthState();
    });

    // Subscribe to user data
    Meteor.subscribe('userData');

    // Subscribe to pets collection
    Meteor.subscribe('pets');

    // Listen for authentication events
    document.addEventListener('user-authenticated', () => {
      // Add starter pets for new users
      Meteor.call('user.addStarterPets', (error: any) => {
        // Ignore 'already-has-pets' error
        if (error && error.error !== 'already-has-pets') {
          console.error('Error adding starter pets:', error);
        }
      });

      this.showPage('home');
    });

    document.addEventListener('user-logged-out', () => {
      this.showPage('auth');
    });
  }

  private updateAuthState() {
    if (!this.container) return;

    if (this.isAuthenticated) {
      // User is logged in, show the app
      this.container.classList.add('authenticated');

      // Update user profile stats
      if (this.userProfileComponent) {
        const pets = PetsCollection.find({ userId: Meteor.userId() }).fetch();
        const petCount = pets.length;
        const highestLevel = pets.reduce((max, pet) => Math.max(max, pet.level), 0);
        this.userProfileComponent.updateStats(petCount, highestLevel);
      }

      // Show the last page or home
      if (this.currentPage === 'auth') {
        this.showPage('home');
      }
    } else {
      // User is not logged in, show auth page
      this.container.classList.remove('authenticated');
      this.showPage('auth');
    }
  }

  private createPages() {
    // Home page is already in the HTML
    this.pages['home'] = document.getElementById('home-page') as HTMLElement;

    // Create auth page
    this.pages['auth'] = this.createAuthPage();

    // Create user profile page
    this.pages['profile'] = this.createProfilePage();

    // Create pets page
    this.pages['pets'] = this.createPetsPage();

    // Create breeding page
    this.pages['breeding'] = this.createBreedingPage();

    // Create care page
    this.pages['care'] = this.createCarePage();

    // Create games page
    this.pages['games'] = this.createGamesPage();

    // Hide all pages initially
    Object.values(this.pages).forEach(page => {
      if (page) page.style.display = 'none';
    });
  }

  private createAuthPage(): HTMLElement {
    const page = document.createElement('div');
    page.id = 'auth-page';
    page.className = 'page';

    // The auth component will render its content here
    this.container?.appendChild(page);

    // Initialize the auth component
    setTimeout(() => {
      this.authComponent.init(page);
    }, 0);

    return page;
  }

  private createProfilePage(): HTMLElement {
    const page = document.createElement('div');
    page.id = 'profile-page';
    page.className = 'page';

    // The profile component will render its content here
    this.container?.appendChild(page);

    // Initialize the profile component
    setTimeout(() => {
      this.userProfileComponent.init(page);
    }, 0);

    return page;
  }

  private setupEventListeners() {
    // Set up navigation for all elements with data-nav attribute
    this.setupNavigationListeners();

    // Back buttons
    document.querySelectorAll('.back-button').forEach(button => {
      button.addEventListener('click', () => {
        this.showPage('home');
      });
    });

    // Add profile button to header
    const header = document.querySelector('header');
    if (header && !header.querySelector('#profile-button')) {
      const profileButton = document.createElement('button');
      profileButton.id = 'profile-button';
      profileButton.className = 'profile-button';
      profileButton.textContent = 'Profile';
      profileButton.setAttribute('data-nav', 'profile');
      header.appendChild(profileButton);

      profileButton.addEventListener('click', () => {
        this.showPage('profile');
      });
    }
  }

  private setupNavigationListeners() {
    // Find all elements with data-nav attribute (buttons and links)
    document.querySelectorAll('[data-nav]').forEach(element => {
      // Remove any existing click listeners
      const clone = element.cloneNode(true);
      if (element.parentNode) {
        element.parentNode.replaceChild(clone, element);
      }

      // Add new click listener
      clone.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        const target = (e.currentTarget as HTMLElement).getAttribute('data-nav');
        if (target) this.showPage(target);
      });
    });
  }

  showPage(pageName: string) {
    // Hide current page
    if (this.pages[this.currentPage]) {
      this.pages[this.currentPage].style.display = 'none';
    }

    // Show new page
    if (this.pages[pageName]) {
      this.pages[pageName].style.display = 'block';
      this.currentPage = pageName;

      // Set up navigation listeners for any new elements
      setTimeout(() => {
        this.setupNavigationListeners();
      }, 0);
    }
  }

  private createPetsPage(): HTMLElement {
    const page = document.createElement('div');
    page.id = 'pets-page';
    page.className = 'page';

    page.innerHTML = `
      <h2>My Pets Collection</h2>
      <p>Here you can view and manage your pet collection.</p>

      <div class="pet-grid" id="pet-grid">
        <!-- Pet cards will be rendered here dynamically -->

        <div class="pet-card add-pet" id="add-pet-button">
          <div class="add-icon">+</div>
          <p>Get a new pet</p>
        </div>
      </div>

      <button class="back-button">Back to Home</button>
    `;

    this.container?.appendChild(page);

    // Set up event listeners and data binding
    setTimeout(() => {
      this.setupPetsPage(page);
    }, 0);

    return page;
  }

  private setupPetsPage(page: HTMLElement) {
    // Add pet button
    const addPetButton = page.querySelector('#add-pet-button');
    if (addPetButton) {
      addPetButton.addEventListener('click', () => {
        this.createRandomPet();
      });
    }

    // Set up reactive data binding for pets
    Tracker.autorun(() => {
      if (!Meteor.userId()) return;

      // Get pets from the collection
      const pets = PetsCollection.find({}, { sort: { createdAt: -1 } }).fetch();

      // Render pet cards
      this.renderPetCards(page, pets);
    });
  }

  private renderPetCards(page: HTMLElement, pets: any[]) {
    const petGrid = page.querySelector('#pet-grid');
    if (!petGrid) return;

    // Remove existing pet cards (except the add button)
    petGrid.querySelectorAll('.pet-card:not(.add-pet)').forEach(card => {
      card.remove();
    });

    // Add pet cards
    pets.forEach(pet => {
      const petCard = document.createElement('div');
      petCard.className = 'pet-card';
      petCard.setAttribute('data-pet-id', pet._id);

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
      petCard.addEventListener('click', () => {
        // In a full implementation, this would show pet details
        alert(`Viewing details for ${pet.name}`);
      });

      // Insert before the add button
      const addButton = petGrid.querySelector('.add-pet');
      if (addButton) {
        petGrid.insertBefore(petCard, addButton);
      } else {
        petGrid.appendChild(petCard);
      }
    });
  }

  private createRandomPet() {
    if (!Meteor.userId()) return;

    const species = ['dragon', 'fae', 'guardian', 'mirror', 'tundra'];
    const randomSpecies = species[Math.floor(Math.random() * species.length)];
    const randomGender = Math.random() > 0.5 ? 'male' : 'female';

    // Generate random colors
    const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

    // Create pet data
    const petData = {
      name: this.generatePetName(),
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
    Meteor.call('pets.create', petData, (error: any, result: any) => {
      if (error) {
        console.error('Error creating pet:', error);
        alert(`Failed to create pet: ${error.message}`);
      } else {
        console.log('Pet created successfully:', result);
      }
    });
  }

  private generatePetName(): string {
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

  private createBreedingPage(): HTMLElement {
    const page = document.createElement('div');
    page.id = 'breeding-page';
    page.className = 'page';

    page.innerHTML = `
      <h2>Pet Breeding</h2>
      <p>Select two compatible pets to breed and create offspring with combined traits.</p>

      <div class="breeding-selection">
        <div class="parent-selection">
          <h3>Select First Parent</h3>
          <div class="pet-grid small">
            <div class="pet-card" data-pet="ember">
              <div class="pet-image" style="background-color: #FF5733;"></div>
              <div class="pet-info">
                <h4>Ember</h4>
                <p>Dragon - Female</p>
              </div>
            </div>

            <div class="pet-card" data-pet="frost">
              <div class="pet-image" style="background-color: #AED6F1;"></div>
              <div class="pet-info">
                <h4>Frost</h4>
                <p>Tundra - Male</p>
              </div>
            </div>
          </div>
        </div>

        <div class="parent-selection">
          <h3>Select Second Parent</h3>
          <div class="pet-grid small">
            <div class="pet-card" data-pet="whisper">
              <div class="pet-image" style="background-color: #D7BDE2;"></div>
              <div class="pet-info">
                <h4>Whisper</h4>
                <p>Fae - Female</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="breeding-controls">
        <button id="breed-button">Breed Selected Pets</button>
        <div id="breeding-result" style="display: none;">
          <h3>Breeding Successful!</h3>
          <div class="pet-card">
            <div class="pet-image" style="background-color: #C39BD3;"></div>
            <div class="pet-info">
              <h4>Baby Dragon</h4>
              <p>Dragon - Level 1</p>
            </div>
          </div>
        </div>
      </div>

      <button class="back-button">Back to Home</button>
    `;

    this.container?.appendChild(page);

    // Add event listeners for breeding page
    setTimeout(() => {
      const breedButton = document.getElementById('breed-button');
      const breedingResult = document.getElementById('breeding-result');

      breedButton?.addEventListener('click', () => {
        if (breedingResult) breedingResult.style.display = 'block';
      });

      // Pet selection
      page.querySelectorAll('.pet-card[data-pet]').forEach(card => {
        card.addEventListener('click', (e) => {
          const clickedCard = e.currentTarget as HTMLElement;
          const parentSection = clickedCard.closest('.parent-selection');

          // Remove selected class from all cards in this section
          parentSection?.querySelectorAll('.pet-card').forEach(c => {
            c.classList.remove('selected');
          });

          // Add selected class to clicked card
          clickedCard.classList.add('selected');
        });
      });
    }, 100);

    return page;
  }

  private createCarePage(): HTMLElement {
    const page = document.createElement('div');
    page.id = 'care-page';
    page.className = 'page';

    page.innerHTML = `
      <h2>Pet Care Center</h2>
      <p>Take care of your pets to keep them happy and healthy.</p>

      <div class="care-tabs">
        <button class="tab-button active" data-tab="feeding">Feeding</button>
        <button class="tab-button" data-tab="grooming">Grooming</button>
        <button class="tab-button" data-tab="healing">Healing</button>
        <button class="tab-button" data-tab="training">Training</button>
      </div>

      <div class="tab-content">
        <div id="feeding-tab" class="tab-panel active">
          <h3>Feed Your Pets</h3>
          <p>Select a pet and food item to feed them.</p>

          <div class="food-items">
            <div class="food-item">
              <div class="food-icon" style="background-color: #8BC34A;"></div>
              <div class="food-info">
                <h4>Basic Food</h4>
                <p>Standard pet food that provides basic nutrition.</p>
              </div>
            </div>

            <div class="food-item">
              <div class="food-icon" style="background-color: #4CAF50;"></div>
              <div class="food-info">
                <h4>Premium Food</h4>
                <p>High-quality food with extra nutrients.</p>
              </div>
            </div>
          </div>

          <div class="pet-selection">
            <h4>Select a Pet to Feed</h4>
            <div class="pet-grid small">
              <div class="pet-card">
                <div class="pet-image" style="background-color: #FF5733;"></div>
                <div class="pet-info">
                  <h4>Ember</h4>
                  <p>Dragon</p>
                </div>
              </div>
            </div>
          </div>

          <button id="feed-button">Feed Pet</button>
          <div id="feeding-result" style="display: none;">
            <p>Ember enjoyed the food! Health +5, Happiness +3</p>
          </div>
        </div>
      </div>

      <button class="back-button">Back to Home</button>
    `;

    this.container?.appendChild(page);

    // Add event listeners for care page
    setTimeout(() => {
      const feedButton = document.getElementById('feed-button');
      const feedingResult = document.getElementById('feeding-result');

      feedButton?.addEventListener('click', () => {
        if (feedingResult) feedingResult.style.display = 'block';
      });

      // Tab switching
      page.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
          const clickedButton = e.currentTarget as HTMLElement;
          const tabName = clickedButton.getAttribute('data-tab');

          // Update active tab button
          page.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
          });
          clickedButton.classList.add('active');

          // For now, just show the feeding tab
          // In a full implementation, you would show the corresponding tab content
        });
      });
    }, 100);

    return page;
  }

  private createGamesPage(): HTMLElement {
    const page = document.createElement('div');
    page.id = 'games-page';
    page.className = 'page';

    page.innerHTML = `
      <h2>Mini Games</h2>
      <p>Play games with your pets to earn currency and items!</p>

      <div class="games-grid">
        <div class="game-card" id="treasure-hunt">
          <div class="game-image" style="background-color: #FFD700"></div>
          <div class="game-info">
            <h3>Treasure Hunt</h3>
            <p>Search for hidden treasures with your pet.</p>
            <button class="play-button">Play</button>
          </div>
        </div>

        <div class="game-card" id="pet-race">
          <div class="game-image" style="background-color: #32CD32"></div>
          <div class="game-info">
            <h3>Pet Race</h3>
            <p>Race your pet against others to win prizes.</p>
            <button class="play-button">Play</button>
          </div>
        </div>

        <div class="game-card" id="puzzle-solve">
          <div class="game-image" style="background-color: #9370DB"></div>
          <div class="game-info">
            <h3>Puzzle Solve</h3>
            <p>Solve puzzles with your pet to earn rewards.</p>
            <button class="play-button">Play</button>
          </div>
        </div>
      </div>

      <div id="game-play-area" style="display: none;">
        <h3 id="game-title">Treasure Hunt</h3>
        <p id="game-description">Click on tiles to reveal hidden treasures!</p>

        <div id="treasure-hunt-game" class="game-content">
          <div id="treasure-grid" class="treasure-grid">
            ${Array(9).fill(0).map(() => `<div class="treasure-cell"></div>`).join('')}
          </div>
        </div>

        <div id="pet-race-game" class="game-content" style="display: none;">
          <div class="race-track">
            <div class="pet-racer" style="left: 0%"></div>
            <div class="finish-line"></div>
          </div>
          <button id="race-button" class="game-action-button">Run!</button>
        </div>

        <div id="puzzle-solve-game" class="game-content" style="display: none;">
          <div class="puzzle-grid">
            ${Array(9).fill(0).map((_, i) =>
              `<div class="puzzle-piece" style="background-color: ${['#FF6B6B', '#4ECDC4', '#FFD166', '#6B5B95', '#88D8B0'][i % 5]}; transform: rotate(${Math.floor(Math.random() * 4) * 90}deg);">
                <div class="puzzle-arrow"></div>
              </div>`
            ).join('')}
          </div>
          <button id="puzzle-button" class="game-action-button">Check Solution</button>
        </div>

        <div id="game-result" style="display: none;">
          <h4>Game Complete!</h4>
          <p>You earned 10 coins and found a Rare Gem!</p>
          <button id="play-again-button" class="game-action-button">Play Again</button>
        </div>

        <div class="game-controls">
          <button id="back-to-games-button">Back to Games</button>
        </div>
      </div>

      <button class="back-button">Back to Home</button>
    `;

    this.container?.appendChild(page);

    // Add event listeners for games page
    setTimeout(() => {
      // Play buttons
      page.querySelectorAll('.play-button').forEach(button => {
        button.addEventListener('click', (e) => {
          const gameCard = (e.currentTarget as HTMLElement).closest('.game-card');
          const gameId = gameCard?.id || 'treasure-hunt';
          const gameTitle = gameCard?.querySelector('h3')?.textContent || 'Game';

          // Hide game cards, show game area
          const gamesGrid = page.querySelector('.games-grid');
          const gamePlayArea = page.querySelector('#game-play-area');

          if (gamesGrid) gamesGrid.style.display = 'none';
          if (gamePlayArea) {
            gamePlayArea.style.display = 'block';
            const titleElement = gamePlayArea.querySelector('#game-title');
            if (titleElement) titleElement.textContent = gameTitle;

            // Hide all game contents first
            page.querySelectorAll('.game-content').forEach(content => {
              (content as HTMLElement).style.display = 'none';
            });

            // Show the selected game content
            const gameContent = page.querySelector(`#${gameId}-game`);
            if (gameContent) (gameContent as HTMLElement).style.display = 'block';

            // Set game description
            const descriptionElement = gamePlayArea.querySelector('#game-description');
            if (descriptionElement) {
              switch (gameId) {
                case 'treasure-hunt':
                  descriptionElement.textContent = 'Click on tiles to reveal hidden treasures!';
                  break;
                case 'pet-race':
                  descriptionElement.textContent = 'Click the Run button to advance your pet in the race!';
                  break;
                case 'puzzle-solve':
                  descriptionElement.textContent = 'Click on puzzle pieces to rotate them. Arrange them correctly to win!';
                  break;
              }
            }

            // Reset game state
            this.resetGame(gameId, page);
          }
        });
      });

      // Back to games button
      const backToGamesButton = page.querySelector('#back-to-games-button');
      backToGamesButton?.addEventListener('click', () => {
        const gamesGrid = page.querySelector('.games-grid');
        const gamePlayArea = page.querySelector('#game-play-area');
        const gameResult = page.querySelector('#game-result');

        if (gamesGrid) gamesGrid.style.display = 'grid';
        if (gamePlayArea) gamePlayArea.style.display = 'none';
        if (gameResult) gameResult.style.display = 'none';
      });

      // Play again button
      const playAgainButton = page.querySelector('#play-again-button');
      playAgainButton?.addEventListener('click', () => {
        const gameResult = page.querySelector('#game-result');
        if (gameResult) gameResult.style.display = 'none';

        // Get current game ID
        const gameTitle = page.querySelector('#game-title')?.textContent || '';
        let gameId = 'treasure-hunt';

        if (gameTitle.includes('Race')) gameId = 'pet-race';
        else if (gameTitle.includes('Puzzle')) gameId = 'puzzle-solve';

        // Reset the current game
        this.resetGame(gameId, page);
      });

      // Treasure Hunt game
      const treasureGrid = page.querySelector('#treasure-grid');
      treasureGrid?.querySelectorAll('.treasure-cell').forEach(cell => {
        cell.addEventListener('click', (e) => {
          const clickedCell = e.currentTarget as HTMLElement;

          // Only allow clicking if not already revealed
          if (!clickedCell.classList.contains('revealed')) {
            // Reveal treasure
            clickedCell.classList.add('revealed');
            clickedCell.textContent = ['💰', '💎', '🔑', '📜', '🗡️', '🛡️'][Math.floor(Math.random() * 6)];

            // Check if enough cells are revealed
            const revealedCount = treasureGrid.querySelectorAll('.revealed').length;
            if (revealedCount >= 5) {
              const gameResult = page.querySelector('#game-result');
              if (gameResult) gameResult.style.display = 'block';
            }
          }
        });
      });

      // Pet Race game
      const raceButton = page.querySelector('#race-button');
      raceButton?.addEventListener('click', () => {
        const petRacer = page.querySelector('.pet-racer') as HTMLElement;
        if (petRacer) {
          // Get current position
          const currentPos = parseFloat(petRacer.style.left) || 0;
          // Advance by random amount
          const newPos = Math.min(100, currentPos + Math.random() * 20);
          petRacer.style.left = `${newPos}%`;

          // Check if race is complete
          if (newPos >= 100) {
            const gameResult = page.querySelector('#game-result');
            if (gameResult) gameResult.style.display = 'block';
          }
        }
      });

      // Puzzle Solve game
      page.querySelectorAll('.puzzle-piece').forEach(piece => {
        piece.addEventListener('click', (e) => {
          const clickedPiece = e.currentTarget as HTMLElement;
          // Get current rotation
          const transform = clickedPiece.style.transform;
          const currentRotation = transform ? parseInt(transform.match(/rotate\((\d+)deg\)/)?.[1] || '0') : 0;
          // Rotate by 90 degrees
          const newRotation = (currentRotation + 90) % 360;
          clickedPiece.style.transform = `rotate(${newRotation}deg)`;
        });
      });

      const puzzleButton = page.querySelector('#puzzle-button');
      puzzleButton?.addEventListener('click', () => {
        // Check if all pieces are at 0 degrees (simplified puzzle solution)
        const puzzlePieces = page.querySelectorAll('.puzzle-piece');
        let solved = true;

        puzzlePieces.forEach(piece => {
          const transform = (piece as HTMLElement).style.transform;
          const rotation = transform ? parseInt(transform.match(/rotate\((\d+)deg\)/)?.[1] || '0') : 0;
          if (rotation !== 0) solved = false;
        });

        if (solved) {
          const gameResult = page.querySelector('#game-result');
          if (gameResult) gameResult.style.display = 'block';
        } else {
          alert('Not quite right! Keep trying to solve the puzzle.');
        }
      });
    }, 100);

    return page;
  }

  private resetGame(gameId: string, page: HTMLElement) {
    const gameResult = page.querySelector('#game-result');
    if (gameResult) gameResult.style.display = 'none';

    switch (gameId) {
      case 'treasure-hunt':
        // Reset treasure grid
        const treasureGrid = page.querySelector('#treasure-grid');
        treasureGrid?.querySelectorAll('.treasure-cell').forEach(cell => {
          cell.classList.remove('revealed');
          cell.textContent = '';
        });
        break;

      case 'pet-race':
        // Reset racer position
        const petRacer = page.querySelector('.pet-racer') as HTMLElement;
        if (petRacer) petRacer.style.left = '0%';
        break;

      case 'puzzle-solve':
        // Randomize puzzle pieces
        page.querySelectorAll('.puzzle-piece').forEach(piece => {
          const randomRotation = Math.floor(Math.random() * 4) * 90;
          (piece as HTMLElement).style.transform = `rotate(${randomRotation}deg)`;
        });
        break;
    }
  }
}

Meteor.startup(() => {
  console.log('Application started');

  // Initialize router
  const router = new Router();
  router.init();
});
