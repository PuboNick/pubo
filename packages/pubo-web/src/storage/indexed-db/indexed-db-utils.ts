export interface IndexedTable {
  name: string;
  options?: IDBObjectStoreParameters;
  default?: Record<string, unknown>;
}

export class IndexedDBUtils {
  private readonly name: string;
  private readonly version: number;
  private readonly indexedDB: IDBFactory;
  private readonly tables: IndexedTable[];
  private db: IDBDatabase | null = null;

  constructor(name: string, version: number, tables: IndexedTable[]) {
    this.name = name;
    this.version = version;
    this.tables = tables;
    this.indexedDB = self.indexedDB;
  }

  open(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.indexedDB) {
        reject(new Error('IndexedDB is not supported'));
        return;
      }

      const request = this.indexedDB.open(this.name, this.version);

      request.onupgradeneeded = (event: IDBVersionChangeEvent): void => {
        const db = (event.target as IDBOpenDBRequest).result;

        for (const table of this.tables) {
          if (!db.objectStoreNames.contains(table.name)) {
            db.createObjectStore(table.name, table.options || { keyPath: '_id', autoIncrement: true });
          }
        }
      };

      request.onsuccess = (): void => {
        this.db = request.result;
        resolve('success');
      };

      request.onerror = (event: Event): void => {
        console.error('indexed db connect error: ', event);
        reject(event);
      };
    });
  }

  private createTransaction<T>(
    getRequest: (objectStore: IDBObjectStore, ...args: unknown[]) => IDBRequest<T>,
  ): (store: string, ...args: unknown[]) => Promise<T | undefined> {
    return (store: string, ...args: unknown[]): Promise<T | undefined> => {
      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('not connected'));
          return;
        }
        const transaction = this.db.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        const request = getRequest(objectStore, ...args);

        request.onerror = (event: Event): void => {
          reject(event);
        };

        request.onsuccess = (): void => {
          resolve(request.result);
        };
      });
    };
  }

  get = this.createTransaction<unknown>((objectStore, key) => objectStore.get(key as IDBValidKey));
  getAll = this.createTransaction<unknown[]>((objectStore) => objectStore.getAll());
  delete = this.createTransaction<void>((objectStore, key) => objectStore.delete(key as IDBValidKey));
  put = this.createTransaction<IDBValidKey>((objectStore, values) =>
    objectStore.put(values as Record<string, unknown>),
  );
}
