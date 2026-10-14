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
  Tab1PageRoutingModule
} from './tab1-routing.module';

import {
  SharedModule
} from '../shared/shared.module';

import {
  Tab1Page
} from './tab1.page';


@NgModule({

  imports: [

    CommonModule,

    FormsModule,

    IonicModule,

    SharedModule,

    Tab1PageRoutingModule

  ],

  declarations: [

    Tab1Page

  ]

})
export class Tab1PageModule {}