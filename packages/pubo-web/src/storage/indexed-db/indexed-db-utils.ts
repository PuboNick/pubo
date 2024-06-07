export interface IndexedTable {
  name: string;
  options?: any;
  default?: any;
}

export class IndexedDBUtils {
  private readonly name: string;
  private readonly version: number;
  private readonly indexedDB = self.indexedDB;
  private readonly tables: IndexedTable[];
  private db: null | any;
  private transaction: any;

  constructor(name: string, version: number, tables: IndexedTable[]) {
    this.name = name;
    this.version = version;
    this.tables = tables;
  }

  open() {
    return new Promise((resolve, reject) => {
      const request = this.indexedDB?.open(this.name, this.version);
      request.onupgradeneeded = async (event) => {
        // @ts-ignore
        const db = event.target.result;

        // @ts-ignore
        this.transaction = event.target.transaction;
        this.transaction.oncomplete = async () => {
          this.transaction = null;
          for (const table of this.tables) {
            if (table.default) {
              await this.put(table.name, table.default);
            }
          }
        };

        for (const table of this.tables) {
          if (!db.objectStoreNames.contains(table.name)) {
            db.createObjectStore(table.name, table.options || { keyPath: '_id', autoIncrement: true });
          }
        }

        this.db = db;
      };

      request.onsuccess = () => {
        if (!this.db) {
          this.db = request.result;
        }
        resolve('success');
      };
      request.onerror = (error) => {
        console.error('indexed db connect error: ', error);
        reject(error);
      };
    });
  }

  private createTransaction(
    getRequest: (objectStore: any, ...args: any[]) => any,
  ): (store: string, values?: any) => Promise<any> {
    return (store: string, ...args: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject('not connect');
          return;
        }
        const transaction = this.db.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        const request = getRequest(objectStore, ...args);
        request.onerror = function (event: any) {
          reject(event);
        };
        request.onsuccess = function () {
          resolve(request.result);
        };
      });
    };
  }

  get = this.createTransaction((objectStore, key) => objectStore.get(key));
  getAll = this.createTransaction((objectStore) => objectStore.getAll());
  delete = this.createTransaction((objectStore, key) => objectStore.delete(key));
  put = this.createTransaction((objectStore, values) => objectStore.put(values));
}
