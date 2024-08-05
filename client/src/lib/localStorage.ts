import { AuthUser } from '.';

const KEYS = {
  userData: 'userData',
};

/**
 * Class to handle local storage operations
 */
export class LocalStorage {
  static saveUserData(data: AuthUser) {
    localStorage.setItem(KEYS.userData, JSON.stringify(data));
  }

  static fetchUserData() {
    const res = localStorage.getItem(KEYS.userData);
    if (!res) return;
    return JSON.parse(res) as AuthUser;
  }

  static cleanUserData() {
    localStorage.removeItem(KEYS.userData);
  }
}
