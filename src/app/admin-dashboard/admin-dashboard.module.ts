import {
  NgModule
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  IonicModule
} from '@ionic/angular/lazy';

import {
  AdminDashboardPageRoutingModule
} from './admin-dashboard-routing.module';

import {
  SharedModule
} from '../shared/shared.module';

import {
  AdminDashboardPage
} from './admin-dashboard.page';


@NgModule({

  imports: [

    CommonModule,

    FormsModule,

    IonicModule,

    SharedModule,

    AdminDashboardPageRoutingModule

  ],

  declarations: [

    AdminDashboardPage

  ]

})
export class AdminDashboardPageModule {}