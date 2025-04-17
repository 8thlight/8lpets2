import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

export class AuthComponent {
  private container: HTMLElement | null = null;
  private currentView: 'login' | 'register' = 'login';
  
  init(container: HTMLElement) {
    this.container = container;
    this.render();
    this.setupEventListeners();
  }
  
  private render() {
    if (!this.container) return;
    
    const authContainer = document.createElement('div');
    authContainer.id = 'auth-container';
    authContainer.className = 'auth-container';
    
    if (this.currentView === 'login') {
      authContainer.innerHTML = `
        <div class="auth-form">
          <h2>Login</h2>
          <form id="login-form">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" class="form-control" required>
            </div>
            <div class="form-group">
              <button type="submit" class="btn btn-primary">Login</button>
            </div>
            <p>Don't have an account? <a href="#" id="switch-to-register">Register</a></p>
          </form>
        </div>
      `;
    } else {
      authContainer.innerHTML = `
        <div class="auth-form">
          <h2>Register</h2>
          <form id="register-form">
            <div class="form-group">
              <label for="register-username">Username</label>
              <input type="text" id="register-username" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="register-email">Email</label>
              <input type="email" id="register-email" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="register-password">Password</label>
              <input type="password" id="register-password" class="form-control" required minlength="6">
            </div>
            <div class="form-group">
              <button type="submit" class="btn btn-primary">Register</button>
            </div>
            <p>Already have an account? <a href="#" id="switch-to-login">Login</a></p>
          </form>
        </div>
      `;
    }
    
    this.container.innerHTML = '';
    this.container.appendChild(authContainer);
  }
  
  private setupEventListeners() {
    if (!this.container) return;
    
    // Switch between login and register views
    const switchToRegister = this.container.querySelector('#switch-to-register');
    if (switchToRegister) {
      switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentView = 'register';
        this.render();
        this.setupEventListeners();
      });
    }
    
    const switchToLogin = this.container.querySelector('#switch-to-login');
    if (switchToLogin) {
      switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentView = 'login';
        this.render();
        this.setupEventListeners();
      });
    }
    
    // Handle login form submission
    const loginForm = this.container.querySelector('#login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById('login-email') as HTMLInputElement;
        const passwordInput = document.getElementById('login-password') as HTMLInputElement;
        
        if (emailInput && passwordInput) {
          const email = emailInput.value.trim();
          const password = passwordInput.value;
          
          Meteor.loginWithPassword(email, password, (error) => {
            if (error) {
              alert(`Login failed: ${error.message}`);
            } else {
              // Successful login
              this.onLoginSuccess();
            }
          });
        }
      });
    }
    
    // Handle registration form submission
    const registerForm = this.container.querySelector('#register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const usernameInput = document.getElementById('register-username') as HTMLInputElement;
        const emailInput = document.getElementById('register-email') as HTMLInputElement;
        const passwordInput = document.getElementById('register-password') as HTMLInputElement;
        
        if (usernameInput && emailInput && passwordInput) {
          const username = usernameInput.value.trim();
          const email = emailInput.value.trim();
          const password = passwordInput.value;
          
          Accounts.createUser({
            username,
            email,
            password,
            profile: {
              createdAt: new Date()
            }
          }, (error) => {
            if (error) {
              alert(`Registration failed: ${error.message}`);
            } else {
              // Successful registration and login
              this.onLoginSuccess();
            }
          });
        }
      });
    }
  }
  
  private onLoginSuccess() {
    // Dispatch a custom event that the main app can listen for
    const event = new CustomEvent('user-authenticated');
    document.dispatchEvent(event);
  }
}
