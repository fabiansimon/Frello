import { ToastType } from '@/lib';

interface ToastControllerProps {
  title?: string;
  description?: string;
}
export default class ToastController {
  static ref: any;
  static setRef = (ref: any) => (this.ref = ref);

  static showErrorToast = ({ title, description }: ToastControllerProps) =>
    this.ref.current?.showToast(ToastType.ERROR, title, description);

  static showSuccessToast = (title?: string, desciption?: string) =>
    this.ref.current?.showToast(ToastType.SUCCESS, title, desciption);

  static hide = () => this.ref.current?.hide();
}
