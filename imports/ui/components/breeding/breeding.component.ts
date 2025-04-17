import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PetsService } from '../../services/pets.service';
import { BreedingService } from '../../services/breeding.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-breeding',
  template: `
    <div class="breeding-container">
      <h2>Pet Breeding</h2>
      <p class="intro">Select two compatible pets to breed and create offspring with combined traits.</p>
      
      <div class="breeding-selection">
        <div class="parent-selection">
          <h3>Select First Parent</h3>
          <div class="pet-grid">
            <div 
              *ngFor="let pet of availablePets" 
              class="pet-card" 
              [class.selected]="pet._id === selectedParent1?._id"
              (click)="selectParent1(pet)"
            >
              <div class="pet-image" [style.background-color]="pet.primaryColor"></div>
              <div class="pet-info">
                <h4>{{ pet.name }}</h4>
                <p>{{ pet.species }} - {{ pet.gender }}</p>
                <p>Level {{ pet.level }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="parent-selection">
          <h3>Select Second Parent</h3>
          <div class="pet-grid">
            <div 
              *ngFor="let pet of compatiblePets" 
              class="pet-card" 
              [class.selected]="pet._id === selectedParent2?._id"
              (click)="selectParent2(pet)"
            >
              <div class="pet-image" [style.background-color]="pet.primaryColor"></div>
              <div class="pet-info">
                <h4>{{ pet.name }}</h4>
                <p>{{ pet.species }} - {{ pet.gender }}</p>
                <p>Level {{ pet.level }}</p>
              </div>
            </div>
            
            <div *ngIf="selectedParent1 && compatiblePets.length === 0" class="no-pets">
              <p>No compatible pets available for breeding.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="breeding-preview" *ngIf="selectedParent1 && selectedParent2">
        <h3>Breeding Preview</h3>
        <div class="parents-display">
          <div class="parent">
            <div class="pet-image" [style.background-color]="selectedParent1.primaryColor"></div>
            <h4>{{ selectedParent1.name }}</h4>
          </div>
          
          <div class="plus">+</div>
          
          <div class="parent">
            <div class="pet-image" [style.background-color]="selectedParent2.primaryColor"></div>
            <h4>{{ selectedParent2.name }}</h4>
          </div>
        </div>
        
        <div class="offspring-chances">
          <h4>Potential Offspring Traits</h4>
          
          <div class="trait-chances">
            <div class="trait">
              <h5>Species</h5>
              <p>{{ getSpeciesChances() }}</p>
            </div>
            
            <div class="trait">
              <h5>Primary Color</h5>
              <div class="color-preview">
                <div class="color-chance" [style.background-color]="selectedParent1.primaryColor"></div>
                <div class="color-chance" [style.background-color]="selectedParent2.primaryColor"></div>
                <div class="color-chance" [style.background-color]="getMixedColor(selectedParent1.primaryColor, selectedParent2.primaryColor)"></div>
              </div>
            </div>
            
            <div class="trait">
              <h5>Secondary Color</h5>
              <div class="color-preview">
                <div class="color-chance" [style.background-color]="selectedParent1.secondaryColor"></div>
                <div class="color-chance" [style.background-color]="selectedParent2.secondaryColor"></div>
                <div class="color-chance" [style.background-color]="getMixedColor(selectedParent1.secondaryColor, selectedParent2.secondaryColor)"></div>
              </div>
            </div>
            
            <div class="trait">
              <h5>Tertiary Color</h5>
              <div class="color-preview">
                <div class="color-chance" [style.background-color]="selectedParent1.tertiaryColor"></div>
                <div class="color-chance" [style.background-color]="selectedParent2.tertiaryColor"></div>
                <div class="color-chance" [style.background-color]="getMixedColor(selectedParent1.tertiaryColor, selectedParent2.tertiaryColor)"></div>
              </div>
            </div>
          </div>
        </div>
        
        <button class="breed-button" (click)="breedPets()">Breed Pets</button>
      </div>
      
      <div class="breeding-result" *ngIf="offspringResult">
        <h3>Breeding Successful!</h3>
        <div class="offspring-card">
          <div class="pet-image" [style.background-color]="offspringResult.primaryColor"></div>
          <div class="pet-info">
            <h4>{{ offspringResult.name }}</h4>
            <p>{{ offspringResult.species }} - {{ offspringResult.gender }}</p>
            <div class="pet-stats">
              <span>❤️ {{ offspringResult.health }}</span>
              <span>⚔️ {{ offspringResult.strength }}</span>
              <span>🛡️ {{ offspringResult.defense }}</span>
            </div>
          </div>
        </div>
        
        <div class="result-actions">
          <button [routerLink]="['/pets', offspringResult._id]">View Pet</button>
          <button (click)="resetBreeding()">Breed Again</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .breeding-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .intro {
      margin-bottom: 20px;
    }
    
    .breeding-selection {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    @media (max-width: 768px) {
      .breeding-selection {
        grid-template-columns: 1fr;
      }
    }
    
    .parent-selection {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    
    .pet-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 15px;
      margin-top: 15px;
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
      transform: translateY(-3px);
    }
    
    .pet-image {
      height: 80px;
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
      margin: 0;
      font-size: 12px;
      color: #666;
    }
    
    .no-pets {
      grid-column: 1 / -1;
      text-align: center;
      padding: 20px;
    }
    
    .breeding-preview {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    .parents-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin: 20px 0;
    }
    
    .parent {
      text-align: center;
    }
    
    .plus {
      font-size: 24px;
      font-weight: bold;
    }
    
    .offspring-chances {
      background-color: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .trait-chances {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .trait {
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    
    .trait h5 {
      margin-top: 0;
    }
    
    .color-preview {
      display: flex;
      gap: 5px;
    }
    
    .color-chance {
      width: 30px;
      height: 30px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    
    .breed-button {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      width: 100%;
    }
    
    .breed-button:hover {
      background-color: #218838;
    }
    
    .breeding-result {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    
    .offspring-card {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      max-width: 300px;
      margin: 0 auto 20px;
    }
    
    .offspring-card .pet-image {
      height: 150px;
    }
    
    .offspring-card .pet-info {
      padding: 15px;
    }
    
    .pet-stats {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
    }
    
    .result-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    
    .result-actions button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .result-actions button:hover {
      background-color: #0056b3;
    }
  `]
})
export class BreedingComponent implements OnInit {
  availablePets: Pet[] = [];
  compatiblePets: Pet[] = [];
  selectedParent1: Pet | null = null;
  selectedParent2: Pet | null = null;
  offspringResult: Pet | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private petsService: PetsService,
    private breedingService: BreedingService
  ) {}
  
  ngOnInit() {
    this.petsService.getPets().subscribe(pets => {
      this.availablePets = pets;
      
      // Check if a pet was pre-selected from the pet detail page
      this.route.queryParamMap.subscribe(params => {
        const petId = params.get('petId');
        if (petId) {
          const preSelectedPet = this.availablePets.find(pet => pet._id === petId);
          if (preSelectedPet) {
            this.selectParent1(preSelectedPet);
          }
        }
      });
    });
  }
  
  selectParent1(pet: Pet) {
    this.selectedParent1 = pet;
    this.selectedParent2 = null;
    this.updateCompatiblePets();
  }
  
  selectParent2(pet: Pet) {
    this.selectedParent2 = pet;
  }
  
  updateCompatiblePets() {
    if (!this.selectedParent1) {
      this.compatiblePets = [];
      return;
    }
    
    // Filter pets that can breed with the selected parent
    // In a real app, you would have more complex compatibility rules
    this.compatiblePets = this.availablePets.filter(pet => 
      pet._id !== this.selectedParent1!._id && 
      pet.gender !== this.selectedParent1!.gender &&
      pet.species === this.selectedParent1!.species
    );
  }
  
  getSpeciesChances(): string {
    if (!this.selectedParent1 || !this.selectedParent2) {
      return '';
    }
    
    if (this.selectedParent1.species === this.selectedParent2.species) {
      return `100% ${this.selectedParent1.species}`;
    } else {
      return `50% ${this.selectedParent1.species}, 50% ${this.selectedParent2.species}`;
    }
  }
  
  getMixedColor(color1: string, color2: string): string {
    // Simple color mixing for demonstration
    // In a real app, you would have more sophisticated color blending
    if (!color1 || !color2) return '#cccccc';
    
    // Convert hex to RGB
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    // Mix colors
    const r = Math.floor((r1 + r2) / 2);
    const g = Math.floor((g1 + g2) / 2);
    const b = Math.floor((b1 + b2) / 2);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  breedPets() {
    if (!this.selectedParent1 || !this.selectedParent2) {
      return;
    }
    
    this.breedingService.breedPets(this.selectedParent1._id, this.selectedParent2._id)
      .subscribe(offspring => {
        this.offspringResult = offspring;
      });
  }
  
  resetBreeding() {
    this.selectedParent1 = null;
    this.selectedParent2 = null;
    this.offspringResult = null;
    this.compatiblePets = [];
  }
}
