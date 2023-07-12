import { sleep } from 'pubo-utils';

import { IndexedDBUtils, IndexedTable } from './indexed-db-utils';

export class Storage {
  private readonly utils: IndexedDBUtils;
  private readonly store: string;

  constructor(utils: IndexedDBUtils, store: string) {
    this.utils = utils;
    this.store = store;
  }

  async getState(): Promise<any> {
    return this.utils.get(this.store, 1);
  }

  setState(values: any) {
    this.utils.put(this.store, { ...values, _id: 1 });
  }

  async merge(values: any) {
    const state = await this.getState();
    this.setState = { ...state, ...values, _id: 1 };
  }
}

export interface StorageFactoryType {
  name: string;
  version: number;
  tables?: IndexedTable[];
}

export class IndexedStorage {
  private readonly name: string;
  private readonly version: number;
  public utils!: IndexedDBUtils;
  private _cache: any = {};
  private readonly tables: IndexedTable[] = [];
  private connected = false;
  private connecting = false;

  constructor({ name, version, tables }: StorageFactoryType) {
    this.name = name;
    this.version = version;
    this.tables = tables ?? [];
  }

  register(tables: IndexedTable[]) {
    this.tables.push(...tables);
  }

  async connect() {
    if (this.connected) {
      return;
    }
    if (this.connecting) {
      while (!this.connecting) {
        await sleep(100);
      }
      return;
    }
    this.connecting = true;
    this.utils = new IndexedDBUtils(this.name, this.version, this.tables);
    await this.utils.open();
    this.connected = true;
    this.connecting = false;
  }

  get(store: string): Storage {
    if (!this._cache[store] && this.utils) {
      this._cache[store] = new Storage(this.utils, store);
    }
    return this._cache[store];
  }
}
