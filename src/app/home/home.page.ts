import { Component } from '@angular/core';
import { BluetoothService } from '../services/bluetooth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(public bluetooth: BluetoothService) {}

  connect() {
    this.bluetooth.connect();
  }
}
