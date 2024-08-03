export default class ModalController {
  static ref: any;
  static setRef = (ref: any) => (this.ref = ref);

  static show = (children: React.ReactNode, closeable = true) =>
    this.ref.current?.show(children, closeable);
  static close = () => this.ref.current?.close();
}
