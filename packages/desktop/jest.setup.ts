import '@testing-library/jest-dom';

class FakeRequest {
  result: unknown = undefined;
  error: unknown = null;
  onsuccess: ((ev: { target: FakeRequest }) => void) | null = null;
  onerror: ((ev: { target: FakeRequest }) => void) | null = null;
  onupgradeneeded: ((ev: { target: FakeRequest }) => void) | null = null;

  succeed(value: unknown): FakeRequest {
    this.result = value;
    queueMicrotask(() => this.onsuccess?.({ target: this }));
    return this;
  }

  fail(error: unknown): FakeRequest {
    this.error = error;
    queueMicrotask(() => this.onerror?.({ target: this }));
    return this;
  }
}

class FakeObjectStore {
  private records = new Map<unknown, Record<string, unknown>>();
  private indexKeyPaths = new Map<string, string>();

  constructor(
    private keyPath: string,
    private db: FakeDatabase
  ) {}

  private op<T>(run: () => T): FakeRequest {
    const req = new FakeRequest();
    if (this.db.failOps) return req.fail(new Error('operation failed'));
    return req.succeed(run());
  }

  createIndex(
    name: string,
    keyPath: string
  ): { getAll: (value: unknown) => FakeRequest } {
    this.indexKeyPaths.set(name, keyPath);
    return { getAll: (value: unknown) => this.getIndexAll(name, value) };
  }

  index(name: string): { getAll: (value: unknown) => FakeRequest } {
    return { getAll: (value: unknown) => this.getIndexAll(name, value) };
  }

  private getIndexAll(name: string, value: unknown): FakeRequest {
    const keyPath = this.indexKeyPaths.get(name);
    if (!keyPath) return new FakeRequest().succeed([]);
    const data = Array.from(this.records.values()).filter(
      (r) => r[keyPath] === value
    );
    return this.op(() => data);
  }

  getAll(): FakeRequest {
    return this.op(() => Array.from(this.records.values()));
  }

  get(key: unknown): FakeRequest {
    return this.op(() => this.records.get(key));
  }

  add(data: Record<string, unknown>): FakeRequest {
    return this.op(() => {
      const key = data[this.keyPath];
      this.records.set(key, data);
      return key;
    });
  }

  put(data: Record<string, unknown>): FakeRequest {
    return this.op(() => {
      const key = data[this.keyPath];
      this.records.set(key, data);
      return key;
    });
  }

  delete(key: unknown): FakeRequest {
    return this.op(() => {
      this.records.delete(key);
      return undefined;
    });
  }

  clear(): FakeRequest {
    return this.op(() => {
      this.records.clear();
      return undefined;
    });
  }
}

class FakeTransaction {
  oncomplete: ((ev: { target: FakeTransaction }) => void) | null = null;
  onerror: ((ev: { target: FakeTransaction }) => void) | null = null;
  error: unknown = null;

  constructor(
    private store: FakeObjectStore | undefined,
    private db: FakeDatabase
  ) {
    queueMicrotask(() => {
      if (this.db.failOps) {
        this.error = new Error('transaction failed');
        this.onerror?.({ target: this });
      } else {
        this.oncomplete?.({ target: this });
      }
    });
  }

  objectStore(): FakeObjectStore {
    if (!this.store) throw new Error('store not found');
    return this.store;
  }
}

class FakeDatabase {
  private stores = new Map<string, FakeObjectStore>();

  constructor(private owner: FakeIndexedDB) {}

  get failOps(): boolean {
    return this.owner.failOps;
  }

  objectStoreNames = {
    contains: (name: string): boolean => this.stores.has(name),
  };

  createObjectStore(
    name: string,
    options: { keyPath?: string }
  ): FakeObjectStore {
    const store = new FakeObjectStore(options.keyPath ?? 'id', this);
    this.stores.set(name, store);
    return store;
  }

  transaction(name: string): FakeTransaction {
    return new FakeTransaction(this.stores.get(name), this);
  }
}

class FakeIndexedDB {
  failOpen = false;
  failOps = false;
  preExistingStores: string[] = [];
  lastDb: FakeDatabase | null = null;

  open(): FakeRequest {
    const req = new FakeRequest();
    const db = new FakeDatabase(this);
    this.lastDb = db;
    req.result = db;

    for (const name of this.preExistingStores) {
      const store = db.createObjectStore(name, { keyPath: 'id' });
      if (name === 'tournaments') {
        store.createIndex('status', 'status');
      }
      if (name !== 'tournaments') {
        store.createIndex('tournamentId', 'tournamentId');
      }
    }

    queueMicrotask(() => {
      if (this.failOpen) {
        req.fail(new Error('open failed'));
        return;
      }
      req.onupgradeneeded?.({ target: req });
      req.succeed(db);
    });

    return req;
  }
}

const fakeIndexedDB = new FakeIndexedDB();
(globalThis as unknown as { indexedDB: unknown }).indexedDB = fakeIndexedDB;

Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'blob:fake'),
  configurable: true,
});
Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn(),
  configurable: true,
});
