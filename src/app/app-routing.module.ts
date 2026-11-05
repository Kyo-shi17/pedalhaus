import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'add',
    pathMatch: 'full'
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./tab1/tab1.module').then(module => module.Tab1PageModule)
  },
  {
    path: 'inventory',
    loadChildren: () =>
      import('./tab2/tab2.module').then(module => module.Tab2PageModule)
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./tab3/tab3.module').then(module => module.Tab3PageModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
