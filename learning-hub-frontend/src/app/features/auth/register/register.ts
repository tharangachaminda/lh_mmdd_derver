/**
 * Student Registration Component
 *
 * Handles student account creation with comprehensive form validation
 * and automatic login after successful registration
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';

import { AuthService } from '../../../core/services/auth.service';
import { StudentRegistration } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatStepperModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  registrationForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  // Grade options for students
  /**
   * Available year/grade level options
   */
  gradeOptions = [
    { value: 3, label: 'Year/Grade 3' },
    { value: 4, label: 'Year/Grade 4' },
    { value: 5, label: 'Year/Grade 5' },
    { value: 6, label: 'Year/Grade 6' },
    { value: 7, label: 'Year/Grade 7' },
    { value: 8, label: 'Year/Grade 8' },
    { value: 9, label: 'Year/Grade 9' },
    { value: 10, label: 'Year/Grade 10' },
    { value: 11, label: 'Year/Grade 11' },
    { value: 12, label: 'Year/Grade 12' },
  ];

  /**
   * Available country options
   */
  countryOptions = [
    { value: 'AU', label: 'Australia' },
    { value: 'CA', label: 'Canada' },
    { value: 'NZ', label: 'New Zealand' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'US', label: 'United States' },
    { value: 'SG', label: 'Singapore' },
    { value: 'IN', label: 'India' },
    { value: 'MY', label: 'Malaysia' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'OTHER', label: 'Other' },
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize registration form with validation
   */
  private initializeForm(): void {
    this.registrationForm = this.fb.group(
      {
        // Personal Information
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        dateOfBirth: ['', [Validators.required]],
        country: ['', [Validators.required]],

        // Academic Information
        gradeLevel: ['', [Validators.required]],
        school: ['', [Validators.required, Validators.minLength(3)]],

        // Account Security
        password: [
          '',
          [Validators.required, Validators.minLength(8), this.passwordStrengthValidator],
        ],
        confirmPassword: ['', [Validators.required]],

        // Terms and Privacy
        agreeToTerms: [false, [Validators.requiredTrue]],
        agreeToPrivacy: [false, [Validators.requiredTrue]],

        // Optional Marketing
        emailUpdates: [false],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  /**
   * Custom validator for password strength
   */
  private passwordStrengthValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);

    const valid = hasNumber && hasUpper && hasLower && hasSpecial;
    if (!valid) {
      return { passwordStrength: true };
    }
    return null;
  }

  /**
   * Custom validator to ensure passwords match
   */
  private passwordMatchValidator(form: AbstractControl): { [key: string]: any } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.registrationForm.valid && !this.isLoading) {
      this.isLoading = true;

      const formData = this.registrationForm.value;
      const registration: StudentRegistration = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        grade: formData.gradeLevel,
        country: formData.country,
        preferredSubjects: [], // Will be set later in onboarding
      };

      this.authService.registerStudent(registration).subscribe({
        next: () => {
          this.snackBar.open('Registration successful! Welcome to Learning Hub!', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar'],
          });
          // AuthService will automatically redirect to student dashboard
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Registration failed. Please try again.';

          if (error.status === 409) {
            errorMessage = 'An account with this email already exists.';
          } else if (error.status === 400) {
            errorMessage = 'Please check your information and try again.';
          }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    } else {
      this.markFormGroupTouched(this.registrationForm);
    }
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Navigate back to login
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  /**
   * Get today's date in YYYY-MM-DD format for date input max attribute
   */
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Check if password has uppercase letter
   */
  hasUppercase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  /**
   * Check if password has lowercase letter
   */
  hasLowercase(password: string): boolean {
    return /[a-z]/.test(password);
  }

  /**
   * Check if password has number
   */
  hasNumber(password: string): boolean {
    return /[0-9]/.test(password);
  }

  /**
   * Check if password has special character
   */
  hasSpecialChar(password: string): boolean {
    return /[#?!@$%^&*-]/.test(password);
  }

  // Form control getters for validation
  get firstName() {
    return this.registrationForm.get('firstName');
  }
  get lastName() {
    return this.registrationForm.get('lastName');
  }
  get email() {
    return this.registrationForm.get('email');
  }
  get dateOfBirth() {
    return this.registrationForm.get('dateOfBirth');
  }
  get country() {
    return this.registrationForm.get('country');
  }
  get gradeLevel() {
    return this.registrationForm.get('gradeLevel');
  }
  get school() {
    return this.registrationForm.get('school');
  }
  get password() {
    return this.registrationForm.get('password');
  }
  get confirmPassword() {
    return this.registrationForm.get('confirmPassword');
  }
  get agreeToTerms() {
    return this.registrationForm.get('agreeToTerms');
  }
  get agreeToPrivacy() {
    return this.registrationForm.get('agreeToPrivacy');
  }
}
