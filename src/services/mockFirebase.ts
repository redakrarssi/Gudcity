import { v4 as uuidv4 } from 'uuid';

// Mock database for use in testing mode
const mockDB: Record<string, Record<string, any>> = {
  pointCodes: {},
  codeIndex: {},
  users: {
    'mock-business-user-id': {
      uid: 'mock-business-user-id',
      email: 'business@example.com',
      displayName: 'Test Business',
      role: 'business',
      businessId: 'mock-business-id',
      isSetupComplete: true
    },
    'mock-customer-user-id': {
      uid: 'mock-customer-user-id',
      email: 'customer@example.com',
      displayName: 'Test Customer',
      role: 'customer',
      points: { 'mock-business-id': 100 }
    }
  },
  redemptions: {}
};

// Mock Firestore document reference
class MockDocumentReference {
  constructor(
    private collection: string,
    private id: string
  ) {}

  async get() {
    const data = mockDB[this.collection]?.[this.id];
    return {
      exists: () => !!data,
      data: () => data ? { ...data } : undefined,
      id: this.id
    };
  }

  async set(data: any) {
    if (!mockDB[this.collection]) {
      mockDB[this.collection] = {};
    }
    mockDB[this.collection][this.id] = { 
      ...data,
      // Convert any Date objects to ISO strings for easy storage
      ...Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
          if (value instanceof Date) {
            return [key, value.toISOString()];
          }
          return [key, value];
        })
      )
    };
    console.log(`MockFirebase: Document ${this.collection}/${this.id} set:`, mockDB[this.collection][this.id]);
    return Promise.resolve();
  }

  async update(data: any) {
    if (!mockDB[this.collection]?.[this.id]) {
      throw new Error(`Document ${this.collection}/${this.id} does not exist`);
    }
    
    mockDB[this.collection][this.id] = {
      ...mockDB[this.collection][this.id],
      ...data
    };
    console.log(`MockFirebase: Document ${this.collection}/${this.id} updated:`, mockDB[this.collection][this.id]);
    return Promise.resolve();
  }

  async delete() {
    if (mockDB[this.collection]?.[this.id]) {
      console.log(`MockFirebase: Document ${this.collection}/${this.id} deleted`);
      delete mockDB[this.collection][this.id];
    }
    return Promise.resolve();
  }
}

// Mock Firestore collection reference
class MockCollectionReference {
  constructor(private collection: string) {}

  doc(id: string) {
    return new MockDocumentReference(this.collection, id);
  }
}

// Mock Firestore query
class MockQuery {
  private filters: Array<{
    field: string;
    op: string;
    value: any;
  }> = [];

  constructor(private collection: string) {}

  where(field: string, op: string, value: any) {
    const newQuery = new MockQuery(this.collection);
    newQuery.filters = [...this.filters, { field, op, value }];
    return newQuery;
  }

  async get() {
    console.log(`MockFirebase: Querying ${this.collection} with filters:`, this.filters);
    
    // Start with all documents from the collection
    let docs = Object.entries(mockDB[this.collection] || {}).map(([id, data]) => ({
      id,
      data: () => ({ ...data }),
      exists: true
    }));

    // Apply filters
    this.filters.forEach(filter => {
      docs = docs.filter(doc => {
        const data = doc.data();
        switch (filter.op) {
          case '==':
            return data[filter.field] === filter.value;
          case '>':
            // Handle date comparisons
            if (filter.value instanceof Date) {
              const docDate = new Date(data[filter.field]);
              return docDate > filter.value;
            }
            return data[filter.field] > filter.value;
          case '<':
            return data[filter.field] < filter.value;
          case '>=':
            return data[filter.field] >= filter.value;
          case '<=':
            return data[filter.field] <= filter.value;
          case '!=':
            return data[filter.field] !== filter.value;
          default:
            return true;
        }
      });
    });

    console.log(`MockFirebase: Query returned ${docs.length} results`);
    return { 
      docs,
      forEach(callback: (doc: any) => void) {
        docs.forEach(callback);
      }
    };
  }
}

// Mock Firestore functions
export const doc = (db: any, collection: string, id: string) => {
  console.log(`MockFirebase: Creating document reference for ${collection}/${id}`);
  return new MockDocumentReference(collection, id);
};

export const collection = (db: any, collectionName: string) => {
  console.log(`MockFirebase: Creating collection reference for ${collectionName}`);
  return new MockCollectionReference(collectionName);
};

export const getDoc = async (docRef: MockDocumentReference) => {
  console.log(`MockFirebase: Getting document`, docRef);
  return docRef.get();
};

export const getDocs = async (query: MockQuery) => {
  console.log(`MockFirebase: Getting documents from query`);
  return query.get();
};

export const setDoc = async (docRef: MockDocumentReference, data: any) => {
  console.log(`MockFirebase: Setting document data`, data);
  return docRef.set(data);
};

export const updateDoc = async (docRef: MockDocumentReference, data: any) => {
  console.log(`MockFirebase: Updating document data`, data);
  return docRef.update(data);
};

export const deleteDoc = async (docRef: MockDocumentReference) => {
  console.log(`MockFirebase: Deleting document`);
  return docRef.delete();
};

export const query = (collectionRef: MockCollectionReference, ...queryConstraints: any[]) => {
  console.log(`MockFirebase: Creating query with ${queryConstraints.length} constraints`);
  const mockQuery = new MockQuery((collectionRef as any).collection);
  return queryConstraints.reduce((q, constraint) => constraint(q), mockQuery);
};

export const where = (field: string, op: string, value: any) => {
  console.log(`MockFirebase: Adding where clause ${field} ${op}`, value);
  return (q: MockQuery) => q.where(field, op, value);
};

export const serverTimestamp = () => {
  const timestamp = new Date();
  console.log(`MockFirebase: Created server timestamp ${timestamp}`);
  return timestamp;
};

// Utility function to get a reference to the mock database (for testing/debugging)
export const getMockDB = () => ({ ...mockDB }); 