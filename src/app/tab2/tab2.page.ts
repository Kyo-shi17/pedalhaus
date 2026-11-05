import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Bike, BikeCategory } from '../models/bike.model';
import { BikeService } from '../core/bike.service';

interface BikeEditForm {
  name: string;
  brand: string;
  category: BikeCategory;
  price: number;
  stock: number;
  photo: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: false
})
export class Tab2Page implements OnInit {
  bikes: Bike[] = [];
  editingId: string | null = null;
  form: BikeEditForm = this.emptyForm();
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  private readonly bikeService = inject(BikeService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  get availableCount(): number {
    return this.bikes.filter(bike => bike.status === 'available').length;
  }

  get totalStock(): number {
    return this.bikes.reduce((total, bike) => total + bike.stock, 0);
  }

  async ngOnInit(): Promise<void> {
    await this.loadBikes();
  }

  async loadBikes(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.bikes = await this.bikeService.getAllBikes();
    } catch (error) {
      console.error('Loading bikes failed:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Unable to load bikes.';
    } finally {
      this.isLoading = false;
      this.changeDetector.detectChanges();
    }
  }

  editBike(bike: Bike): void {
    this.editingId = bike.id ?? null;
    this.form = {
      name: bike.name,
      brand: bike.brand,
      category: bike.category,
      price: bike.price,
      stock: bike.stock,
      photo: bike.photo ?? ''
    };
  }

  async saveEdit(): Promise<void> {
    if (!this.editingId || !this.form.name.trim() || !this.form.brand.trim() ||
        this.form.price < 0 || this.form.stock < 0 || !Number.isInteger(this.form.stock)) {
      this.errorMessage = 'Enter valid bike details before saving.';
      return;
    }
    this.isSaving = true;
    try {
      await this.bikeService.updateBike(this.editingId, {
        ...this.form,
        name: this.form.name.trim(),
        brand: this.form.brand.trim()
      });
      this.successMessage = 'Bike updated.';
      this.cancelEdit();
      await this.loadBikes();
    } catch (error) {
      console.error('Updating bike failed:', error);
      this.errorMessage = 'Unable to update the bike.';
    } finally {
      this.isSaving = false;
      this.changeDetector.detectChanges();
    }
  }

  async deleteBike(bike: Bike): Promise<void> {
    if (!bike.id || !window.confirm(`Delete ${bike.name}?`)) return;
    try {
      await this.bikeService.deleteBike(bike.id);
      this.bikes = this.bikes.filter(item => item.id !== bike.id);
      this.successMessage = 'Bike deleted.';
      this.changeDetector.detectChanges();
    } catch (error) {
      console.error('Deleting bike failed:', error);
      this.errorMessage = 'Unable to delete the bike.';
      this.changeDetector.detectChanges();
    }
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  private emptyForm(): BikeEditForm {
    return { name: '', brand: '', category: 'road', price: 0, stock: 0, photo: '' };
  }
}
