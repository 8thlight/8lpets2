import { Component, OnInit } from '@angular/core';
import { PetsService } from '../../services/pets.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-pet-care',
  template: `
    <div class="pet-care-container">
      <h2>Pet Care Center</h2>
      <p class="intro">Take care of your pets to keep them happy and healthy.</p>
      
      <div class="care-tabs">
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'feeding'"
          (click)="activeTab = 'feeding'"
        >
          Feeding
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'grooming'"
          (click)="activeTab = 'grooming'"
        >
          Grooming
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'healing'"
          (click)="activeTab = 'healing'"
        >
          Healing
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'training'"
          (click)="activeTab = 'training'"
        >
          Training
        </button>
      </div>
      
      <div class="tab-content">
        <!-- Feeding Tab -->
        <div *ngIf="activeTab === 'feeding'" class="tab-panel">
          <h3>Feed Your Pets</h3>
          <p>Select a pet and food item to feed them. Feeding increases health and happiness.</p>
          
          <div class="food-items">
            <div 
              *ngFor="let food of foodItems" 
              class="food-item"
              [class.selected]="selectedFood === food"
              (click)="selectFood(food)"
            >
              <div class="food-icon" [style.background-color]="food.color"></div>
              <div class="food-info">
                <h4>{{ food.name }}</h4>
                <p>{{ food.description }}</p>
                <div class="food-stats">
                  <span>Health: +{{ food.healthBoost }}</span>
                  <span>Happiness: +{{ food.happinessBoost }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pet-selection">
            <h4>Select a Pet to Feed</h4>
            <div class="pet-grid">
              <div 
                *ngFor="let pet of pets" 
                class="pet-card"
                [class.selected]="selectedPet?._id === pet._id"
                (click)="selectPet(pet)"
              >
                <div class="pet-image" [style.background-color]="pet.primaryColor"></div>
                <div class="pet-info">
                  <h4>{{ pet.name }}</h4>
                  <p>{{ pet.species }}</p>
                  <div class="pet-status">
                    <div class="status-bar">
                      <div class="status-label">Hunger</div>
                      <div class="status-track">
                        <div class="status-fill" [style.width.%]="100 - (pet.hunger || 0)"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            class="action-button" 
            [disabled]="!selectedPet || !selectedFood"
            (click)="feedPet()"
          >
            Feed Pet
          </button>
        </div>
        
        <!-- Grooming Tab -->
        <div *ngIf="activeTab === 'grooming'" class="tab-panel">
          <h3>Groom Your Pets</h3>
          <p>Regular grooming keeps your pets clean and happy.</p>
          
          <div class="grooming-tools">
            <div 
              *ngFor="let tool of groomingTools" 
              class="grooming-tool"
              [class.selected]="selectedTool === tool"
              (click)="selectTool(tool)"
            >
              <div class="tool-icon" [style.background-color]="tool.color"></div>
              <div class="tool-info">
                <h4>{{ tool.name }}</h4>
                <p>{{ tool.description }}</p>
                <div class="tool-stats">
                  <span>Cleanliness: +{{ tool.cleanlinessBoost }}</span>
                  <span>Happiness: +{{ tool.happinessBoost }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pet-selection">
            <h4>Select a Pet to Groom</h4>
            <div class="pet-grid">
              <div 
                *ngFor="let pet of pets" 
                class="pet-card"
                [class.selected]="selectedPet?._id === pet._id"
                (click)="selectPet(pet)"
              >
                <div class="pet-image" [style.background-color]="pet.primaryColor"></div>
                <div class="pet-info">
                  <h4>{{ pet.name }}</h4>
                  <p>{{ pet.species }}</p>
                  <div class="pet-status">
                    <div class="status-bar">
                      <div class="status-label">Cleanliness</div>
                      <div class="status-track">
                        <div class="status-fill" [style.width.%]="pet.cleanliness || 0"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            class="action-button" 
            [disabled]="!selectedPet || !selectedTool"
            (click)="groomPet()"
          >
            Groom Pet
          </button>
        </div>
        
        <!-- Healing Tab -->
        <div *ngIf="activeTab === 'healing'" class="tab-panel">
          <h3>Heal Your Pets</h3>
          <p>Treat your pets when they're sick or injured.</p>
          
          <div class="medicine-items">
            <div 
              *ngFor="let medicine of medicineItems" 
              class="medicine-item"
              [class.selected]="selectedMedicine === medicine"
              (click)="selectMedicine(medicine)"
            >
              <div class="medicine-icon" [style.background-color]="medicine.color"></div>
              <div class="medicine-info">
                <h4>{{ medicine.name }}</h4>
                <p>{{ medicine.description }}</p>
                <div class="medicine-stats">
                  <span>Health: +{{ medicine.healthBoost }}</span>
                  <span>Cures: {{ medicine.cures.join(', ') }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pet-selection">
            <h4>Select a Pet to Heal</h4>
            <div class="pet-grid">
              <div 
                *ngFor="let pet of pets" 
                class="pet-card"
                [class.selected]="selectedPet?._id === pet._id"
                (click)="selectPet(pet)"
              >
                <div class="pet-image" [style.background-color]="pet.primaryColor"></div>
                <div class="pet-info">
                  <h4>{{ pet.name }}</h4>
                  <p>{{ pet.species }}</p>
                  <div class="pet-status">
                    <div class="status-bar">
                      <div class="status-label">Health</div>
                      <div class="status-track">
                        <div class="status-fill" [style.width.%]="pet.health"></div>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="pet.ailments?.length" class="pet-ailments">
                    <span *ngFor="let ailment of pet.ailments" class="ailment-tag">{{ ailment }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            class="action-button" 
            [disabled]="!selectedPet || !selectedMedicine"
            (click)="healPet()"
          >
            Heal Pet
          </button>
        </div>
        
        <!-- Training Tab -->
        <div *ngIf="activeTab === 'training'" class="tab-panel">
          <h3>Train Your Pets</h3>
          <p>Training improves your pet's stats and abilities.</p>
          
          <div class="training-activities">
            <div 
              *ngFor="let activity of trainingActivities" 
              class="training-activity"
              [class.selected]="selectedActivity === activity"
              (click)="selectActivity(activity)"
            >
              <div class="activity-icon" [style.background-color]="activity.color"></div>
              <div class="activity-info">
                <h4>{{ activity.name }}</h4>
                <p>{{ activity.description }}</p>
                <div class="activity-stats">
                  <span *ngFor="let stat of activity.statBoosts | keyvalue">
                    {{ stat.key }}: +{{ stat.value }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pet-selection">
            <h4>Select a Pet to Train</h4>
            <div class="pet-grid">
              <div 
                *ngFor="let pet of pets" 
                class="pet-card"
                [class.selected]="selectedPet?._id === pet._id"
                (click)="selectPet(pet)"
              >
                <div class="pet-image" [style.background-color]="pet.primaryColor"></div>
                <div class="pet-info">
                  <h4>{{ pet.name }}</h4>
                  <p>{{ pet.species }}</p>
                  <div class="pet-stats">
                    <span>⚔️ {{ pet.strength }}</span>
                    <span>🛡️ {{ pet.defense }}</span>
                    <span>⚡ {{ pet.speed }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            class="action-button" 
            [disabled]="!selectedPet || !selectedActivity"
            (click)="trainPet()"
          >
            Train Pet
          </button>
        </div>
      </div>
      
      <div class="care-result" *ngIf="careResult">
        <div class="result-icon" [ngClass]="careResult.success ? 'success' : 'error'">
          <span *ngIf="careResult.success">✓</span>
          <span *ngIf="!careResult.success">✗</span>
        </div>
        <div class="result-message">
          <h4>{{ careResult.title }}</h4>
          <p>{{ careResult.message }}</p>
        </div>
        <button class="close-button" (click)="careResult = null">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .pet-care-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
      position: relative;
    }
    
    .intro {
      margin-bottom: 20px;
    }
    
    .care-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .tab-button {
      padding: 10px 20px;
      background-color: #f8f9fa;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .tab-button.active {
      background-color: #007bff;
      color: white;
    }
    
    .tab-panel {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    
    .food-items, .grooming-tools, .medicine-items, .training-activities {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .food-item, .grooming-tool, .medicine-item, .training-activity {
      display: flex;
      gap: 10px;
      background-color: white;
      padding: 15px;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .food-item:hover, .grooming-tool:hover, .medicine-item:hover, .training-activity:hover {
      transform: translateY(-3px);
    }
    
    .food-item.selected, .grooming-tool.selected, .medicine-item.selected, .training-activity.selected {
      border: 2px solid #007bff;
    }
    
    .food-icon, .tool-icon, .medicine-icon, .activity-icon {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      flex-shrink: 0;
    }
    
    .food-info, .tool-info, .medicine-info, .activity-info {
      flex: 1;
    }
    
    .food-info h4, .tool-info h4, .medicine-info h4, .activity-info h4 {
      margin-top: 0;
      margin-bottom: 5px;
    }
    
    .food-info p, .tool-info p, .medicine-info p, .activity-info p {
      margin-top: 0;
      font-size: 14px;
      color: #666;
    }
    
    .food-stats, .tool-stats, .medicine-stats, .activity-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
      font-size: 12px;
    }
    
    .food-stats span, .tool-stats span, .medicine-stats span, .activity-stats span {
      background-color: #f8f9fa;
      padding: 3px 8px;
      border-radius: 4px;
    }
    
    .pet-selection {
      margin-top: 20px;
    }
    
    .pet-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
      margin-top: 10px;
    }
    
    .pet-card {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .pet-card:hover {
      transform: translateY(-3px);
    }
    
    .pet-card.selected {
      border: 2px solid #007bff;
    }
    
    .pet-image {
      height: 100px;
      background-size: cover;
      background-position: center;
    }
    
    .pet-info {
      padding: 10px;
    }
    
    .pet-info h4 {
      margin: 0 0 5px;
      font-size: 14px;
    }
    
    .pet-info p {
      margin: 0 0 5px;
      font-size: 12px;
      color: #666;
    }
    
    .pet-status {
      margin-top: 5px;
    }
    
    .status-bar {
      margin-bottom: 5px;
    }
    
    .status-label {
      font-size: 11px;
      margin-bottom: 2px;
    }
    
    .status-track {
      height: 6px;
      background-color: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .status-fill {
      height: 100%;
      background-color: #28a745;
    }
    
    .pet-stats {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }
    
    .pet-ailments {
      margin-top: 5px;
    }
    
    .ailment-tag {
      display: inline-block;
      background-color: #dc3545;
      color: white;
      font-size: 10px;
      padding: 2px 5px;
      border-radius: 3px;
      margin-right: 5px;
    }
    
    .action-button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      width: 100%;
      margin-top: 20px;
    }
    
    .action-button:hover:not(:disabled) {
      background-color: #0056b3;
    }
    
    .action-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    .care-result {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 15px;
      max-width: 400px;
      width: 90%;
      z-index: 100;
    }
    
    .result-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    
    .result-icon.success {
      background-color: #28a745;
      color: white;
    }
    
    .result-icon.error {
      background-color: #dc3545;
      color: white;
    }
    
    .result-message {
      flex: 1;
    }
    
    .result-message h4 {
      margin-top: 0;
      margin-bottom: 5px;
    }
    
    .result-message p {
      margin: 0;
    }
    
    .close-button {
      background-color: #f8f9fa;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: auto;
    }
  `]
})
export class PetCareComponent implements OnInit {
  pets: Pet[] = [];
  selectedPet: Pet | null = null;
  activeTab: 'feeding' | 'grooming' | 'healing' | 'training' = 'feeding';
  
  // Feeding
  foodItems = [
    {
      id: 'basic-food',
      name: 'Basic Food',
      description: 'Standard pet food that provides basic nutrition.',
      color: '#8BC34A',
      healthBoost: 5,
      happinessBoost: 3
    },
    {
      id: 'premium-food',
      name: 'Premium Food',
      description: 'High-quality food with extra nutrients.',
      color: '#4CAF50',
      healthBoost: 10,
      happinessBoost: 7
    },
    {
      id: 'special-treat',
      name: 'Special Treat',
      description: 'A delicious treat that makes pets very happy.',
      color: '#FF9800',
      healthBoost: 3,
      happinessBoost: 15
    }
  ];
  selectedFood: any = null;
  
  // Grooming
  groomingTools = [
    {
      id: 'brush',
      name: 'Brush',
      description: 'A basic brush for regular grooming.',
      color: '#9C27B0',
      cleanlinessBoost: 10,
      happinessBoost: 5
    },
    {
      id: 'premium-brush',
      name: 'Premium Brush',
      description: 'A high-quality brush for thorough grooming.',
      color: '#673AB7',
      cleanlinessBoost: 20,
      happinessBoost: 10
    },
    {
      id: 'bath-kit',
      name: 'Bath Kit',
      description: 'A complete bath kit for deep cleaning.',
      color: '#2196F3',
      cleanlinessBoost: 30,
      happinessBoost: 5
    }
  ];
  selectedTool: any = null;
  
  // Healing
  medicineItems = [
    {
      id: 'basic-medicine',
      name: 'Basic Medicine',
      description: 'Treats common ailments.',
      color: '#F44336',
      healthBoost: 10,
      cures: ['Cold', 'Fever']
    },
    {
      id: 'advanced-medicine',
      name: 'Advanced Medicine',
      description: 'Treats serious ailments.',
      color: '#E91E63',
      healthBoost: 20,
      cures: ['Infection', 'Poisoning']
    },
    {
      id: 'healing-potion',
      name: 'Healing Potion',
      description: 'Restores health without curing specific ailments.',
      color: '#FF5722',
      healthBoost: 30,
      cures: []
    }
  ];
  selectedMedicine: any = null;
  
  // Training
  trainingActivities = [
    {
      id: 'strength-training',
      name: 'Strength Training',
      description: 'Improves physical strength.',
      color: '#795548',
      statBoosts: {
        strength: 3,
        endurance: 1
      }
    },
    {
      id: 'agility-training',
      name: 'Agility Training',
      description: 'Improves speed and reflexes.',
      color: '#009688',
      statBoosts: {
        speed: 3,
        agility: 2
      }
    },
    {
      id: 'defense-training',
      name: 'Defense Training',
      description: 'Improves defensive capabilities.',
      color: '#607D8B',
      statBoosts: {
        defense: 3,
        health: 1
      }
    }
  ];
  selectedActivity: any = null;
  
  // Result message
  careResult: {
    success: boolean;
    title: string;
    message: string;
  } | null = null;
  
  constructor(private petsService: PetsService) {}
  
  ngOnInit() {
    this.petsService.getPets().subscribe(pets => {
      this.pets = pets;
    });
  }
  
  selectPet(pet: Pet) {
    this.selectedPet = pet;
  }
  
  selectFood(food: any) {
    this.selectedFood = food;
  }
  
  selectTool(tool: any) {
    this.selectedTool = tool;
  }
  
  selectMedicine(medicine: any) {
    this.selectedMedicine = medicine;
  }
  
  selectActivity(activity: any) {
    this.selectedActivity = activity;
  }
  
  feedPet() {
    if (!this.selectedPet || !this.selectedFood) return;
    
    this.petsService.feedPet(this.selectedPet._id, this.selectedFood.id).subscribe(
      updatedPet => {
        // Update the pet in the list
        const index = this.pets.findIndex(p => p._id === updatedPet._id);
        if (index !== -1) {
          this.pets[index] = updatedPet;
        }
        
        this.careResult = {
          success: true,
          title: 'Feeding Successful',
          message: `${this.selectedPet!.name} enjoyed the ${this.selectedFood.name}!`
        };
        
        // Reset selections
        this.selectedPet = null;
        this.selectedFood = null;
      },
      error => {
        this.careResult = {
          success: false,
          title: 'Feeding Failed',
          message: 'There was an error feeding your pet.'
        };
      }
    );
  }
  
  groomPet() {
    if (!this.selectedPet || !this.selectedTool) return;
    
    this.petsService.groomPet(this.selectedPet._id, this.selectedTool.id).subscribe(
      updatedPet => {
        // Update the pet in the list
        const index = this.pets.findIndex(p => p._id === updatedPet._id);
        if (index !== -1) {
          this.pets[index] = updatedPet;
        }
        
        this.careResult = {
          success: true,
          title: 'Grooming Successful',
          message: `${this.selectedPet!.name} looks clean and happy!`
        };
        
        // Reset selections
        this.selectedPet = null;
        this.selectedTool = null;
      },
      error => {
        this.careResult = {
          success: false,
          title: 'Grooming Failed',
          message: 'There was an error grooming your pet.'
        };
      }
    );
  }
  
  healPet() {
    if (!this.selectedPet || !this.selectedMedicine) return;
    
    this.petsService.healPet(this.selectedPet._id, this.selectedMedicine.id).subscribe(
      updatedPet => {
        // Update the pet in the list
        const index = this.pets.findIndex(p => p._id === updatedPet._id);
        if (index !== -1) {
          this.pets[index] = updatedPet;
        }
        
        this.careResult = {
          success: true,
          title: 'Healing Successful',
          message: `${this.selectedPet!.name} is feeling better!`
        };
        
        // Reset selections
        this.selectedPet = null;
        this.selectedMedicine = null;
      },
      error => {
        this.careResult = {
          success: false,
          title: 'Healing Failed',
          message: 'There was an error healing your pet.'
        };
      }
    );
  }
  
  trainPet() {
    if (!this.selectedPet || !this.selectedActivity) return;
    
    this.petsService.trainPet(this.selectedPet._id, this.selectedActivity.id).subscribe(
      updatedPet => {
        // Update the pet in the list
        const index = this.pets.findIndex(p => p._id === updatedPet._id);
        if (index !== -1) {
          this.pets[index] = updatedPet;
        }
        
        this.careResult = {
          success: true,
          title: 'Training Successful',
          message: `${this.selectedPet!.name} learned new skills!`
        };
        
        // Reset selections
        this.selectedPet = null;
        this.selectedActivity = null;
      },
      error => {
        this.careResult = {
          success: false,
          title: 'Training Failed',
          message: 'There was an error training your pet.'
        };
      }
    );
  }
}
