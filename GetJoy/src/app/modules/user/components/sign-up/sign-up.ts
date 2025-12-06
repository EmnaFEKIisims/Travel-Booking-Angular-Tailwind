import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormBuilder , FormGroup , Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../user-service';

@Component({
  selector: 'app-sign-up',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {

  signupForm: FormGroup;
  isLoading = false;
  showAlert = false;
  alertMessage = '';
  alertType = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      
      // Remove confirmPassword from the data to send
      const { confirmPassword, ...userData } = this.signupForm.value;

      this.userService.signup(userData).subscribe({
        next: (newUser) => {
          this.isLoading = false;
          this.showAlertMessage('Account created successfully! Welcome to GetJoy! 🎉', 'success');
          setTimeout(() => {
            this.router.navigate(['/signin']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          if (error.customError === 'Email already exists') {
            this.showAlertMessage('This email is already registered! Please use a different email.', 'error');
          } else {
            this.showAlertMessage('Error creating account. Please try again.', 'error');
          }
          console.error('Signup error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Custom validator to check if passwords match
    private passwordMatchValidator(formGroup: FormGroup) {
      const password = formGroup.get('password');
      const confirmPassword = formGroup.get('confirmPassword');

      if (!password || !confirmPassword) return null;

      if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
        return null; // ne pas écraser d'autres erreurs
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
      } else {
        confirmPassword.setErrors(null);
      }

      return null;
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
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.get(key)?.markAsTouched();
    });
  }

  // Helper methods for template
  get fullName() { return this.signupForm.get('fullName'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirmPassword'); }

  // Methods for dynamic class binding
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
    
    if (this.isLoading || this.signupForm.invalid) {
      return `${baseClass} button-disabled`;
    } else {
      return `${baseClass} button-enabled`;
    }
  }


}
