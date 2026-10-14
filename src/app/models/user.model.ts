export type UserRole =
  | 'user'
  | 'admin';

export interface AppUser {
  uid: string;

  name: string;

  email: string;

  role: UserRole;

  createdAt?: unknown;
}