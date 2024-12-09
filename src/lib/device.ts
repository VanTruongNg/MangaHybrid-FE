import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'device_id';

export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = `web_${uuidv4()}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}

export function removeDeviceId(): void {
  localStorage.removeItem(DEVICE_ID_KEY);
} 