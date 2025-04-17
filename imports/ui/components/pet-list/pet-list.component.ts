import { Component, OnInit } from '@angular/core';
import { PetsService } from '../../services/pets.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-pet-list',
  template: `
    <div class="pet-list-container">
      <h2>My Pets</h2>
      
      <div class="filters">
        <input type="text" placeholder="Search pets..." [(ngModel)]="searchTerm">
        <select [(ngModel)]="speciesFilter">
          <option value="">All Species</option>
          <option value="dragon">Dragon</option>
          <option value="fae">Fae</option>
          <option value="guardian">Guardian</option>
          <option value="mirror">Mirror</option>
          <option value="tundra">Tundra</option>
        </select>
      </div>
      
      <div class="pet-grid">
        <div *ngFor="let pet of filteredPets" class="pet-card" [routerLink]="['/pets', pet._id]">
          <div class="pet-image" [style.background-color]="pet.primaryColor"></div>
          <div class="pet-info">
            <h3>{{ pet.name }}</h3>
            <p>{{ pet.species }} - Level {{ pet.level }}</p>
            <div class="pet-stats">
              <span>❤️ {{ pet.health }}</span>
              <span>⚔️ {{ pet.strength }}</span>
              <span>🛡️ {{ pet.defense }}</span>
            </div>
          </div>
        </div>
        
        <div *ngIf="filteredPets.length === 0" class="no-pets">
          <p>No pets found. Start collecting!</p>
          <button (click)="generateRandomPet()">Get a Random Pet</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pet-list-container {
      padding: 20px;
    }
    
    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    input, select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .pet-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .pet-card {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    
    .pet-card:hover {
      transform: translateY(-5px);
    }
    
    .pet-image {
      height: 150px;
      background-size: cover;
      background-position: center;
    }
    
    .pet-info {
      padding: 15px;
    }
    
    .pet-stats {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
    }
    
    .no-pets {
      grid-column: 1 / -1;
      text-align: center;
      padding: 40px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    
    button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
    
    button:hover {
      background-color: #0056b3;
    }
  `]
})
export class PetListComponent implements OnInit {
  pets: Pet[] = [];
  searchTerm: string = '';
  speciesFilter: string = '';
  
  constructor(private petsService: PetsService) {}
  
  ngOnInit() {
    this.petsService.getPets().subscribe(pets => {
      this.pets = pets;
    });
  }
  
  get filteredPets() {
    return this.pets.filter(pet => {
      const matchesSearch = !this.searchTerm || 
        pet.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesSpecies = !this.speciesFilter || 
        pet.species.toLowerCase() === this.speciesFilter.toLowerCase();
      
      return matchesSearch && matchesSpecies;
    });
  }
  
  generateRandomPet() {
    this.petsService.generateRandomPet().subscribe(pet => {
      this.pets.push(pet);
    });
  }
}
