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
  HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
  HEART_RATE_MEASUREMENT_CHARACTERISTIC =
    '00002a37-0000-1000-8000-00805f9b34fb';
  BODY_SENSOR_LOCATION_CHARACTERISTIC = '00002a38-0000-1000-8000-00805f9b34fb';
  BATTERY_SERVICE = numberToUUID(0x180f);
  BATTERY_CHARACTERISTIC = numberToUUID(0x2a19);
  POLAR_PMD_SERVICE = 'fb005c80-02e7-f387-1cad-8acd2d8df0c8';
  POLAR_PMD_CONTROL_POINT = 'fb005c81-02e7-f387-1cad-8acd2d8df0c8';
  constructor() {}

  async connect(): Promise<void> {
    try {
      await BleClient.initialize();

      const device = await BleClient.requestDevice({
        services: [this.HEART_RATE_SERVICE],
        optionalServices: [this.BATTERY_SERVICE, this.POLAR_PMD_SERVICE],
      });

      // connect to device, the onDisconnect callback is optional
      await BleClient.connect(device.deviceId, (deviceId) =>
        this.onDisconnect(deviceId)
      );
      console.log('connected to device', device);

      const result = await BleClient.read(
        device.deviceId,
        this.HEART_RATE_SERVICE,
        this.BODY_SENSOR_LOCATION_CHARACTERISTIC
      );
      console.log('body sensor location', result.getUint8(0));

      const battery = await BleClient.read(
        device.deviceId,
        this.BATTERY_SERVICE,
        this.BATTERY_CHARACTERISTIC
      );
      console.log('battery level', battery.getUint8(0));

      await BleClient.write(
        device.deviceId,
        this.POLAR_PMD_SERVICE,
        this.POLAR_PMD_CONTROL_POINT,
        numbersToDataView([1, 0])
      );
      console.log('written [1, 0] to control point');

      await BleClient.startNotifications(
        device.deviceId,
        this.HEART_RATE_SERVICE,
        this.HEART_RATE_MEASUREMENT_CHARACTERISTIC,
        (value) => {
          console.log('current heart rate', this.parseHeartRate(value));
        }
      );

      // disconnect after 10 sec
      setTimeout(async () => {
        await BleClient.stopNotifications(
          device.deviceId,
          this.HEART_RATE_SERVICE,
          this.HEART_RATE_MEASUREMENT_CHARACTERISTIC
        );
        await BleClient.disconnect(device.deviceId);
        console.log('disconnected from device', device);
      }, 10000);
    } catch (error) {
      console.error(error);
    }
  }

  onDisconnect(deviceId: string): void {
    console.log(`device ${deviceId} disconnected`);
  }

  parseHeartRate(value: DataView): number {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    let heartRate: number;
    if (rate16Bits > 0) {
      heartRate = value.getUint16(1, true);
    } else {
      heartRate = value.getUint8(1);
    }
    return heartRate;
  }
}
