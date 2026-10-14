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
  BikeCondition,
  BikeStatus
} from '../models/bike.model';

import {
  BikeService
} from '../core/bike.service';

import {
  AuthService
} from '../core/auth.service';

import {
  ImageService
} from '../core/image.service';

import {
  toUserMessage
} from '../core/firestore-error';

import {
  AppUser
} from '../models/user.model';


type StatusFilter =
  'all'
  | BikeStatus;


interface DraftBike {

  name: string;

  brand: string;

  description: string;

  category: BikeCategory;

  condition: BikeCondition;

  price: number | null;

  stock: number | null;

  year: number | null;

}


const DEFAULT_DRAFT = (): DraftBike => ({

  name: '',

  brand: '',

  description: '',

  category: 'road',

  condition: 'new',

  price: null,

  stock: 1,

  year: new Date().getFullYear()

});


/** Display metadata for each lifecycle status, in workflow order. */
const STATUS_META: Record<
  BikeStatus,
  { label: string; icon: string }
> = {

  available: {
    label: 'Available',
    icon: 'checkmark-circle-outline'
  },

  reserved: {
    label: 'Reserved',
    icon: 'time-outline'
  },

  sold: {
    label: 'Sold',
    icon: 'cash-outline'
  }

};


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page {


  bikes: Bike[] = [];

  filteredBikes: Bike[] = [];


  searchText = '';

  selectedFilter: StatusFilter = 'all';


  isLoading = true;

  isSaving = false;

  loadError = '';


  /** The bike currently open for editing, or null when adding a new one. */
  editingId: string | null = null;


  profile: AppUser | null = null;


  newBike: DraftBike = DEFAULT_DRAFT();


  /** Compressed photo that will be saved with the draft. */
  draftPhoto: string | null = null;


  /** Guard so the inline validator only starts firing after a save attempt. */
  private inlineValidationShown = false;


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

  private imageService =
    inject(ImageService);

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

    const currentUser =
      this.authService.getCurrentUser();


    if (!currentUser) {

      this.bikes = [];

      this.filteredBikes = [];

      this.isLoading = false;

      return;

    }


    this.isLoading = true;

    this.loadError = '';


    try {

      this.bikes =
        await this.bikeService.getUserBikes(
          currentUser.uid
        );


      this.applyFilter();

    }

    catch (error) {

      console.error(
        'Loading inventory failed:',
        error
      );


      this.loadError = toUserMessage(
        error,
        'We could not load your inventory.'
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


  // --- Filtering ---------------------------------------------------------


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

          STATUS_META[bike.status].label

        ]
          .join(' ')
          .toLowerCase();


        const matchesSearch =
          !needle ||
          haystack.includes(needle);


        const matchesStatus =

          this.selectedFilter === 'all' ||

          bike.status ===
            this.selectedFilter;


        return (
          matchesSearch &&
          matchesStatus
        );

      });

  }


  // --- Draft form --------------------------------------------------------


  get draftNameError(): string {

    return this.newBike.name.trim()
      ? ''
      : 'Give the bike a name.';

  }


  get draftBrandError(): string {

    return this.newBike.brand.trim()
      ? ''
      : 'Add the brand.';

  }


  get draftPriceError(): string {

    if (
      this.newBike.price === null ||
      this.newBike.price === undefined
    ) {
      return 'Set a price.';
    }


    return Number(this.newBike.price) > 0
      ? ''
      : 'The price must be greater than zero.';

  }


  get draftStockError(): string {

    if (
      this.newBike.stock === null ||
      this.newBike.stock === undefined
    ) {
      return 'Set how many you have.';
    }


    const stock =
      Number(this.newBike.stock);


    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {

      return 'Stock must be a whole number of 0 or more.';

    }


    return '';

  }


  get draftYearError(): string {

    const current =
      new Date().getFullYear();


    if (
      this.newBike.year === null ||
      this.newBike.year === undefined
    ) {
      return 'Set the model year.';
    }


    const year =
      Number(this.newBike.year);


    return (
      year >= 1900 &&
      year <= current + 2
    )

      ? ''

      : `Use a year between 1900 and ${current + 2}.`;

  }


  get isDraftValid(): boolean {

    return !(
      this.draftNameError ||
      this.draftBrandError ||
      this.draftPriceError ||
      this.draftStockError ||
      this.draftYearError
    );

  }


  get isEditing(): boolean {

    return this.editingId !== null;

  }


  /** Errors stay hidden until the first save attempt. */
  showError(error: string): boolean {

    return (
      this.inlineValidationShown &&
      Boolean(error)
    );

  }


  /** `ion-input` reports numbers as strings; keep empty fields "empty". */
  toNumberOrNull(value: string): number | null {

    const trimmed = value.trim();


    if (!trimmed) {
      return null;
    }


    const parsed = Number(trimmed);


    return Number.isFinite(parsed)
      ? parsed
      : null;

  }


  /** Scrolls the add/edit card into view and focuses its first field. */
  focusForm(): void {

    const form =
      document.getElementById('bike-form');


    if (!form) {
      return;
    }


    form.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });


    window.setTimeout(() => {

      form
        .querySelector<HTMLIonInputElement>(
          'ion-input input'
        )
        ?.focus();

    }, 420);

  }


  /** Re-load without a refresher event (used by the shell's Refresh action). */
  async refreshList(): Promise<void> {

    await this.loadBikes();

  }


  addPhoto(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    const file =
      input.files?.[0];


    if (!file) {
      return;
    }


    void this.storePhoto(file);


    /* Allow re-picking the same file after a removal. */
    input.value = '';

  }


  private async storePhoto(
    file: File
  ): Promise<void> {

    try {

      this.draftPhoto =
        await this.imageService
          .toCompressedDataUrl(file);

    }

    catch (error) {

      await this.showToast(

        toUserMessage(
          error,
          'That image could not be processed.'
        ),

        'danger'

      );

    }

  }


  removePhoto(): void {

    this.draftPhoto = null;

  }


  resetDraft(): void {

    this.newBike = DEFAULT_DRAFT();

    this.draftPhoto = null;

    this.editingId = null;

    this.inlineValidationShown = false;

  }


  startEdit(bike: Bike): void {

    this.editingId = bike.id ?? null;


    this.newBike = {

      name: bike.name,

      brand: bike.brand,

      description: bike.description,

      category: bike.category,

      condition: bike.condition,

      price: bike.price,

      stock: bike.stock,

      year: bike.year

    };


    this.draftPhoto =
      bike.photo ?? null;


    this.inlineValidationShown = false;


    document
      .getElementById('bike-form')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

  }


  async saveBike(): Promise<void> {

    this.inlineValidationShown = true;


    const currentUser =
      this.authService.getCurrentUser();


    if (!currentUser) {

      await this.showToast(
        'Please sign in first.',
        'warning'
      );

      return;

    }


    if (!this.isDraftValid) {

      await this.showToast(
        this.firstDraftError(),
        'warning'
      );

      return;

    }


    if (this.isSaving) {
      return;
    }


    this.isSaving = true;


    const payload = {

      name: this.newBike.name.trim(),

      brand: this.newBike.brand.trim(),

      description:
        this.newBike.description.trim(),

      category: this.newBike.category,

      condition: this.newBike.condition,

      price: Number(this.newBike.price),

      stock: Number(this.newBike.stock),

      year: Number(this.newBike.year),

      photo: this.draftPhoto

    };


    try {

      if (this.editingId) {

        await this.bikeService.updateBike(
          this.editingId,
          payload
        );


        await this.showToast(
          `“${payload.name}” updated.`,
          'success'
        );

      }

      else {

        await this.bikeService.createBike({

          ...payload,

          status: 'available',

          ownerId: currentUser.uid,

          ownerName:
            this.profile?.name ||
            'Shop member',

          order: Date.now()

        });


        await this.showToast(
          `“${payload.name}” added to inventory.`,
          'success'
        );

      }


      this.resetDraft();


      await this.loadBikes();

    }

    catch (error) {

      console.error(
        'Saving the bike failed:',
        error
      );


      await this.showToast(

        toUserMessage(
          error,
          'We could not save that bike.'
        ),

        'danger'

      );

    }

    finally {

      this.isSaving = false;

    }

  }


  private firstDraftError(): string {

    return (

      this.draftNameError ||

      this.draftBrandError ||

      this.draftPriceError ||

      this.draftStockError ||

      this.draftYearError ||

      'Please check the form.'

    );

  }


  // --- Status + deletion -------------------------------------------------


  async setStatus(
    bike: Bike,
    status: BikeStatus
  ): Promise<void> {

    if (
      !bike.id ||
      bike.status === status
    ) {
      return;
    }


    const previous = bike.status;


    /* Optimistic update keeps the UI responsive; rolled back on failure. */
    bike.status = status;

    this.applyFilter();


    try {

      await this.bikeService.updateBike(
        bike.id,
        { status }
      );


      await this.showToast(

        `“${bike.name}” is now ` +

        `${STATUS_META[status].label.toLowerCase()}.`,

        'success'

      );

    }

    catch (error) {

      console.error(
        'Status change failed:',
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
          `“${bike.name}” will be removed from your ` +
          'inventory. This cannot be undone.',

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


      if (this.editingId === bike.id) {
        this.resetDraft();
      }


      await this.loadBikes();


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


  get soldPercent(): number {

    return this.bikes.length

      ? Math.round(

        (
          this.countByStatus('sold') /
          this.bikes.length
        ) * 100

      )

      : 0;

  }


  statusLabel(status: BikeStatus): string {

    return STATUS_META[status].label;

  }


  statusIcon(status: BikeStatus): string {

    return STATUS_META[status].icon;

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
