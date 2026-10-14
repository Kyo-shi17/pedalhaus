import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';

import { getFirebaseAuth } from './firebase';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

/**
 * Resolves once Firebase Auth has restored its persisted session, then either
 * allows the route or redirects to the login page.
 *
 * Without waiting for `onAuthStateChanged`, a reload on a deep link would be
 * evaluated while `auth.currentUser` is still `null` and bounce the user out.
 */
function waitForSession(): Promise<boolean> {
  const firebaseAuth = getFirebaseAuth();

  if (firebaseAuth.currentUser) {
    return Promise.resolve(true);
  }

  return new Promise<boolean>(resolve => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, user => {
      unsubscribe();
      resolve(Boolean(user));
    });
  });
}

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const signedIn = await waitForSession();

    if (!signedIn) {
      return this.redirect('/login');
    }

    const requiredRole = route.data?.['role'] as UserRole | undefined;

    if (!requiredRole) {
      return true;
    }

    const profile = await this.authService.getCurrentProfile();

    if (!profile) {
      return this.redirect('/login');
    }

    if (profile.role !== requiredRole) {
      return this.redirect('/tabs/tab1');
    }

    return true;
  }

  private redirect(url: string): false {
    void this.router.navigateByUrl(url, { replaceUrl: true });

    return false;
  }
}
