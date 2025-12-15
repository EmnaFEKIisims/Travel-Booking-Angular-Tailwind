import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../user-service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AutoFocusDirective } from '../../../../shared/directives/auto-focus.directive';
import { ClickEffectDirective } from '../../../../shared/directives/click-effect.directive';

@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AutoFocusDirective, ClickEffectDirective],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {

  signInForm: FormGroup;
  isLoading = false;
  showAlert = false;
  alertMessage = '';
  alertType = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      this.isLoading = true;
      const { email, password } = this.signInForm.value;

      this.userService.login(email, password).subscribe({
        next: (users) => {
          this.isLoading = false;
          if (users.length > 0) {
            this.showAlertMessage('Login successful!', 'success');
            setTimeout(() => {
              this.router.navigate(['/destinations']);
            }, 1500);
          } else {
            this.showAlertMessage('Invalid credentials! Please try again.', 'error');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.showAlertMessage('User not found! Please check your email.', 'warning');
          console.error('Login error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private showAlertMessage(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signInForm.controls).forEach(key => {
      this.signInForm.get(key)?.markAsTouched();
    });
  }


    getInputClass(field: any): string {
    const baseClass = 'input-base';
    
    if (field?.invalid && field?.touched) {
      return `${baseClass} input-invalid`;
    } else if (field?.valid && field?.touched) {
      return `${baseClass} input-valid`;
    } else {
      return `${baseClass} input-default`;
    }
  }

  getButtonClass(): string {
    const baseClass = 'submit-button';
    
    if (this.isLoading || this.signInForm.invalid) {
      return `${baseClass} button-disabled`;
    } else {
      return `${baseClass} button-enabled`;
    }
  }

  get email() { return this.signInForm.get('email'); }
  get password() { return this.signInForm.get('password'); }

}
