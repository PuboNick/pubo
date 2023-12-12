export class RegExpList {
  list: string[];
  private _RegExpList: RegExp[] | null = null;

  constructor(list: string[]) {
    this.list = list;
  }

  private getRegEXP(item) {
    const str = item.replace('/', '\\/').replace('*', '.*');
    return new RegExp(str);
  }

  include(value: string) {
    if (!this._RegExpList) {
      this._RegExpList = this.list.map(this.getRegEXP);
    }

    return this._RegExpList.some((item) => item.test(value));
  }
}
