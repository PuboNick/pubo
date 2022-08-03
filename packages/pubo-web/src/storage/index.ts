type StorageType = 'sessionStorage' | 'localStorage';

interface Zip {
  deflate: (data: string) => string;
  inflate: (data: string) => string;
}

interface WebStorageProps {
  type?: StorageType;
  key: string;
  zip?: Zip;
}

export class WebStorage {
  private readonly _key: string;
  private readonly storage: Window['sessionStorage'] | Window['localStorage'];
  private readonly zip?: Zip;

  constructor(props: WebStorageProps) {
    const { type = 'sessionStorage', key } = props;
    this._key = key;
    this.storage = window[type];
    this.zip = props.zip;
  }

  get state() {
    let value = this.storage.getItem(this._key);
    if (this.zip) {
      value = this.zip.inflate(value);
    }
    if (value) {
      return JSON.parse(value);
    } else {
      return null;
    }
  }

  set state(data: any) {
    let temp = JSON.stringify(data);
    if (this.zip) {
      temp = this.zip.deflate(temp);
    }
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
