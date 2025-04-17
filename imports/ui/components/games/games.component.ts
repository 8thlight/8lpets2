import { Component } from '@angular/core';
import { GamesService } from '../../services/games.service';

@Component({
  selector: 'app-games',
  template: `
    <div class="games-container">
      <h2>Mini Games</h2>
      <p class="intro">Play games with your pets to earn currency and items!</p>
      
      <div class="games-grid">
        <div class="game-card" (click)="selectGame('treasure-hunt')">
          <div class="game-image" style="background-color: #FFD700"></div>
          <div class="game-info">
            <h3>Treasure Hunt</h3>
            <p>Search for hidden treasures with your pet.</p>
            <button class="play-button">Play</button>
          </div>
        </div>
        
        <div class="game-card" (click)="selectGame('pet-race')">
          <div class="game-image" style="background-color: #32CD32"></div>
          <div class="game-info">
            <h3>Pet Race</h3>
            <p>Race your pet against others to win prizes.</p>
            <button class="play-button">Play</button>
          </div>
        </div>
        
        <div class="game-card" (click)="selectGame('puzzle-solve')">
          <div class="game-image" style="background-color: #9370DB"></div>
          <div class="game-info">
            <h3>Puzzle Solve</h3>
            <p>Solve puzzles with your pet to earn rewards.</p>
            <button class="play-button">Play</button>
          </div>
        </div>
      </div>
      
      <div *ngIf="selectedGame" class="game-play-area">
        <h3>{{ getGameTitle() }}</h3>
        <p>{{ getGameDescription() }}</p>
        
        <div class="game-content">
          <!-- Simple placeholder game content -->
          <div *ngIf="selectedGame === 'treasure-hunt'" class="treasure-hunt-game">
            <div class="treasure-grid">
              <div 
                *ngFor="let cell of treasureGrid; let i = index" 
                class="treasure-cell"
                [class.revealed]="cell.revealed"
                (click)="revealTreasure(i)"
              >
                <span *ngIf="cell.revealed">{{ cell.content }}</span>
              </div>
            </div>
          </div>
          
          <div *ngIf="selectedGame === 'pet-race'" class="pet-race-game">
            <div class="race-track">
              <div 
                class="pet-racer" 
                [style.left.%]="raceProgress"
              ></div>
              <div class="finish-line"></div>
            </div>
            <button class="race-button" (click)="advanceRace()">Run!</button>
          </div>
          
          <div *ngIf="selectedGame === 'puzzle-solve'" class="puzzle-game">
            <div class="puzzle-grid">
              <div 
                *ngFor="let piece of puzzlePieces; let i = index" 
                class="puzzle-piece"
                [style.background-color]="piece.color"
                (click)="rotatePiece(i)"
                [style.transform]="'rotate(' + piece.rotation + 'deg)'"
              ></div>
            </div>
            <button class="check-button" (click)="checkPuzzle()">Check Solution</button>
          </div>
        </div>
        
        <div class="game-controls">
          <button class="back-button" (click)="selectedGame = null">Back to Games</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .games-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .intro {
      margin-bottom: 20px;
    }
    
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .game-card {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
      cursor: pointer;
    }
    
    .game-card:hover {
      transform: translateY(-5px);
    }
    
    .game-image {
      height: 150px;
      background-size: cover;
      background-position: center;
    }
    
    .game-info {
      padding: 15px;
    }
    
    .play-button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
    
    .play-button:hover {
      background-color: #0056b3;
    }
    
    .game-play-area {
      margin-top: 30px;
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    
    .game-content {
      margin: 20px 0;
      min-height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .back-button {
      background-color: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .back-button:hover {
      background-color: #5a6268;
    }
    
    /* Treasure Hunt Game */
    .treasure-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .treasure-cell {
      width: 80px;
      height: 80px;
      background-color: #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      border-radius: 4px;
    }
    
    .treasure-cell.revealed {
      background-color: #fff;
      border: 1px solid #ddd;
    }
    
    /* Pet Race Game */
    .race-track {
      width: 100%;
      height: 100px;
      background-color: #ddd;
      position: relative;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
    .pet-racer {
      width: 50px;
      height: 50px;
      background-color: #ff6b6b;
      border-radius: 50%;
      position: absolute;
      top: 25px;
      transition: left 0.3s ease;
    }
    
    .finish-line {
      width: 5px;
      height: 100%;
      background-color: #000;
      position: absolute;
      right: 0;
    }
    
    .race-button {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    /* Puzzle Game */
    .puzzle-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      max-width: 300px;
      margin: 0 auto 20px;
    }
    
    .puzzle-piece {
      width: 80px;
      height: 80px;
      background-color: #ddd;
      cursor: pointer;
      border-radius: 4px;
      transition: transform 0.3s ease;
    }
    
    .check-button {
      background-color: #17a2b8;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class GamesComponent {
  selectedGame: string | null = null;
  
  // Treasure Hunt Game
  treasureGrid = Array(15).fill(null).map(() => ({
    content: this.getRandomTreasure(),
    revealed: false
  }));
  
  // Pet Race Game
  raceProgress = 0;
  
  // Puzzle Game
  puzzlePieces = Array(9).fill(null).map(() => ({
    color: this.getRandomColor(),
    rotation: 0
  }));
  
  constructor(private gamesService: GamesService) {}
  
  selectGame(game: string) {
    this.selectedGame = game;
    
    // Reset game states
    if (game === 'treasure-hunt') {
      this.treasureGrid = Array(15).fill(null).map(() => ({
        content: this.getRandomTreasure(),
        revealed: false
      }));
    } else if (game === 'pet-race') {
      this.raceProgress = 0;
    } else if (game === 'puzzle-solve') {
      this.puzzlePieces = Array(9).fill(null).map(() => ({
        color: this.getRandomColor(),
        rotation: 0
      }));
    }
  }
  
  getGameTitle(): string {
    switch (this.selectedGame) {
      case 'treasure-hunt': return 'Treasure Hunt';
      case 'pet-race': return 'Pet Race';
      case 'puzzle-solve': return 'Puzzle Solve';
      default: return '';
    }
  }
  
  getGameDescription(): string {
    switch (this.selectedGame) {
      case 'treasure-hunt': return 'Click on tiles to reveal hidden treasures!';
      case 'pet-race': return 'Click the Run button to advance your pet in the race!';
      case 'puzzle-solve': return 'Click on puzzle pieces to rotate them. Arrange them correctly to win!';
      default: return '';
    }
  }
  
  // Treasure Hunt Game Methods
  revealTreasure(index: number) {
    if (!this.treasureGrid[index].revealed) {
      this.treasureGrid[index].revealed = true;
      
      // Check if all treasures are found
      if (this.treasureGrid.every(cell => cell.revealed)) {
        this.gamesService.recordGameResult('treasure-hunt', this.countTreasureValue());
      }
    }
  }
  
  getRandomTreasure(): string {
    const treasures = ['💰', '💎', '🔑', '📜', '🗡️', '🛡️', '❌'];
    const weights = [10, 5, 15, 20, 15, 15, 20]; // Percentages
    
    let total = 0;
    const threshold = Math.random() * 100;
    
    for (let i = 0; i < treasures.length; i++) {
      total += weights[i];
      if (threshold <= total) {
        return treasures[i];
      }
    }
    
    return treasures[0];
  }
  
  countTreasureValue(): number {
    let value = 0;
    this.treasureGrid.forEach(cell => {
      switch (cell.content) {
        case '💰': value += 10; break;
        case '💎': value += 20; break;
        case '🔑': value += 5; break;
        case '📜': value += 3; break;
        case '🗡️': value += 8; break;
        case '🛡️': value += 8; break;
        default: value += 0;
      }
    });
    return value;
  }
  
  // Pet Race Game Methods
  advanceRace() {
    this.raceProgress += Math.random() * 10;
    
    if (this.raceProgress >= 100) {
      this.raceProgress = 100;
      this.gamesService.recordGameResult('pet-race', 15);
    }
  }
  
  // Puzzle Game Methods
  rotatePiece(index: number) {
    this.puzzlePieces[index].rotation = (this.puzzlePieces[index].rotation + 90) % 360;
  }
  
  checkPuzzle() {
    // Simple check - if all pieces are at 0 degrees, puzzle is solved
    const solved = this.puzzlePieces.every(piece => piece.rotation === 0);
    
    if (solved) {
      this.gamesService.recordGameResult('puzzle-solve', 12);
    }
  }
  
  getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#6B5B95', '#88D8B0'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
