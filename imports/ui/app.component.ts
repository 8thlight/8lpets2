import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <header>
        <h1>8L Pets</h1>
        <nav>
          <ul>
            <li><a [routerLink]="['/']">Home</a></li>
            <li><a [routerLink]="['/pets']">My Pets</a></li>
            <li><a [routerLink]="['/breeding']">Breeding</a></li>
            <li><a [routerLink]="['/care']">Pet Care</a></li>
            <li><a [routerLink]="['/games']">Games</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
      <footer>
        <p>&copy; 2023 8L Pets - A Flight Rising Inspired App</p>
      </footer>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }
    header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    nav ul {
      display: flex;
      list-style: none;
      padding: 0;
    }
    nav li {
      margin: 0 10px;
    }
    nav a {
      text-decoration: none;
      color: #333;
      font-weight: bold;
    }
    nav a:hover {
      color: #007bff;
    }
    main {
      min-height: 500px;
      padding: 20px 0;
    }
    footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #eee;
    }
  `]
})
export class AppComponent {
  title = '8L Pets';
}
