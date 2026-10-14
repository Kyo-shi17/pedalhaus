import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular/lazy';

import { registerAppIcons } from './icons';

import { AppShellComponent } from './app-shell/app-shell.component';
import {
  BikeLabelPipe,
  CompactNumberPipe,
  MoneyPipe
} from './pipes';

/**
 * Cross-cutting UI pieces: the responsive chrome and the formatting pipes.
 * Every routed feature module imports this, which keeps the feature modules
 * free of duplicated declarations.
 */
@NgModule({
  imports: [CommonModule, RouterModule, IonicModule],
  declarations: [
    AppShellComponent,
    MoneyPipe,
    BikeLabelPipe,
    CompactNumberPipe
  ],
  exports: [
    AppShellComponent,
    MoneyPipe,
    BikeLabelPipe,
    CompactNumberPipe
  ]
})
export class SharedModule {
  constructor() {
    registerAppIcons();
  }
}
