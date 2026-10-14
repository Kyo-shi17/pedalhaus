import {
  Component,
  inject
} from '@angular/core';

import {
  AlertController,
  ToastController
} from '@ionic/angular';

import {
  AuthService
} from '../core/auth.service';

import {
  BikeService
} from '../core/bike.service';

import {
  toUserMessage
} from '../core/firestore-error';

import {
  AppUser
} from '../models/user.model';


interface ProfileSnapshot {

  listed: number;

  available: number;

  reserved: number;

  sold: number;

  totalStock: number;

}


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page {


  profile: AppUser | null = null;

  isLoading = true;

  loadError = '';

  isSigningOut = false;


  snapshot: ProfileSnapshot = {

    listed: 0,

    available: 0,

    reserved: 0,

    sold: 0,

    totalStock: 0

  };


  private authService =
    inject(AuthService);

  private bikeService =
    inject(BikeService);

  private alertController =
    inject(AlertController);

  private toastController =
    inject(ToastController);


  async ionViewWillEnter(): Promise<void> {

    await this.load();

  }


  async load(): Promise<void> {

    this.isLoading = true;

    this.loadError = '';


    try {

      this.profile =
        await this.authService.getCurrentProfile();


      const currentUser =
        this.authService.getCurrentUser();


      if (currentUser) {

        await this.loadSnapshot(currentUser.uid);

      }

    }

    catch (error) {

      console.error(
        'Loading the profile failed:',
        error
      );


      this.loadError = toUserMessage(
        error,
        'We could not load your profile.'
      );

    }

    finally {

      this.isLoading = false;

    }

  }


  private async loadSnapshot(
    uid: string
  ): Promise<void> {

    const bikes =
      await this.bikeService.getUserBikes(uid);


    this.snapshot = {

      listed: bikes.length,

      available: bikes.filter(
        bike => bike.status === 'available'
      ).length,

      reserved: bikes.filter(
        bike => bike.status === 'reserved'
      ).length,

      sold: bikes.filter(
        bike => bike.status === 'sold'
      ).length,

      totalStock: bikes.reduce(
        (sum, bike) => sum + (bike.stock || 0),
        0
      )

    };

  }


  async refresh(event: CustomEvent): Promise<void> {

    await this.load();


    (
      event.target as
        HTMLIonRefresherElement | null
    )?.complete();

  }


  /** Used by the shell's Refresh action. */
  async refreshProfile(): Promise<void> {

    await this.load();

  }


  get initials(): string {

    const source =
      this.profile?.name?.trim() ||
      this.profile?.email ||
      '?';


    return source

      .split(/[\s@._-]+/)

      .filter(Boolean)

      .slice(0, 2)

      .map(part => part.charAt(0).toUpperCase())

      .join('');

  }


  get isAdmin(): boolean {

    return this.profile?.role === 'admin';

  }


  async signOut(): Promise<void> {

    const alert =
      await this.alertController.create({

        header: 'Sign out?',

        message:
          'You will need to sign in again to manage your inventory.',

        buttons: [

          {
            text: 'Stay signed in',
            role: 'cancel'
          },

          {
            text: 'Sign out',
            role: 'destructive'
          }

        ]

      });


    await alert.present();


    const { role } =
      await alert.onDidDismiss();


    if (
      role !== 'destructive' ||
      this.isSigningOut
    ) {
      return;
    }


    this.isSigningOut = true;


    try {

      await this.authService.logout();

    }

    catch (error) {

      console.error(
        'Sign out failed:',
        error
      );


      const toast =
        await this.toastController.create({

          message: toUserMessage(
            error,
            'We could not sign you out.'
          ),

          duration: 2600,

          color: 'danger',

          position: 'bottom'

        });


      await toast.present();

    }

    finally {

      this.isSigningOut = false;

    }

  }

}