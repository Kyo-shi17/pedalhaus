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
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {


  email = '';

  password = '';

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


  get emailError(): string {

    const value =
      this.email.trim();


    if (!value) {
      return 'Enter your email address.';
    }


    /* Deliberately permissive — the server is the authority on validity. */
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      .test(value)

      ? ''

      : 'That does not look like an email address.';

  }


  get passwordError(): string {

    return this.password
      ? ''
      : 'Enter your password.';

  }


  get isValid(): boolean {

    return (
      !this.emailError &&
      !this.passwordError
    );

  }


  togglePasswordVisibility(): void {

    this.passwordVisible =
      !this.passwordVisible;

  }


  async login(): Promise<void> {

    this.submitted = true;


    if (
      !this.isValid ||
      this.isSubmitting
    ) {

      await this.showToast(

        this.emailError ||
        this.passwordError,

        'warning'

      );

      return;

    }


    this.isSubmitting = true;


    const loading =
      await this.loadingController.create({

        message: 'Signing you in…',

        spinner: 'crescent'

      });


    await loading.present();


    try {

      const user =
        await this.authService.login(

          this.email
            .trim()
            .toLowerCase(),

          this.password

        );


      await loading.dismiss();


      await this.showToast(

        `Welcome back, ${user.name}.`,

        'success'

      );


      await this.router.navigateByUrl(

        user.role === 'admin'
          ? '/admin-dashboard'
          : '/tabs/tab1',

        { replaceUrl: true }

      );

    }

    catch (error) {

      await loading.dismiss();


      console.error(
        'Login failed:',
        error
      );


      await this.showToast(

        toUserMessage(
          error,
          'Unable to sign in. Please try again.'
        ),

        'danger'

      );

    }

    finally {

      this.isSubmitting = false;

    }

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