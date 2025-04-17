import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

interface GameResult {
  gameId: string;
  score: number;
  currency: number;
  items: string[];
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  private gameResults: GameResult[] = [];
  private currency: number = 0;
  private inventory: string[] = [];
  
  constructor() {}
  
  recordGameResult(gameId: string, score: number): Observable<GameResult> {
    // Calculate currency earned based on score
    const currency = Math.floor(score * 1.5);
    
    // Determine if any items were earned
    const items = this.determineItemRewards(gameId, score);
    
    // Create game result
    const result: GameResult = {
      gameId,
      score,
      currency,
      items,
      timestamp: new Date()
    };
    
    // Update player's currency and inventory
    this.currency += currency;
    this.inventory.push(...items);
    
    // Save result
    this.gameResults.push(result);
    
    return of(result);
  }
  
  getGameResults(): Observable<GameResult[]> {
    return of(this.gameResults);
  }
  
  getCurrency(): Observable<number> {
    return of(this.currency);
  }
  
  getInventory(): Observable<string[]> {
    return of(this.inventory);
  }
  
  private determineItemRewards(gameId: string, score: number): string[] {
    const items: string[] = [];
    
    // Chance to earn items based on score
    const itemChance = score / 100; // Higher score = higher chance
    
    if (Math.random() < itemChance) {
      // Determine which items to give based on the game
      switch (gameId) {
        case 'treasure-hunt':
          if (score > 15) items.push('Rare Gem');
          if (score > 10) items.push('Gold Coin');
          if (score > 5) items.push('Silver Coin');
          break;
          
        case 'pet-race':
          if (score > 12) items.push('Speed Potion');
          if (score > 8) items.push('Energy Treat');
          break;
          
        case 'puzzle-solve':
          if (score > 10) items.push('Intelligence Scroll');
          if (score > 5) items.push('Puzzle Box');
          break;
      }
    }
    
    return items;
  }
}
