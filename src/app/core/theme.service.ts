import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private mode: ThemeMode =
    localStorage.getItem('pedalhaus-theme') === 'dark' ? 'dark' : 'light';

  constructor() {
    this.apply();
  }

  get currentMode(): ThemeMode {
    return this.mode;
  }

  setMode(mode: ThemeMode): void {
    this.mode = mode;
    localStorage.setItem('pedalhaus-theme', mode);
    this.apply();
  }

  private apply(): void {
    document.documentElement.dataset['theme'] = this.mode;
  }
}
