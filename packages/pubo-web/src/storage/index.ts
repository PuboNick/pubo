type StorageType = 'sessionStorage' | 'localStorage';

interface WebStorageProps {
  type?: StorageType;
  key: string;
}

export class WebStorage {
  private readonly _key: string;
  private readonly storage: Window['sessionStorage'] | Window['localStorage'];

  constructor(props: WebStorageProps) {
    const { type = 'sessionStorage', key } = props;
    this._key = key;
    this.storage = window[type];
  }

  get state() {
    const value = this.storage.getItem(this._key);
    if (value) {
      return JSON.parse(value);
    } else {
      return null;
    }
  }

  set state(data: any) {
    const temp = JSON.stringify(data);
    this.storage.setItem(this._key, temp);
  }

  get key() {
    return this._key;
  }

  merge(data: any) {
    const old = this.state;
    this.state = { ...old, ...data };
  }

  clear() {
    this.storage.removeItem(this._key);
  }
}
