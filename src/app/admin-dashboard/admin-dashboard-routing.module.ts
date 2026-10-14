import {
  NgModule
} from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import {
  AuthGuard
} from '../core/auth.guard';

import {
  AdminDashboardPage
} from './admin-dashboard.page';


const routes: Routes = [

  {

    path: '',

    component:
      AdminDashboardPage,

    /** Only administrators may open the shop-wide view. */
    canActivate: [AuthGuard],

    data: {
      role: 'admin'
    }

  }

];


@NgModule({

  imports: [

    RouterModule.forChild(
      routes
    )

  ],

  exports: [

    RouterModule

  ]

})
export class AdminDashboardPageRoutingModule {}