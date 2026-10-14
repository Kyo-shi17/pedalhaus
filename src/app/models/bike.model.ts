export type BikeStatus =
  | 'available'
  | 'reserved'
  | 'sold';

export type BikeCondition =
  | 'new'
  | 'used'
  | 'refurbished';

export type BikeCategory =
  | 'road'
  | 'mountain'
  | 'hybrid'
  | 'electric'
  | 'bmx';

export interface Bike {
  id?: string;

  name: string;

  brand: string;

  description: string;

  category: BikeCategory;

  condition: BikeCondition;

  status: BikeStatus;

  price: number;

  stock: number;

  year: number;

  /** Downscaled JPEG data URL, written by ImageService. */
  photo?: string | null;

  ownerId: string;

  ownerName: string;

  order: number;

  createdAt?: unknown;

  updatedAt?: unknown;
}
