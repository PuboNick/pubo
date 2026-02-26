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
  private readonly storage: Storage;
  private readonly zip?: Zip;

  constructor(props: WebStorageProps) {
    const { type = 'sessionStorage', key } = props;
    this._key = key;
    this.storage = window[type];
    this.zip = props.zip;
  }

  get state(): unknown | null {
    let value = this.storage.getItem(this._key);
    if (this.zip && value) {
      value = this.zip.inflate(value);
    }
    if (value) {
      return JSON.parse(value);
    }
    return null;
  }

  set state(data: unknown) {
    const temp = JSON.stringify(data);
    const value = this.zip ? this.zip.deflate(temp) : temp;
    this.storage.setItem(this._key, value);
  }

  get key(): string {
    return this._key;
  }

  merge(data: Record<string, unknown>): void {
    const old = this.state as Record<string, unknown> | null;
    this.state = { ...old, ...data };
  }

  clear(): void {
    this.storage.removeItem(this._key);
  }
}
