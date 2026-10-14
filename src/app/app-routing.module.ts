import { NgModule } from '@angular/core';

import {
  PreloadAllModules,
  RouterModule,
  Routes
} from '@angular/router';


const routes: Routes = [

  {
    path: '',

    redirectTo: 'login',

    pathMatch: 'full'
  },


  {
    path: 'login',

    loadChildren: () =>
      import('./login/login.module')
        .then(
          m => m.LoginPageModule
        )
  },


  {
    path: 'signup',

    loadChildren: () =>
      import('./signup/signup.module')
        .then(
          m => m.SignupPageModule
        )
  },


  {
    path: 'tabs',

    loadChildren: () =>
      import('./tabs/tabs.module')
        .then(
          m => m.TabsPageModule
        )
  },


  {
    path: 'admin-dashboard',

    loadChildren: () =>
      import(
        './admin-dashboard/admin-dashboard.module'
      )
      .then(
        m => m.AdminDashboardPageModule
      )
  },


  /** Any unknown URL returns people to the sign-in screen. */
  {
    path: '**',

    redirectTo: 'login'
  }

];


@NgModule({

  imports: [

    RouterModule.forRoot(
      routes,

      {
        preloadingStrategy:
          PreloadAllModules
      }
    )

  ],

  exports: [

    RouterModule

  ]

})
export class AppRoutingModule {}