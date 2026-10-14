import {
  Component,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  LoadingController,
  ToastController
} from '@ionic/angular';

import {
  AuthService
} from '../core/auth.service';

import {
  toUserMessage
} from '../core/firestore-error';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: false
})
export class SignupPage {


  name = '';

  email = '';

  password = '';

  confirmPassword = '';

  passwordVisible = false;

  submitted = false;

  isSubmitting = false;


  private authService =
    inject(AuthService);

  private router =
    inject(Router);

  private loadingController =
    inject(LoadingController);

  private toastController =
    inject(ToastController);


  get nameError(): string {

    return this.name.trim().length >= 2
      ? ''
      : 'Enter your full name.';

  }


  get emailError(): string {

    const value =
      this.email.trim();


    if (!value) {
      return 'Enter your email address.';
    }


    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      .test(value)

      ? ''

      : 'That does not look like an email address.';

  }


  get passwordError(): string {

    if (!this.password) {
      return 'Choose a password.';
    }


    return this.password.length >= 6
      ? ''
      : 'Use at least 6 characters.';

  }


  get confirmError(): string {

    if (!this.confirmPassword) {
      return 'Repeat your password.';
    }


    return this.password ===
      this.confirmPassword

      ? ''

      : 'Those passwords do not match.';

  }


  /** Rough password strength signal — guidance, not a gate. */
  get passwordStrength(): {
    score: number;
    label: string;
  } {

    const value = this.password;

    let score = 0;


    if (value.length >= 6) {
      score++;
    }

    if (value.length >= 10) {
      score++;
    }

    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) {
      score++;
    }

    if (/\d/.test(value) || /[^\w\s]/.test(value)) {
      score++;
    }


    const labels =
      ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];


    return {
      score,
      label: labels[score]
    };

  }


  get isValid(): boolean {

    return !(
      this.nameError ||
      this.emailError ||
      this.passwordError ||
      this.confirmError
    );

  }


  togglePasswordVisibility(): void {

    this.passwordVisible =
      !this.passwordVisible;

  }


  async signup(): Promise<void> {

    this.submitted = true;


    if (
      !this.isValid ||
      this.isSubmitting
    ) {

      await this.showToast(

        this.firstError(),

        'warning'

      );

      return;

    }


    this.isSubmitting = true;


    const loading =
      await this.loadingController.create({

        message: 'Creating your account…',

        spinner: 'crescent'

      });


    await loading.present();


    try {

      await this.authService.signup(

        this.name.trim(),

        this.email
          .trim()
          .toLowerCase(),

        this.password

      );


      await loading.dismiss();


      await this.showToast(

        'Account created. Welcome aboard.',

        'success'

      );


      await this.router.navigateByUrl(
        '/tabs/tab1',
        { replaceUrl: true }
      );

    }

    catch (error) {

      await loading.dismiss();


      console.error(
        'Sign up failed:',
        error
      );


      await this.showToast(

        toUserMessage(
          error,
          'Unable to create your account. Please try again.'
        ),

        'danger'

      );

    }

    finally {

      this.isSubmitting = false;

    }

  }


  private firstError(): string {

    return (
      this.nameError ||
      this.emailError ||
      this.passwordError ||
      this.confirmError ||
      'Please check the form.'
    );

  }


  private async showToast(

    message: string,

    color: 'success' | 'warning' | 'danger'

  ): Promise<void> {

    const toast =
      await this.toastController.create({

        message,

        duration: 2600,

        position: 'bottom',

        color,

        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel'
          }
        ]

      });


    await toast.present();

  }

}