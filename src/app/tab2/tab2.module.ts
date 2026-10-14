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
  Tab2PageRoutingModule
} from './tab2-routing.module';

import {
  SharedModule
} from '../shared/shared.module';

import {
  Tab2Page
} from './tab2.page';


@NgModule({

  imports: [

    CommonModule,

    FormsModule,

    IonicModule,

    SharedModule,

    Tab2PageRoutingModule

  ],

  declarations: [

    Tab2Page

  ]

})
export class Tab2PageModule {}