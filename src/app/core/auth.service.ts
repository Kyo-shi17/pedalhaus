import { Injectable } from '@angular/core';

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

import { getFirebaseAuth, getFirebaseFirestore } from './firebase';
import { AppUser } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Creates the Firebase Auth user and its Firestore profile.
   *
   * The profile is written with `merge: true` so a retry after a partial
   * failure (auth created, profile missing) repairs the record instead of
   * throwing and leaving the account unusable.
   */
  async signup(name: string, email: string, password: string): Promise<AppUser> {
    const credential = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password
    );
    const user = credential.user;

    const profile: AppUser = {
      uid: user.uid,
      name,
      email,
      role: 'user',
      createdAt: serverTimestamp()
    };

    await setDoc(doc(getFirebaseFirestore(), 'users', user.uid), profile, {
      merge: true
    });

    return profile;
  }

  async login(email: string, password: string): Promise<AppUser> {
    const credential = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password
    );

    return this.loadProfile(credential.user.uid);
  }

  async logout(): Promise<void> {
    await signOut(getFirebaseAuth());
  }

  getCurrentUser(): User | null {
    return getFirebaseAuth().currentUser;
  }

  async getCurrentProfile(): Promise<AppUser | null> {
    const currentUser = getFirebaseAuth().currentUser;

    if (!currentUser) {
      return null;
    }

    return this.loadProfile(currentUser.uid);
  }

  /** Completes as soon as Firebase restores (or rejects) the stored session. */
  whenSessionReady(): Promise<User | null> {
    return new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(getFirebaseAuth(), user => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  /**
   * Reads the profile document. If a legacy account has no document yet, it is
   * back-filled from the Auth record so sign-in never dead-ends.
   */
  private async loadProfile(uid: string): Promise<AppUser> {
    const firestore = getFirebaseFirestore();
    const snapshot = await getDoc(doc(firestore, 'users', uid));

    if (snapshot.exists()) {
      const data = snapshot.data() as Partial<AppUser>;

      return {
        uid,
        name: data.name?.trim() || 'Shop member',
        email: data.email || getFirebaseAuth().currentUser?.email || '',
        role: data.role === 'admin' ? 'admin' : 'user',
        createdAt: data.createdAt
      };
    }

    return this.backfillProfile(uid);
  }

  private async backfillProfile(uid: string): Promise<AppUser> {
    const currentUser = getFirebaseAuth().currentUser;

    if (!currentUser) {
      throw new Error('Your session expired. Please sign in again.');
    }

    const profile: AppUser = {
      uid,
      name: currentUser.displayName?.trim() || 'Shop member',
      email: currentUser.email || '',
      role: 'user',
      createdAt: serverTimestamp()
    };

    await setDoc(doc(getFirebaseFirestore(), 'users', uid), profile, {
      merge: true
    });

    return profile;
  }
}