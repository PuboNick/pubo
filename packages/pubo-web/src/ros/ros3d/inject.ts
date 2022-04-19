export class InjectUtil {
  state: any = {};

  inject(obj: any, options: any) {
    return new obj({ ...this.state, ...options })
  }

  install(key: string, value: any) {
    this.state[key] = value;
  }

  remove(key: string) {
    delete this.state[key];
  }
}