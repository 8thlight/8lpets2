import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <h2>Welcome to 8L Pets!</h2>
      <p>A Flight Rising inspired pet collection and breeding game.</p>
      
      <div class="features">
        <div class="feature-card">
          <h3>Collect Pets</h3>
          <p>Discover and collect unique pets with different traits and colors.</p>
          <button [routerLink]="['/pets']">View My Pets</button>
        </div>
        
        <div class="feature-card">
          <h3>Breed Pets</h3>
          <p>Breed your pets to create new offspring with combined traits.</p>
          <button [routerLink]="['/breeding']">Go to Breeding</button>
        </div>
        
        <div class="feature-card">
          <h3>Care for Pets</h3>
          <p>Feed, play with, and take care of your pets to keep them happy and healthy.</p>
          <button [routerLink]="['/care']">Care for Pets</button>
        </div>
        
        <div class="feature-card">
          <h3>Play Games</h3>
          <p>Earn currency and items by playing mini-games with your pets.</p>
          <button [routerLink]="['/games']">Play Games</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      text-align: center;
    }
    
    .features {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      margin-top: 30px;
    }
    
    .feature-card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      width: 250px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
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
export class HomeComponent {}
