import { Injectable } from '@angular/core';

import { Bike, BikeStatus } from '../models/bike.model';

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  timestampValue?: string;
}

const FIRESTORE_BIKES_URL =
  'https://firestore.googleapis.com/v1/projects/reyes-bike-management/databases/(default)/documents/bikes';
const REQUEST_TIMEOUT_MS = 10000;

/** Fields that must never be sent back to Firestore on update. */
const READONLY_FIELDS = ['id', 'createdAt', 'updatedAt'] as const;

@Injectable({
  providedIn: 'root'
})
export class BikeService {
  // CREATE ------------------------------------------------------------------
  async createBike(bike: Omit<Bike, 'id'>): Promise<void> {
    const now = new Date().toISOString();
    await this.request(FIRESTORE_BIKES_URL, {
      method: 'POST',
      body: JSON.stringify({
        fields: this.toFirestoreFields({
          ...bike,
          createdAt: now,
          updatedAt: now
        })
      })
    });
  }

  // READ --------------------------------------------------------------------
  async getAllBikes(): Promise<Bike[]> {
    const body = await this.request<{
      documents?: Array<{
        name: string;
        fields?: Record<string, FirestoreValue>;
      }>;
    }>(FIRESTORE_BIKES_URL);

    return (body.documents ?? [])
      .map(document => this.toBike(
        document.name.split('/').pop() ?? '',
        this.fromFirestoreFields(document.fields ?? {})
      ))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  // UPDATE ------------------------------------------------------------------
  async updateBike(bikeId: string, data: Partial<Bike>): Promise<void> {
    const payload = { ...data } as Record<string, unknown>;
    for (const field of READONLY_FIELDS) delete payload[field];
    payload['updatedAt'] = new Date().toISOString();

    const fields = this.toFirestoreFields(payload);
    const updateMask = Object.keys(fields)
      .map(field => `updateMask.fieldPaths=${encodeURIComponent(field)}`)
      .join('&');

    await this.request(`${FIRESTORE_BIKES_URL}/${encodeURIComponent(bikeId)}?${updateMask}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields })
    });
  }

  // DELETE ------------------------------------------------------------------
  async deleteBike(bikeId: string): Promise<void> {
    await this.request(
      `${FIRESTORE_BIKES_URL}/${encodeURIComponent(bikeId)}`,
      { method: 'DELETE' }
    );
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

  private fromFirestoreFields(
    fields: Record<string, FirestoreValue>
  ): Partial<Bike> {
    const data: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(fields)) {
      data[key] = value.stringValue
        ?? value.integerValue
        ?? value.doubleValue
        ?? value.booleanValue
        ?? value.nullValue
        ?? value.timestampValue;
    }

    return data as Partial<Bike>;
  }

  private toFirestoreFields(
    data: Record<string, unknown>
  ): Record<string, FirestoreValue> {
    const fields: Record<string, FirestoreValue> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        fields[key] = { nullValue: null };
      } else if (typeof value === 'boolean') {
        fields[key] = { booleanValue: value };
      } else if (typeof value === 'number') {
        fields[key] = Number.isInteger(value)
          ? { integerValue: String(value) }
          : { doubleValue: value };
      } else {
        fields[key] = { stringValue: String(value) };
      }
    }

    return fields;
  }

  private async request<T = void>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: controller.signal
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          'Firebase did not respond within 10 seconds. Check the internet connection and Firestore rules.'
        );
      }

      console.error('Firebase request failed:', { url, error });
      throw new Error('Could not connect to Firebase. Check the browser network connection.');
    } finally {
      window.clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const details = await response.text();
      console.error('Firebase request returned an error:', {
        url,
        status: response.status,
        details
      });
      throw new Error(
        `Firebase request failed (${response.status}). Check the published Firestore rules.`
      );
    }

    if (response.status === 204) return undefined as T;

    try {
      return await response.json() as T;
    } catch {
      return undefined as T;
    }
  }

  private normaliseStatus(status: unknown): BikeStatus {
    return BikeService.STATUS_ORDER.includes(status as BikeStatus)
      ? (status as BikeStatus)
      : 'available';
  }
}
