import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  ToastController,
  ModalController,
} from '@ionic/angular';
import {
  ExpensesService,
  Expense,
  Debtor,
} from '../../core/expenses/expenses.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AddEditDebtorModalComponent } from '../modals/add-edit-debtor-modal.component';

@Component({
  selector: 'app-edit-expense',
  templateUrl: './edit-expense.page.html',
  styleUrls: ['./edit-expense.page.scss'],
  standalone: false,
})
export class EditExpensePage implements OnInit, OnDestroy {
  public expense: Expense | null = null;
  public expenseId: string = '';
  public title: string = '';
  public total: number = 0;
  public debtors: Debtor[] = [];

  private destroy$ = new Subject<void>();
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  private expensesService = inject(ExpensesService);

  ngOnInit() {
    this.expenseId = this.activatedRoute.snapshot.paramMap.get(
      'expenseId',
    ) as string;

    this.expensesService.expenses$
      .pipe(takeUntil(this.destroy$))
      .subscribe((expenses) => {
        const found = expenses.find((e) => e.id === this.expenseId);
        if (found) {
          this.expense = found;
          this.title = found.title;
          this.total = found.total;
          this.debtors = JSON.parse(JSON.stringify(found.debtors));
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public async saveExpense(): Promise<void> {
    const titleTrimmed = String(this.title ?? '').trim();
    const totalNum = Number(this.total);

    if (!titleTrimmed || !Number.isFinite(totalNum) || totalNum <= 0) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Nombre y total son requeridos y deben ser válidos.',
        buttons: [{ text: 'OK' }],
      });
      await alert.present();
      return;
    }

    try {
      await this.expensesService.updateExpense(
        this.expenseId,
        titleTrimmed,
        totalNum,
      );

      // Actualizar deudores si hay cambios
      if (this.expense) {
        for (const debtor of this.debtors) {
          const originalDebtor = this.expense.debtors.find(
            (d) => d.id === debtor.id,
          );
          if (
            !originalDebtor ||
            originalDebtor.name !== debtor.name ||
            originalDebtor.amount !== debtor.amount
          ) {
            await this.expensesService.updateDebtor(
              this.expenseId,
              debtor.id,
              debtor.name,
              debtor.amount,
            );
          }
        }
      }

      const toast = await this.toastController.create({
        message: 'Gasto actualizado exitosamente',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      this.router.navigate(['/folder', 'expenses']);
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo actualizar el gasto',
        buttons: [{ text: 'OK' }],
      });
      await alert.present();
    }
  }

  public async addDebtor(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddEditDebtorModalComponent,
      componentProps: {},
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      const debtorId = Math.random().toString(36).substr(2, 9);
      this.debtors.push({ id: debtorId, name: data.name, amount: data.amount });
    }
  }

  public async editDebtor(debtor: Debtor, index: number): Promise<void> {
    const modal = await this.modalController.create({
      component: AddEditDebtorModalComponent,
      componentProps: {
        name: debtor.name,
        amount: debtor.amount,
        isEdit: true,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.debtors[index].name = data.name;
      this.debtors[index].amount = data.amount;
    }
  }

  public async removeDebtor(index: number): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar persona',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.debtors.splice(index, 1);
          },
        },
      ],
    });

    await alert.present();
  }

  public cancelEdit(): void {
    this.router.navigate(['/folder', 'expenses']);
  }

  public money(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
}
