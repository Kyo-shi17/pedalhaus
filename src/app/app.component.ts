import {
  Component,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  AuthService
} from './core/auth.service';


@Component({
  selector:
    'app-root',

  templateUrl:
    'app.component.html',

  styleUrls:
    ['app.component.scss'],

  standalone:
    false
})
export class AppComponent {

  private authService =
    inject(AuthService);

  private router =
    inject(Router);


  /**
   * On a cold start the app always lands on /login. If Firebase restores a
   * persisted session (or the user hits a deep link) we forward them to the
   * right home for their role instead of making them sign in again.
   */
  constructor() {

    void this.routeSignedInUser();

  }


  private async routeSignedInUser(): Promise<void> {

    const user =
      await this.authService.whenSessionReady();


    if (!user) {
      return;
    }


    const currentUrl =
      this.router.url.split('?')[0];


    if (
      currentUrl !== '/' &&
      currentUrl !== '/login'
    ) {
      return;
    }


    try {

      const profile =
        await this.authService.getCurrentProfile();


      await this.router.navigateByUrl(

        profile?.role === 'admin'
          ? '/admin-dashboard'
          : '/tabs/tab1',

        { replaceUrl: true }

      );

    }

    catch (error) {

      /* A broken profile lookup must not block the login screen. */
      console.error(
        'Could not restore the previous session:',
        error
      );

    }

  }

}