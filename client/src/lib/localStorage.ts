import { User } from '@prisma/client';

const KEYS = {
  userData: 'userData',
};

export class LocalStorage {
  static saveUserData(data: User) {
    localStorage.setItem(KEYS.userData, JSON.stringify(data));
  }

  static fetchUserData() {
    const res = localStorage.getItem(KEYS.userData);
    if (!res) return;
    return JSON.parse(res) as User;
  }

  static cleanUserData() {
    localStorage.removeItem(KEYS.userData);
  }
}
