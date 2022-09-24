import { Injectable } from '@angular/core';
import {
  BleClient,
  numbersToDataView,
  numberToUUID,
} from '@capacitor-community/bluetooth-le';

@Injectable({
  providedIn: 'root',
})
export class BluetoothService {
  HEART_RATE_SERVICE = '636f6d2e-6a69-7561-6e2e-504f56313100';
  HEART_RATE_MEASUREMENT_CHARACTERISTIC =
    '7274782e-6a69-7561-6e2e-504f56313100';
  BODY_SENSOR_LOCATION_CHARACTERISTIC = '00002a38-0000-1000-8000-00805f9b34fb';
  BATTERY_SERVICE = numberToUUID(0x180f);
  BATTERY_CHARACTERISTIC = numberToUUID(0x2a19);
  POLAR_PMD_SERVICE = 'fb005c80-02e7-f387-1cad-8acd2d8df0c8';
  POLAR_PMD_CONTROL_POINT = 'fb005c81-02e7-f387-1cad-8acd2d8df0c8';
  constructor() {}

  async connect(): Promise<void> {
    try {
      const init = await BleClient.initialize();
      console.log('INIT response', init);

      BleClient.isEnabled().then((res) => {
        console.log('ENABLED', res);
        if (res) {
          // BleClient.openBluetoothSettings();
        }
      });

      const device = await BleClient.requestDevice({});
      console.log('DEVICE', device);
      // connect to device, the onDisconnect callback is optional
      await BleClient.connect(device.deviceId, (deviceId) =>
        this.onDisconnect(deviceId)
      );

      const services = await BleClient.getServices(device.deviceId);
      console.log('SERVICES', services);
      console.log('connected to device', device);

    } catch (error) {
      console.error(error);
    }
  }

  onDisconnect(deviceId: string): void {
    console.log(`device ${deviceId} disconnected`);
  }

  parseHeartRate(value) {
    console.log('RATE CHANGED', value);
    // const flags = value.getUint8(0);
    // const rate16Bits = flags & 0x1;
    // let heartRate: number;
    // if (rate16Bits > 0) {
    //   heartRate = value.getUint16(1, true);
    // } else {
    //   heartRate = value.getUint8(1);
    // }
    // return heartRate;
  }
}
