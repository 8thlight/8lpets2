import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PetsService } from '../../services/pets.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-pet-detail',
  template: `
    <div class="pet-detail-container" *ngIf="pet">
      <div class="pet-header">
        <div class="pet-image" [style.background-color]="pet.primaryColor">
          <div class="pet-secondary-color" [style.background-color]="pet.secondaryColor"></div>
          <div class="pet-tertiary-color" [style.background-color]="pet.tertiaryColor"></div>
        </div>
        <div class="pet-title">
          <h2>{{ pet.name }}</h2>
          <p>{{ pet.species }} - Level {{ pet.level }}</p>
          <p>{{ pet.gender }} - {{ pet.age }} days old</p>
        </div>
      </div>
      
      <div class="pet-stats-container">
        <div class="stat-card">
          <h3>Health</h3>
          <div class="stat-value">{{ pet.health }}</div>
          <div class="stat-bar">
            <div class="stat-fill" [style.width.%]="(pet.health / 100) * 100"></div>
          </div>
        </div>
        
        <div class="stat-card">
          <h3>Strength</h3>
          <div class="stat-value">{{ pet.strength }}</div>
          <div class="stat-bar">
            <div class="stat-fill" [style.width.%]="(pet.strength / 100) * 100"></div>
          </div>
        </div>
        
        <div class="stat-card">
          <h3>Defense</h3>
          <div class="stat-value">{{ pet.defense }}</div>
          <div class="stat-bar">
            <div class="stat-fill" [style.width.%]="(pet.defense / 100) * 100"></div>
          </div>
        </div>
        
        <div class="stat-card">
          <h3>Speed</h3>
          <div class="stat-value">{{ pet.speed }}</div>
          <div class="stat-bar">
            <div class="stat-fill" [style.width.%]="(pet.speed / 100) * 100"></div>
          </div>
        </div>
      </div>
      
      <div class="pet-actions">
        <button (click)="feed()">Feed</button>
        <button (click)="play()">Play</button>
        <button [routerLink]="['/breeding']" [queryParams]="{petId: pet._id}">Breed</button>
        <button (click)="train()">Train</button>
      </div>
      
      <div class="pet-description">
        <h3>About</h3>
        <p>{{ pet.description || 'No description available.' }}</p>
      </div>
      
      <div class="pet-family" *ngIf="pet.parents?.length">
        <h3>Family</h3>
        <div class="family-section">
          <h4>Parents</h4>
          <div class="family-members">
            <div *ngFor="let parentId of pet.parents" class="family-member" [routerLink]="['/pets', parentId]">
              <div class="family-member-image"></div>
              <p>{{ getParentName(parentId) }}</p>
            </div>
          </div>
        </div>
        
        <div class="family-section" *ngIf="pet.offspring?.length">
          <h4>Offspring</h4>
          <div class="family-members">
            <div *ngFor="let childId of pet.offspring" class="family-member" [routerLink]="['/pets', childId]">
              <div class="family-member-image"></div>
              <p>{{ getOffspringName(childId) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="loading" *ngIf="!pet">
      <p>Loading pet details...</p>
    </div>
  `,
  styles: [`
    .pet-detail-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .pet-header {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .pet-image {
      width: 200px;
      height: 200px;
      border-radius: 10px;
      position: relative;
      overflow: hidden;
    }
    
    .pet-secondary-color, .pet-tertiary-color {
      position: absolute;
      width: 50%;
      height: 50%;
    }
    
    .pet-secondary-color {
      top: 0;
      right: 0;
    }
    
    .pet-tertiary-color {
      bottom: 0;
      left: 0;
    }
    
    .pet-title {
      flex: 1;
    }
    
    .pet-stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0;
    }
    
    .stat-bar {
      height: 10px;
      background-color: #e9ecef;
      border-radius: 5px;
      overflow: hidden;
    }
    
    .stat-fill {
      height: 100%;
      background-color: #007bff;
    }
    
    .pet-actions {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    
    button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      flex: 1;
      min-width: 100px;
    }
    
    button:hover {
      background-color: #0056b3;
    }
    
    .pet-description, .pet-family {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .family-section {
      margin-bottom: 20px;
    }
    
    .family-members {
      display: flex;
      gap: 15px;
      overflow-x: auto;
      padding: 10px 0;
    }
    
    .family-member {
      min-width: 100px;
      text-align: center;
      cursor: pointer;
    }
    
    .family-member-image {
      width: 80px;
      height: 80px;
      background-color: #ddd;
      border-radius: 50%;
      margin: 0 auto 10px;
    }
    
    .loading {
      text-align: center;
      padding: 50px;
    }
  `]
})
export class PetDetailComponent implements OnInit {
  pet: Pet | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private petsService: PetsService
  ) {}
  
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const petId = params.get('id');
      if (petId) {
        this.petsService.getPetById(petId).subscribe(pet => {
          this.pet = pet;
        });
      }
    });
  }
  
  feed() {
    if (this.pet) {
      this.petsService.feedPet(this.pet._id).subscribe(updatedPet => {
        this.pet = updatedPet;
      });
    }
  }
  
  play() {
    if (this.pet) {
      this.petsService.playWithPet(this.pet._id).subscribe(updatedPet => {
        this.pet = updatedPet;
      });
    }
  }
  
  train() {
    if (this.pet) {
      this.petsService.trainPet(this.pet._id).subscribe(updatedPet => {
        this.pet = updatedPet;
      });
    }
  }
  
  getParentName(parentId: string): string {
    // In a real app, you would fetch the parent's name
    return 'Parent ' + parentId.substring(0, 5);
  }
  
  getOffspringName(childId: string): string {
    // In a real app, you would fetch the child's name
    return 'Child ' + childId.substring(0, 5);
  }
}
