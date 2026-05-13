import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  writeBatch,
  Timestamp,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Debtor {
  id: string;
  name: string;
  amount: number;
}

export interface Expense {
  id: string;
  userId: string;
  title: string;
  total: number;
  debtors: Debtor[];
  createdAt: Timestamp;
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  public expenses$ = this.expensesSubject.asObservable();

  private unsubscribe: (() => void) | null = null;

  public loadExpenses(): void {
    const user = this.auth.currentUser;
    if (!user) return;

    // Cancelar suscripción anterior
    if (this.unsubscribe) this.unsubscribe();

    const q = query(
      collection(this.firestore, 'expenses'),
      where('userId', '==', user.uid),
    );

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            expanded: false,
          }) as Expense,
      );
      this.expensesSubject.next(expenses);
    });
  }

  public async addExpense(title: string, total: number): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await addDoc(collection(this.firestore, 'expenses'), {
      userId: user.uid,
      title,
      total,
      debtors: [],
      createdAt: Timestamp.now(),
    });
  }

  public async deleteExpense(expenseId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'expenses', expenseId));
  }

  public async addDebtor(
    expenseId: string,
    name: string,
    amount: number,
  ): Promise<void> {
    const debtorId = Math.random().toString(36).substr(2, 9);
    const expenseDoc = doc(this.firestore, 'expenses', expenseId);

    const batch = writeBatch(this.firestore);
    const expense = this.expensesSubject.value.find((e) => e.id === expenseId);

    if (expense) {
      const updatedDebtors = [
        ...expense.debtors,
        { id: debtorId, name, amount },
      ];
      batch.update(expenseDoc, { debtors: updatedDebtors });
      await batch.commit();
    }
  }

  public async removeDebtor(
    expenseId: string,
    debtorId: string,
  ): Promise<void> {
    const expenseDoc = doc(this.firestore, 'expenses', expenseId);
    const expense = this.expensesSubject.value.find((e) => e.id === expenseId);

    if (expense) {
      const updatedDebtors = expense.debtors.filter(
        (debtor) => debtor.id !== debtorId,
      );
      const batch = writeBatch(this.firestore);
      batch.update(expenseDoc, { debtors: updatedDebtors });
      await batch.commit();
    }
  }

  public async updateExpense(
    expenseId: string,
    title: string,
    total: number,
  ): Promise<void> {
    const expenseDoc = doc(this.firestore, 'expenses', expenseId);
    const batch = writeBatch(this.firestore);
    batch.update(expenseDoc, { title, total });
    await batch.commit();
  }

  public async updateDebtor(
    expenseId: string,
    debtorId: string,
    name: string,
    amount: number,
  ): Promise<void> {
    const expenseDoc = doc(this.firestore, 'expenses', expenseId);
    const expense = this.expensesSubject.value.find((e) => e.id === expenseId);

    if (expense) {
      const updatedDebtors = expense.debtors.map((debtor) =>
        debtor.id === debtorId ? { id: debtorId, name, amount } : debtor,
      );
      const batch = writeBatch(this.firestore);
      batch.update(expenseDoc, { debtors: updatedDebtors });
      await batch.commit();
    }
  }

  public ngOnDestroy(): void {
    if (this.unsubscribe) this.unsubscribe();
  }
}
