export default class ModalController {
  static ref: any;
  static setRef = (ref: any) => (this.ref = ref);

  static show = (children: React.ReactNode) => this.ref.current?.show(children);
  static close = () => this.ref.current?.close();
}
