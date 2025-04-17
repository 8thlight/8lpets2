import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { PetListComponent } from './components/pet-list/pet-list.component';
import { PetDetailComponent } from './components/pet-detail/pet-detail.component';
import { BreedingComponent } from './components/breeding/breeding.component';
import { PetCareComponent } from './components/pet-care/pet-care.component';
import { GamesComponent } from './components/games/games.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'pets', component: PetListComponent },
      { path: 'pets/:id', component: PetDetailComponent },
      { path: 'breeding', component: BreedingComponent },
      { path: 'care', component: PetCareComponent },
      { path: 'games', component: GamesComponent },
      { path: '**', redirectTo: '' }
    ])
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    PetListComponent,
    PetDetailComponent,
    BreedingComponent,
    PetCareComponent,
    GamesComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
