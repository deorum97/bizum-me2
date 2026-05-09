import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';

interface Debtor {
  id: number;
  name: string;
  amount: number;
}

interface Expense {
  id: number;
  title: string;
  total: number;
  debtors: Debtor[];
  expanded: boolean;
}
@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false,
})
export class FolderPage implements OnInit {
  public folder!: string;
  private nextExpenseId = 3;
  private nextDebtorId = 3;
  private activatedRoute = inject(ActivatedRoute);
  public expenses: Expense[] = [
    {
      id: 1,
      title: 'as',
      total: 12,
      debtors: [],
      expanded: false,
    },
    {
      id: 2,
      title: 'asd',
      total: 12,
      debtors: [{ id: 1, name: 'asd', amount: 2 }],
      expanded: false,
    },
  ];
  constructor(private alertController: AlertController) {}

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }

  public totalDebtors(expense: Expense): number {
    return expense.debtors.reduce((sum, debtor) => sum + debtor.amount, 0);
  }

  public async addExpense(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Agregar gasto',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Nombre del gasto',
        },
        {
          name: 'total',
          type: 'number',
          placeholder: 'Total',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (value) => {
            const title = String(value.title ?? '').trim();
            const total = Number(value.total);

            if (!title || !Number.isFinite(total) || total <= 0) {
              return false;
            }

            this.expenses.unshift({
              id: this.nextExpenseId,
              title,
              total,
              debtors: [],
              expanded: false,
            });
            this.nextExpenseId += 1;
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  public async deleteExpense(expenseId: number): Promise<void> {
    const confirm = await this.alertController.create({
      header: 'Eliminar gasto',
      message: 'Esta accion no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.expenses = this.expenses.filter(
              (expense) => expense.id !== expenseId,
            );
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
    const alert = await this.alertController.create({
      header: 'Agregar persona',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre',
        },
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Cantidad',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (value) => {
            const name = String(value.name ?? '').trim();
            const amount = Number(value.amount);

            if (!name || !Number.isFinite(amount) || amount <= 0) {
              return false;
            }

            expense.debtors.push({
              id: this.nextDebtorId,
              name,
              amount,
            });
            this.nextDebtorId += 1;
            expense.expanded = true;
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  public removeDebtor(expense: Expense, debtorId: number): void {
    expense.debtors = expense.debtors.filter(
      (debtor) => debtor.id !== debtorId,
    );
  }

  public money(value: number): string {
    return `${value.toFixed(2)} €`;
  }

  public debtorLabel(count: number): string {
    return count === 1 ? '1 persona' : `${count} personas`;
  }
}
