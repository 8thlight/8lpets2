import { Meteor } from 'meteor/meteor';

export class UserProfileComponent {
  private container: HTMLElement | null = null;
  private user: any = null;
  
  init(container: HTMLElement) {
    this.container = container;
    this.user = Meteor.user();
    this.render();
    this.setupEventListeners();
  }
  
  private render() {
    if (!this.container || !this.user) return;
    
    const profileContainer = document.createElement('div');
    profileContainer.id = 'user-profile-container';
    profileContainer.className = 'user-profile-container';
    
    profileContainer.innerHTML = `
      <div class="user-profile">
        <h2>User Profile</h2>
        <div class="profile-info">
          <p><strong>Username:</strong> ${this.user.username || 'N/A'}</p>
          <p><strong>Email:</strong> ${this.user.emails?.[0]?.address || 'N/A'}</p>
          <p><strong>Member Since:</strong> ${this.formatDate(this.user.profile?.createdAt)}</p>
        </div>
        <div class="profile-stats">
          <div class="stat-card">
            <h3>Pet Count</h3>
            <p class="stat-value" id="pet-count">Loading...</p>
          </div>
          <div class="stat-card">
            <h3>Highest Level Pet</h3>
            <p class="stat-value" id="highest-level">Loading...</p>
          </div>
        </div>
        <button id="logout-button" class="btn btn-danger">Logout</button>
      </div>
    `;
    
    this.container.innerHTML = '';
    this.container.appendChild(profileContainer);
  }
  
  private setupEventListeners() {
    if (!this.container) return;
    
    const logoutButton = this.container.querySelector('#logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        Meteor.logout((error) => {
          if (error) {
            alert(`Logout failed: ${error.message}`);
          } else {
            // Dispatch a custom event that the main app can listen for
            const event = new CustomEvent('user-logged-out');
            document.dispatchEvent(event);
          }
        });
      });
    }
  }
  
  updateStats(petCount: number, highestLevel: number) {
    const petCountElement = document.getElementById('pet-count');
    const highestLevelElement = document.getElementById('highest-level');
    
    if (petCountElement) {
      petCountElement.textContent = petCount.toString();
    }
    
    if (highestLevelElement) {
      highestLevelElement.textContent = highestLevel.toString();
    }
  }
  
  private formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
