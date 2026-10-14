import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { AdminDashboardPageModule } from './admin-dashboard.module';
import { AdminDashboardPage } from './admin-dashboard.page';
import { AuthService } from '../core/auth.service';
import { BikeService } from '../core/bike.service';

/**
 * The page reaches out to Firebase during `ionViewWillEnter`, so both services
 * are replaced with stubs — the unit test must never touch the network.
 */
const authStub = {
  getCurrentUser: () => null,
  getCurrentProfile: async () => null
};

const bikeStub = {
  getAllBikes: async () => []
};

describe('AdminDashboardPage', () => {
  let component: AdminDashboardPage;
  let fixture: ComponentFixture<AdminDashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardPageModule, RouterModule.forRoot([])],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: BikeService, useValue: bikeStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters the inventory by search text and status', () => {
    component.bikes = [
      {
        id: 'a',
        name: 'Domane SL 6',
        brand: 'Trek',
        description: '',
        category: 'road',
        condition: 'new',
        status: 'available',
        price: 1200,
        stock: 2,
        year: 2026,
        ownerId: 'u1',
        ownerName: 'Alex',
        order: 1
      },
      {
        id: 'b',
        name: 'Fuel EX 8',
        brand: 'Trek',
        description: '',
        category: 'mountain',
        condition: 'used',
        status: 'sold',
        price: 900,
        stock: 1,
        year: 2024,
        ownerId: 'u1',
        ownerName: 'Alex',
        order: 2
      }
    ];

    component.applyFilter();

    expect(component.filteredBikes.length).toBe(2);

    component.searchText = 'fuel';
    component.applyFilter();

    expect(component.filteredBikes.length).toBe(1);

    component.searchText = '';
    component.onFilterChange('sold');

    expect(component.filteredBikes.length).toBe(1);
    expect(component.filteredBikes[0].id).toBe('b');
  });

  it('reports inventory totals', () => {
    component.bikes = [
      {
        id: 'a',
        name: 'A',
        brand: 'Trek',
        description: '',
        category: 'road',
        condition: 'new',
        status: 'available',
        price: 100,
        stock: 3,
        year: 2026,
        ownerId: 'u1',
        ownerName: 'Alex',
        order: 1
      },
      {
        id: 'b',
        name: 'B',
        brand: 'Trek',
        description: '',
        category: 'road',
        condition: 'new',
        status: 'sold',
        price: 50,
        stock: 1,
        year: 2026,
        ownerId: 'u1',
        ownerName: 'Alex',
        order: 2
      }
    ];

    expect(component.totalStock).toBe(4);
    expect(component.inventoryValue).toBe(350);
    expect(component.soldRate).toBe(50);
    expect(component.countByStatus('available')).toBe(1);
  });
});
