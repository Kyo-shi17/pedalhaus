import {
  Component,
  inject
} from '@angular/core';

import {
  AlertController,
  ToastController
} from '@ionic/angular';

import {
  Bike,
  BikeCategory,
  BikeStatus
} from '../models/bike.model';

import {
  BikeService
} from '../core/bike.service';

import {
  AuthService
} from '../core/auth.service';

import {
  toUserMessage
} from '../core/firestore-error';

import {
  AppUser
} from '../models/user.model';


type StatusFilter =
  'all'
  | BikeStatus;


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false
})
export class AdminDashboardPage {


  bikes: Bike[] = [];

  filteredBikes: Bike[] = [];


  searchText = '';

  selectedFilter: StatusFilter = 'all';


  isLoading = true;

  loadError = '';


  profile: AppUser | null = null;


  readonly filters: {
    value: StatusFilter;
    label: string;
  }[] = [

    { value: 'all', label: 'All' },

    { value: 'available', label: 'Available' },

    { value: 'reserved', label: 'Reserved' },

    { value: 'sold', label: 'Sold' }

  ];


  private bikeService =
    inject(BikeService);

  private authService =
    inject(AuthService);

  private toastController =
    inject(ToastController);

  private alertController =
    inject(AlertController);


  async ionViewWillEnter(): Promise<void> {

    this.profile =
      await this.authService.getCurrentProfile();


    await this.loadBikes();

  }


  async loadBikes(): Promise<void> {

    this.isLoading = true;

    this.loadError = '';


    try {

      this.bikes =
        await this.bikeService.getAllBikes();


      this.applyFilter();

    }

    catch (error) {

      console.error(
        'Loading the shop inventory failed:',
        error
      );


      this.loadError = toUserMessage(
        error,
        'We could not load the shop inventory.'
      );

    }

    finally {

      this.isLoading = false;

    }

  }


  async refresh(event: CustomEvent): Promise<void> {

    await this.loadBikes();


    (
      event.target as
        HTMLIonRefresherElement | null
    )?.complete();

  }


  /** Used by the shell's Refresh action. */
  async refreshList(): Promise<void> {

    await this.loadBikes();

  }


  onSearch(event: Event): void {

    const detail =
      (event as CustomEvent<{
        value?: string
      }>).detail;


    this.searchText =
      detail?.value ?? '';


    this.applyFilter();

  }


  onFilterChange(
    filter: StatusFilter
  ): void {

    this.selectedFilter = filter;

    this.applyFilter();

  }


  clearFilters(): void {

    this.searchText = '';

    this.selectedFilter = 'all';

    this.applyFilter();

  }


  get hasActiveFilters(): boolean {

    return Boolean(
      this.searchText.trim()
    ) || this.selectedFilter !== 'all';

  }


  applyFilter(): void {

    const needle =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredBikes =
      this.bikes.filter(bike => {

        const haystack = [

          bike.name,

          bike.brand,

          bike.description,

          bike.category,

          bike.condition,

          bike.ownerName,

          this.statusLabel(bike.status)

        ]
          .join(' ')
          .toLowerCase();


        const matchesSearch =
          !needle ||
          haystack.includes(needle);


        const matchesFilter =

          this.selectedFilter === 'all' ||

          bike.status ===
            this.selectedFilter;


        return (
          matchesSearch &&
          matchesFilter
        );

      });

  }


  async changeStatus(
    bike: Bike,
    newStatus: BikeStatus
  ): Promise<void> {

    if (
      !bike.id ||
      bike.status === newStatus
    ) {
      return;
    }


    const previous = bike.status;


    /* Optimistic update; rolled back when the write fails. */
    bike.status = newStatus;

    this.applyFilter();


    try {

      await this.bikeService.updateBike(
        bike.id,
        { status: newStatus }
      );


      await this.showToast(

        `“${bike.name}” marked as ` +

        `${this.statusLabel(newStatus).toLowerCase()}.`,

        'success'

      );

    }

    catch (error) {

      console.error(
        'Changing the status failed:',
        error
      );


      bike.status = previous;

      this.applyFilter();


      await this.showToast(

        toUserMessage(
          error,
          'We could not update that bike.'
        ),

        'danger'

      );

    }

  }


  async deleteBike(bike: Bike): Promise<void> {

    if (!bike.id) {
      return;
    }


    const alert =
      await this.alertController.create({

        header: 'Delete bike?',

        message:
          `“${bike.name}” by ${bike.ownerName} will be ` +
          'removed from the shop inventory. This cannot be undone.',

        buttons: [

          {
            text: 'Keep it',
            role: 'cancel'
          },

          {
            text: 'Delete',
            role: 'destructive'
          }

        ]

      });


    await alert.present();


    const { role } =
      await alert.onDidDismiss();


    if (role !== 'destructive') {
      return;
    }


    try {

      await this.bikeService.deleteBike(
        bike.id
      );


      this.bikes = this.bikes.filter(
        item => item.id !== bike.id
      );


      this.applyFilter();


      await this.showToast(
        'Bike deleted.',
        'success'
      );

    }

    catch (error) {

      console.error(
        'Deleting the bike failed:',
        error
      );


      await this.showToast(

        toUserMessage(
          error,
          'We could not delete that bike.'
        ),

        'danger'

      );

    }

  }


  // --- Derived state -----------------------------------------------------


  countByStatus(status: BikeStatus): number {

    return this.bikes.filter(
      bike => bike.status === status
    ).length;

  }


  get totalStock(): number {

    return this.bikes.reduce(

      (sum, bike) =>
        sum + (bike.stock || 0),

      0

    );

  }


  get inventoryValue(): number {

    return this.bikes.reduce(

      (sum, bike) =>
        sum +
        (bike.price || 0) *
        (bike.stock || 0),

      0

    );

  }


  get soldRate(): number {

    if (!this.bikes.length) {
      return 0;
    }


    return Math.round(

      (
        this.countByStatus('sold') /
        this.bikes.length
      ) * 100

    );

  }


  get categoryTotals(): {
    label: BikeCategory;
    count: number;
  }[] {

    const tally =
      new Map<BikeCategory, number>();


    for (const bike of this.bikes) {

      tally.set(

        bike.category,

        (tally.get(bike.category) ?? 0) + 1

      );

    }


    return [...tally.entries()]

      .map(([label, count]) => ({
        label,
        count
      }))

      .sort((a, b) => b.count - a.count);

  }


  statusLabel(status: BikeStatus): string {

    switch (status) {

      case 'sold':
        return 'Sold';

      case 'reserved':
        return 'Reserved';

      default:
        return 'Available';

    }

  }


  trackByBikeId(
    _index: number,
    bike: Bike
  ): string {

    return bike.id ?? bike.name;

  }


  // --- Feedback ----------------------------------------------------------


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
