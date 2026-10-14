import { Pipe, PipeTransform } from '@angular/core';

/**
 * Currency/state label helpers used across the inventory and dashboard views.
 * Kept as pure pipes so formatting happens once per value change instead of on
 * every change-detection pass.
 */

@Pipe({ name: 'money', standalone: false })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(Number.isFinite(amount) ? amount : 0);
  }
}

/** 'refurbished' -> 'Refurbished', 'bmx' -> 'BMX'. */
@Pipe({ name: 'bikeLabel', standalone: false })
export class BikeLabelPipe implements PipeTransform {
  private readonly acronyms = new Set(['bmx']);

  transform(value: string | null | undefined): string {
    const raw = (value ?? '').trim();

    if (!raw) {
      return '';
    }

    if (this.acronyms.has(raw.toLowerCase())) {
      return raw.toUpperCase();
    }

    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  }
}

/** 1500 -> '1,500'. */
@Pipe({ name: 'compactNumber', standalone: false })
export class CompactNumberPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return new Intl.NumberFormat('en-US').format(Number(value ?? 0));
  }
}
