import { Component, inject, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-add-edit-debtor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './add-edit-debtor-modal.component.html',
  styleUrls: ['./add-edit-debtor-modal.component.scss'],
})
export class AddEditDebtorModalComponent implements OnInit {
  private modalController = inject(ModalController);

  @Input() name: string = '';
  @Input() amount: number = 0;
  @Input() isEdit: boolean = false;

  ngOnInit(): void {
    // Los datos vienen via @Input
  }

  public async save(): Promise<void> {
    const nameTrimmed = String(this.name ?? '').trim();
    const amountNum = Number(this.amount);

    if (!nameTrimmed || !Number.isFinite(amountNum) || amountNum <= 0) {
      return;
    }

    await this.modalController.dismiss({
      name: nameTrimmed,
      amount: amountNum,
    });
  }

  public cancel(): void {
    this.modalController.dismiss();
  }
}
