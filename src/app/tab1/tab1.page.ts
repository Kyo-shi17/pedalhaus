import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { BikeCategory } from '../models/bike.model';
import { BikeService } from '../core/bike.service';

interface BikeForm {
  name: string;
  brand: string;
  category: BikeCategory;
  price: number | null;
  stock: number | null;
  photo: string;
}

const emptyForm = (): BikeForm => ({
  name: '',
  brand: '',
  category: 'road',
  price: null,
  stock: 1,
  photo: ''
});

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page {
  form: BikeForm = emptyForm();
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  private readonly bikeService = inject(BikeService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  async saveBike(): Promise<void> {
    const name = this.form.name.trim();
    const brand = this.form.brand.trim();
    const price = Number(this.form.price);
    const stock = Number(this.form.stock);

    if (!name || !brand || !Number.isFinite(price) || price < 0 ||
        !Number.isInteger(stock) || stock < 0) {
      this.errorMessage = 'Enter a name, brand, valid price, and whole-number stock.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.bikeService.createBike({
        name,
        brand,
        description: '',
        category: this.form.category,
        condition: 'new',
        status: 'available',
        price,
        stock,
        year: new Date().getFullYear(),
        photo: this.form.photo.trim() || null,
        ownerId: '',
        ownerName: '',
        order: Date.now()
      });
      this.successMessage = 'Bike added. Open Inventory to view it.';
      this.resetForm();
    } catch (error) {
      console.error('Saving bike failed:', error);
      this.errorMessage = error instanceof Error
        ? error.message
        : 'Unable to save the bike. Please try again.';
    } finally {
      this.isSaving = false;
      this.changeDetector.detectChanges();
    }
  }

  resetForm(): void {
    this.form = emptyForm();
  }
}
