import { Injectable } from '@angular/core';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';

import { getFirebaseFirestore } from './firebase';
import { Bike, BikeStatus } from '../models/bike.model';

/** Fields that must never be sent back to Firestore on update. */
const READONLY_FIELDS = ['id', 'createdAt', 'updatedAt'] as const;

@Injectable({
  providedIn: 'root'
})
export class BikeService {
  private get bikesCollection() {
    return collection(getFirebaseFirestore(), 'bikes');
  }

  // CREATE ------------------------------------------------------------------
  async createBike(bike: Omit<Bike, 'id'>): Promise<void> {
    // Timestamps are structural metadata: never taken from the caller.
    const payload = { ...bike } as Record<string, unknown>;

    delete payload['createdAt'];
    delete payload['updatedAt'];

    await addDoc(this.bikesCollection, {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  // READ - CURRENT USER -----------------------------------------------------
  async getUserBikes(userId: string): Promise<Bike[]> {
    const snapshot = await getDocs(
      query(this.bikesCollection, where('ownerId', '==', userId))
    );

    return this.toBikes(snapshot);
  }

  // READ - ADMIN ------------------------------------------------------------
  async getAllBikes(): Promise<Bike[]> {
    const snapshot = await getDocs(this.bikesCollection);

    return this.toBikes(snapshot);
  }

  // UPDATE ------------------------------------------------------------------
  async updateBike(bikeId: string, data: Partial<Bike>): Promise<void> {
    const payload = { ...data } as Record<string, unknown>;

    for (const field of READONLY_FIELDS) {
      delete payload[field];
    }

    await updateDoc(doc(getFirebaseFirestore(), 'bikes', bikeId), {
      ...payload,
      updatedAt: serverTimestamp()
    });
  }

  // DELETE ------------------------------------------------------------------
  async deleteBike(bikeId: string): Promise<void> {
    await deleteDoc(doc(getFirebaseFirestore(), 'bikes', bikeId));
  }

  /**
   * Recognised statuses, in display order. Anything else the database returns
   * (typos, legacy values) is normalised to 'available' rather than rendered
   * as a broken badge.
   */
  static readonly STATUS_ORDER: BikeStatus[] = ['available', 'reserved', 'sold'];

  private toBikes(
    snapshot: { docs: { id: string; data: () => unknown }[] }
  ): Bike[] {
    return snapshot.docs
      .map(document => this.toBike(document.id, document.data() as Partial<Bike>))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  private toBike(id: string, data: Partial<Bike>): Bike {
    return {
      id,
      name: data.name?.trim() || 'Untitled bike',
      brand: data.brand?.trim() || 'Unknown brand',
      description: data.description?.trim() || '',
      category: data.category ?? 'road',
      condition: data.condition ?? 'new',
      status: this.normaliseStatus(data.status),
      price: Number(data.price) || 0,
      stock: Number(data.stock) || 0,
      year: Number(data.year) || new Date().getFullYear(),
      photo: data.photo ?? null,
      ownerId: data.ownerId ?? '',
      ownerName: data.ownerName || 'Unknown',
      order: Number(data.order) || Date.now()
    };
  }

  private normaliseStatus(status: unknown): BikeStatus {
    return BikeService.STATUS_ORDER.includes(status as BikeStatus)
      ? (status as BikeStatus)
      : 'available';
  }
}
