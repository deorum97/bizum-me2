import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import {
  ExpensesService,
  Expense,
  Debtor,
} from '../core/expenses/expenses.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AddEditExpenseModalComponent } from './modals/add-edit-expense-modal.component';
import { AddEditDebtorModalComponent } from './modals/add-edit-debtor-modal.component';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false,
})
export class FolderPage implements OnInit, OnDestroy {
  public folder!: string;
  public expenses: Expense[] = [];
  private destroy$ = new Subject<void>();
  private activatedRoute = inject(ActivatedRoute);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);
  private expensesService = inject(ExpensesService);
  private router = inject(Router);

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;

    // Cargar gastos del usuario actual
    this.expensesService.loadExpenses();
    this.expensesService.expenses$
      .pipe(takeUntil(this.destroy$))
      .subscribe((expenses) => {
        this.expenses = expenses;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public totalDebtors(expense: Expense): number {
    return expense.debtors.reduce((sum, debtor) => sum + debtor.amount, 0);
  }

  public async addExpense(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddEditExpenseModalComponent,
      componentProps: {},
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      await this.expensesService.addExpense(data.title, data.total);
    }
  }

  public async deleteExpense(expenseId: string): Promise<void> {
    const confirm = await this.alertController.create({
      header: 'Eliminar gasto',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.expensesService.deleteExpense(expenseId);
          },
        },
      ],
    });

    await confirm.present();
  }

  public toggleDetails(expense: Expense): void {
    expense.expanded = !expense.expanded;
  }

  public async addDebtor(expense: Expense): Promise<void> {
    const modal = await this.modalController.create({
      component: AddEditDebtorModalComponent,
      componentProps: {},
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      await this.expensesService.addDebtor(expense.id, data.name, data.amount);
      expense.expanded = true;
    }
  }

  public async removeDebtor(expense: Expense, debtorId: string): Promise<void> {
    await this.expensesService.removeDebtor(expense.id, debtorId);
  }

  public money(value: number): string {
    return `${value.toFixed(2)} €`;
  }

  public debtorLabel(count: number): string {
    return count === 1 ? '1 persona' : `${count} personas`;
  }

  public editExpense(expenseId: string): void {
    this.router.navigate(['/folder', this.folder, 'edit', expenseId]);
  }
}
