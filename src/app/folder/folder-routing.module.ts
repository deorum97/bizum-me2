import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FolderPage } from './folder.page';

const routes: Routes = [
  {
    path: '',
    component: FolderPage,
  },
  {
    path: 'edit/:expenseId',
    loadChildren: () =>
      import('./edit-expense/edit-expense.module').then(
        (m) => m.EditExpensePageModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FolderPageRoutingModule {}
