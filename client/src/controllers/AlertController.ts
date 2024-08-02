export default class AlertController {
  static ref: any;
  static setRef = (ref: any) => (this.ref = ref);

  static show = ({
    title,
    description,
    callback,
    buttonText,
    optimistic,
    destructive,
  }: {
    title?: string;
    description?: string;
    callback?: (args?: any) => any | void | Promise<void>;
    buttonText?: string;
    destructive?: boolean;
    optimistic?: boolean;
  }) =>
    this.ref.current?.show({
      title,
      description,
      callback,
      buttonText,
      optimistic,
      destructive,
    });
}
