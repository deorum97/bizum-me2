import { Component, inject, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-add-edit-expense-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './add-edit-expense-modal.component.html',
  styleUrls: ['./add-edit-expense-modal.component.scss'],
})
export class AddEditExpenseModalComponent implements OnInit {
  private modalController = inject(ModalController);

  @Input() title: string = '';
  @Input() total: number = 0;
  @Input() isEdit: boolean = false;

  ngOnInit(): void {
    // Los datos vienen via @Input
  }

  public async save(): Promise<void> {
    const titleTrimmed = String(this.title ?? '').trim();
    const totalNum = Number(this.total);

    if (!titleTrimmed || !Number.isFinite(totalNum) || totalNum <= 0) {
      return;
    }

    await this.modalController.dismiss({
      title: titleTrimmed,
      total: totalNum,
    });
  }

  public cancel(): void {
    this.modalController.dismiss();
  }
}
