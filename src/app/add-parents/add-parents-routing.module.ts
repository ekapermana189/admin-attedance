import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddParentsPage } from './add-parents.page';

const routes: Routes = [
  {
    path: '',
    component: AddParentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddParentsPageRoutingModule {}
