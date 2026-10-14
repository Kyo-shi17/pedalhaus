import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import { AuthGuard } from '../core/auth.guard';

import { TabsPage } from './tabs.page';


const routes: Routes = [

  {
    path: '',

    component: TabsPage,

    /** The whole tab area requires an authenticated session. */
    canActivate: [AuthGuard],

    children: [

      {
        path: 'tab1',

        loadChildren: () =>
          import('../tab1/tab1.module')
            .then(
              m => m.Tab1PageModule
            )
      },

      {
        path: 'tab2',

        loadChildren: () =>
          import('../tab2/tab2.module')
            .then(
              m => m.Tab2PageModule
            )
      },

      {
        path: '',

        redirectTo: 'tab1',

        pathMatch: 'full'
      }

    ]
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
export class TabsPageRoutingModule {}