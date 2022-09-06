import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ImageCropperModule } from 'ngx-image-cropper';

import { AddParentsPageRoutingModule } from './add-parents-routing.module';

import { AddParentsPage } from './add-parents.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageCropperModule,
    AddParentsPageRoutingModule
  ],
  declarations: [AddParentsPage]
})
export class AddParentsPageModule {}
