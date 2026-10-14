import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { UserRole } from '../../models/user.model';

/**
 * Responsive application chrome.
 *
 * >= 992px  : a persistent sidebar with the brand, destinations and account.
 * <  992px  : a compact sticky header plus an icon-only bottom tab bar, with
 *             the same destinations offered in an overflow popover so nothing
 *             is only reachable by swiping.
 */
@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  standalone: false
})
export class AppShellComponent {
  readonly section = input<string>('inventory');
  readonly userName = input<string>('');
  readonly userRole = input<UserRole>('user');

  readonly reload = output<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async navigateTo(target: string): Promise<void> {
    await this.router.navigateByUrl(target, { replaceUrl: true });
  }

  async onReload(): Promise<void> {
    this.reload.emit();
  }

  async signOut(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  get isAdmin(): boolean {
    return this.userRole() === 'admin';
  }

  get initials(): string {
    const source = this.userName().trim() || this.userRole();

    return source
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }
}
